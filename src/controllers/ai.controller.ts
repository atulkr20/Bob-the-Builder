import type { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import dotenv from "dotenv";
import { randomBytes } from "node:crypto";
import { query } from "../db/index.js";
import { scheduleCleanup } from "../../queue/cleanup.queue.js";
import {
    generateBackendScaffold,
    type BackendSpec,
    type FieldType
} from "../generator/backend-generator.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];

const ALLOWED_SERVICE_TYPES = ["chat", "notes", "qa", "iot_logger", "crud_api", "webhook_receiver"] as const;
type ServiceType = (typeof ALLOWED_SERVICE_TYPES)[number];

type GoogleModel = {
    name?: string;
    supportedGenerationMethods?: string[];
};

const aiSpecSchema = z.object({
    name: z.string().min(3),
    serviceType: z.enum(ALLOWED_SERVICE_TYPES),
    ttlHours: z.number().min(0.1).max(48),
    description: z.string().min(10),
    resources: z
        .array(
            z.object({
                name: z.string().min(2),
                description: z.string().min(5),
                fields: z
                    .array(
                        z.object({
                            name: z.string().min(1),
                            type: z.enum(["string", "number", "boolean", "object"]),
                            required: z.boolean(),
                            description: z.string().optional()
                        })
                    )
                    .min(1)
            })
        )
        .min(1)
});

const listGenerateContentModels = async (apiKey: string): Promise<string[]> => {
    if (!apiKey) return [];

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
        );

        if (!response.ok) return [];

        const payload = (await response.json()) as { models?: GoogleModel[] };
        return (payload.models || [])
            .filter((model) => (model.supportedGenerationMethods || []).includes("generateContent"))
            .map((model) => model.name?.replace(/^models\//, ""))
            .filter((modelName): modelName is string => Boolean(modelName));
    } catch {
        return [];
    }
};

const unique = (items: string[]): string[] => [...new Set(items.filter(Boolean))];

const inferServiceTypeFromPrompt = (prompt: string): ServiceType => {
    if (/iot|sensor|telemetry|device|metrics|logger/i.test(prompt)) return "iot_logger";
    if (/webhook|callback|event receiver/i.test(prompt)) return "webhook_receiver";
    if (/q&a|\bqa\b|question|ask/i.test(prompt)) return "qa";
    if (/note|notepad|memo|journal/i.test(prompt)) return "notes";
    if (/chat|conversation|messaging/i.test(prompt)) return "chat";
    return "crud_api";
};

const inferFallbackSpec = (prompt: string): BackendSpec => {
    const serviceType = inferServiceTypeFromPrompt(prompt);

    const fallbackByType: Record<ServiceType, BackendSpec> = {
        chat: {
            name: "ephemeral-chat-service",
            serviceType,
            ttlHours: 2,
            description: "Temporary chat backend with message records.",
            resources: [
                {
                    name: "message",
                    description: "Chat messages",
                    fields: [
                        { name: "author", type: "string", required: true },
                        { name: "text", type: "string", required: true }
                    ]
                }
            ]
        },
        notes: {
            name: "ephemeral-notes-service",
            serviceType,
            ttlHours: 2,
            description: "Temporary notes backend with simple entries.",
            resources: [
                {
                    name: "note",
                    description: "User notes",
                    fields: [
                        { name: "title", type: "string", required: true },
                        { name: "content", type: "string", required: true },
                        { name: "tags", type: "object", required: false }
                    ]
                }
            ]
        },
        qa: {
            name: "ephemeral-qa-service",
            serviceType,
            ttlHours: 2,
            description: "Temporary Q&A backend to store questions and answers.",
            resources: [
                {
                    name: "question",
                    description: "Q&A entries",
                    fields: [
                        { name: "question", type: "string", required: true },
                        { name: "answer", type: "string", required: false }
                    ]
                }
            ]
        },
        iot_logger: {
            name: "iot-device-logger",
            serviceType,
            ttlHours: 2,
            description: "Temporary IoT logger to ingest telemetry events.",
            resources: [
                {
                    name: "telemetry_event",
                    description: "IoT telemetry payload",
                    fields: [
                        { name: "deviceId", type: "string", required: true },
                        { name: "payload", type: "object", required: true },
                        { name: "severity", type: "string", required: false }
                    ]
                }
            ]
        },
        crud_api: {
            name: "custom-crud-api",
            serviceType,
            ttlHours: 2,
            description: "Temporary CRUD API generated from prompt intent.",
            resources: [
                {
                    name: "record",
                    description: "Generic records",
                    fields: [
                        { name: "title", type: "string", required: true },
                        { name: "metadata", type: "object", required: false }
                    ]
                }
            ]
        },
        webhook_receiver: {
            name: "webhook-receiver",
            serviceType,
            ttlHours: 2,
            description: "Temporary webhook receiver backend.",
            resources: [
                {
                    name: "webhook_event",
                    description: "Incoming webhook events",
                    fields: [
                        { name: "source", type: "string", required: true },
                        { name: "payload", type: "object", required: true },
                        { name: "eventType", type: "string", required: false }
                    ]
                }
            ]
        }
    };

    return fallbackByType[serviceType];
};

const normalizeSpec = (raw: unknown, prompt: string): BackendSpec => {
    const parseResult = aiSpecSchema.safeParse(raw);

    if (!parseResult.success) {
        return inferFallbackSpec(prompt);
    }

    const cleanedResources = parseResult.data.resources.map((resource) => ({
        ...resource,
        fields: resource.fields.map((field) => {
            const normalizedField: {
                name: string;
                type: FieldType;
                required: boolean;
                description?: string;
            } = {
                name: field.name,
                type: field.type as FieldType,
                required: field.required
            };

            if (field.description) {
                normalizedField.description = field.description;
            }

            return normalizedField;
        })
    }));

    return {
        name: parseResult.data.name,
        serviceType: parseResult.data.serviceType,
        ttlHours: parseResult.data.ttlHours,
        description: parseResult.data.description,
        resources: cleanedResources
    };
};

export const buildInfrastructure = async (req: Request, res: Response): Promise<void> => {
    const { prompt } = req.body as { prompt?: string };

    if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: "Prompt is required" });
        return;
    }

    try {
        const inferredType = inferServiceTypeFromPrompt(prompt);
        const systemPrompt = `
You are a backend architect. Analyze user request and output strict JSON only.

Rules:
1) Decide serviceType from enum: "chat", "notes", "qa", "iot_logger", "crud_api", "webhook_receiver".
2) Return a concise kebab-case project name.
3) ttlHours must be number between 0.1 and 48.
4) resources must contain at least one resource and each resource must contain fields.
5) field.type must be one of: "string", "number", "boolean", "object".
6) No markdown. JSON only.

Preferred serviceType hint for this prompt: "${inferredType}".

JSON format:
{
  "name": "string",
  "serviceType": "chat|notes|qa|iot_logger|crud_api|webhook_receiver",
  "ttlHours": number,
  "description": "string",
  "resources": [
    {
      "name": "string",
      "description": "string",
      "fields": [
        { "name": "string", "type": "string|number|boolean|object", "required": true, "description": "string" }
      ]
    }
  ]
}

User Request: "${prompt}"
`;

        let text = "";
        const apiKey = process.env.GEMINI_API_KEY || "";
        const discoveredModels = await listGenerateContentModels(apiKey);
        const modelsToTry = unique([GEMINI_MODEL, ...discoveredModels, ...FALLBACK_MODELS]);
        const attemptErrors: string[] = [];

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(systemPrompt);
                const response = await result.response;
                text = response.text();
                break;
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                attemptErrors.push(`${modelName}: ${message}`);
            }
        }

        if (!text) {
            throw new Error(
                `No Gemini model succeeded. Tried: ${modelsToTry.join(", ")}. Errors: ${attemptErrors.join(" | ")}`
            );
        }

        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson) as unknown;
        const spec = normalizeSpec(parsed, prompt);

        const expiresAt = new Date(Date.now() + spec.ttlHours * 60 * 60 * 1000);
        const accessToken = randomBytes(24).toString("hex");

        const dbResult = await query(
            `INSERT INTO services (name, service_type, access_token, spec_json, expires_at, status)
             VALUES ($1, $2, $3, $4::jsonb, $5, 'ACTIVE')
             RETURNING *`,
            [spec.name, spec.serviceType, accessToken, JSON.stringify(spec), expiresAt]
        );

        const newService = dbResult.rows[0] as {
            id: number;
            name: string;
            service_type: string;
            expires_at: Date;
        };

        const artifact = await generateBackendScaffold(spec, newService.id);
        const liveBasePath = `/generated/${newService.id}`;
        const liveEndpoints = spec.resources.flatMap((resource) => {
            const keyBase = resource.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
            const resourceKey = keyBase.endsWith("s") ? keyBase : `${keyBase}s`;
            return [
                { method: "GET", path: `${liveBasePath}/${resourceKey}` },
                { method: "POST", path: `${liveBasePath}/${resourceKey}` },
                { method: "GET", path: `${liveBasePath}/${resourceKey}/{id}` },
                { method: "PUT", path: `${liveBasePath}/${resourceKey}/{id}` },
                { method: "DELETE", path: `${liveBasePath}/${resourceKey}/{id}` }
            ];
        });

        const delay = new Date(newService.expires_at).getTime() - Date.now();
        if (delay > 0) {
            await scheduleCleanup(String(newService.id), delay);
        }

        res.status(201).json({
            success: true,
            message: "Backend scaffold generated successfully",
            aiResponse: spec.description,
            data: {
                serviceId: newService.id,
                name: newService.name,
                serviceType: newService.service_type,
                expiresAt: newService.expires_at,
                ttlHours: spec.ttlHours,
                accessToken,
                resources: spec.resources,
                generatedProject: {
                    path: artifact.rootDir,
                    openApiPath: artifact.openApiPath,
                    apiBaseUrl: artifact.apiBaseUrl,
                    runCommand: artifact.runCommand,
                    endpoints: artifact.endpoints
                },
                liveApi: {
                    basePath: liveBasePath,
                    meta: `${liveBasePath}/meta?token=${accessToken}`,
                    endpoints: liveEndpoints
                }
            }
        });
    } catch (error) {
        console.error("AI build failed:", error);
        res.status(500).json({ error: "AI Architect failed to generate backend scaffold" });
    }
};
