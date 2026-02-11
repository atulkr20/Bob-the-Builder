import type { Request, Response } from "express";
import { query } from "../db/index.js";

type FieldType = "string" | "number" | "boolean" | "object";

type SpecField = {
    name: string;
    type: FieldType;
    required: boolean;
    description?: string;
};

type SpecResource = {
    name: string;
    description: string;
    fields: SpecField[];
};

type ServiceSpec = {
    name: string;
    description: string;
    serviceType: string;
    ttlHours: number;
    resources: SpecResource[];
};

const normalizeKey = (value: string): string => {
    const base = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!base) return "records";
    return base.endsWith("s") ? base : `${base}s`;
};

const isValidType = (value: unknown, type: FieldType): boolean => {
    if (type === "string") return typeof value === "string";
    if (type === "number") return typeof value === "number" && Number.isFinite(value);
    if (type === "boolean") return typeof value === "boolean";
    if (type === "object") return typeof value === "object" && value !== null && !Array.isArray(value);
    return false;
};

const getSpec = (req: Request): ServiceSpec | null => {
    const raw = req.service?.spec_json as unknown;
    if (!raw || typeof raw !== "object") return null;
    const asSpec = raw as Partial<ServiceSpec>;
    if (!Array.isArray(asSpec.resources) || asSpec.resources.length === 0) return null;
    return asSpec as ServiceSpec;
};

const findResource = (spec: ServiceSpec, resourceParam: string): SpecResource | null => {
    const byKey = new Map<string, SpecResource>();
    for (const resource of spec.resources) {
        byKey.set(normalizeKey(resource.name), resource);
    }
    return byKey.get(normalizeKey(resourceParam)) || null;
};

const validatePayload = (resource: SpecResource, payload: Record<string, unknown>): string[] => {
    const errors: string[] = [];
    for (const field of resource.fields) {
        const value = payload[field.name];
        if (field.required && (value === undefined || value === null)) {
            errors.push(`${field.name} is required`);
            continue;
        }
        if (value !== undefined && !isValidType(value, field.type)) {
            errors.push(`${field.name} must be ${field.type}`);
        }
    }
    return errors;
};

const parsePayload = (raw: unknown): Record<string, unknown> | null => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    return raw as Record<string, unknown>;
};

const getParamAsString = (value: string | string[] | undefined): string | null => {
    if (typeof value === "string" && value.trim()) return value.trim();
    return null;
};

export const getGeneratedMeta = async (req: Request, res: Response): Promise<void> => {
    const spec = getSpec(req);
    if (!spec) {
        res.status(404).json({ error: "Generated spec not found for this service" });
        return;
    }

    const serviceId = req.params.serviceId;
    const basePath = `/generated/${serviceId}`;
    const resources = spec.resources.map((resource) => {
        const key = normalizeKey(resource.name);
        return {
            key,
            name: resource.name,
            description: resource.description,
            fields: resource.fields,
            endpoints: {
                list: `GET ${basePath}/${key}`,
                create: `POST ${basePath}/${key}`,
                getById: `GET ${basePath}/${key}/{id}`,
                update: `PUT ${basePath}/${key}/{id}`,
                delete: `DELETE ${basePath}/${key}/{id}`
            }
        };
    });

    res.json({
        success: true,
        serviceId: Number(serviceId),
        serviceType: req.service?.service_type,
        name: spec.name,
        description: spec.description,
        resources
    });
};

export const listGeneratedRecords = async (req: Request, res: Response): Promise<void> => {
    const spec = getSpec(req);
    if (!spec) {
        res.status(404).json({ error: "Generated spec not found for this service" });
        return;
    }

    const resourceParam = getParamAsString(req.params.resource);
    if (!resourceParam) {
        res.status(400).json({ error: "Resource is required" });
        return;
    }
    const resource = findResource(spec, resourceParam);
    if (!resource) {
        res.status(404).json({ error: "Unknown resource for this service" });
        return;
    }

    const resourceKey = normalizeKey(resource.name);
    const result = await query(
        `SELECT id, payload, created_at, updated_at
         FROM service_records
         WHERE service_id = $1 AND resource_name = $2
         ORDER BY id DESC`,
        [req.params.serviceId, resourceKey]
    );

    const items = result.rows.map((row) => ({
        id: row.id,
        ...row.payload,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }));

    res.json({ success: true, resource: resourceKey, count: items.length, data: items });
};

export const createGeneratedRecord = async (req: Request, res: Response): Promise<void> => {
    const spec = getSpec(req);
    if (!spec) {
        res.status(404).json({ error: "Generated spec not found for this service" });
        return;
    }

    const resourceParam = getParamAsString(req.params.resource);
    if (!resourceParam) {
        res.status(400).json({ error: "Resource is required" });
        return;
    }
    const resource = findResource(spec, resourceParam);
    if (!resource) {
        res.status(404).json({ error: "Unknown resource for this service" });
        return;
    }

    const payload = parsePayload(req.body);
    if (!payload) {
        res.status(400).json({ error: "Body must be a JSON object" });
        return;
    }

    const errors = validatePayload(resource, payload);
    if (errors.length > 0) {
        res.status(400).json({ error: "Validation failed", details: errors });
        return;
    }

    const resourceKey = normalizeKey(resource.name);
    const result = await query(
        `INSERT INTO service_records (service_id, resource_name, payload)
         VALUES ($1, $2, $3::jsonb)
         RETURNING id, payload, created_at, updated_at`,
        [req.params.serviceId, resourceKey, JSON.stringify(payload)]
    );

    const row = result.rows[0];
    res.status(201).json({
        success: true,
        resource: resourceKey,
        data: {
            id: row.id,
            ...row.payload,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }
    });
};

export const getGeneratedRecordById = async (req: Request, res: Response): Promise<void> => {
    const spec = getSpec(req);
    if (!spec) {
        res.status(404).json({ error: "Generated spec not found for this service" });
        return;
    }

    const resourceParam = getParamAsString(req.params.resource);
    if (!resourceParam) {
        res.status(400).json({ error: "Resource is required" });
        return;
    }
    const resource = findResource(spec, resourceParam);
    if (!resource) {
        res.status(404).json({ error: "Unknown resource for this service" });
        return;
    }

    const resourceKey = normalizeKey(resource.name);
    const result = await query(
        `SELECT id, payload, created_at, updated_at
         FROM service_records
         WHERE service_id = $1 AND resource_name = $2 AND id = $3`,
        [req.params.serviceId, resourceKey, req.params.id]
    );

    if (result.rows.length === 0) {
        res.status(404).json({ error: "Record not found" });
        return;
    }

    const row = result.rows[0];
    res.json({
        success: true,
        resource: resourceKey,
        data: {
            id: row.id,
            ...row.payload,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }
    });
};

export const updateGeneratedRecord = async (req: Request, res: Response): Promise<void> => {
    const spec = getSpec(req);
    if (!spec) {
        res.status(404).json({ error: "Generated spec not found for this service" });
        return;
    }

    const resourceParam = getParamAsString(req.params.resource);
    if (!resourceParam) {
        res.status(400).json({ error: "Resource is required" });
        return;
    }
    const resource = findResource(spec, resourceParam);
    if (!resource) {
        res.status(404).json({ error: "Unknown resource for this service" });
        return;
    }

    const payload = parsePayload(req.body);
    if (!payload) {
        res.status(400).json({ error: "Body must be a JSON object" });
        return;
    }

    const resourceKey = normalizeKey(resource.name);
    const current = await query(
        `SELECT id, payload FROM service_records
         WHERE service_id = $1 AND resource_name = $2 AND id = $3`,
        [req.params.serviceId, resourceKey, req.params.id]
    );

    if (current.rows.length === 0) {
        res.status(404).json({ error: "Record not found" });
        return;
    }

    const merged = { ...current.rows[0].payload, ...payload };
    const errors = validatePayload(resource, merged);
    if (errors.length > 0) {
        res.status(400).json({ error: "Validation failed", details: errors });
        return;
    }

    const updated = await query(
        `UPDATE service_records
         SET payload = $1::jsonb, updated_at = NOW()
         WHERE service_id = $2 AND resource_name = $3 AND id = $4
         RETURNING id, payload, created_at, updated_at`,
        [JSON.stringify(merged), req.params.serviceId, resourceKey, req.params.id]
    );

    const row = updated.rows[0];
    res.json({
        success: true,
        resource: resourceKey,
        data: {
            id: row.id,
            ...row.payload,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }
    });
};

export const deleteGeneratedRecord = async (req: Request, res: Response): Promise<void> => {
    const spec = getSpec(req);
    if (!spec) {
        res.status(404).json({ error: "Generated spec not found for this service" });
        return;
    }

    const resourceParam = getParamAsString(req.params.resource);
    if (!resourceParam) {
        res.status(400).json({ error: "Resource is required" });
        return;
    }
    const resource = findResource(spec, resourceParam);
    if (!resource) {
        res.status(404).json({ error: "Unknown resource for this service" });
        return;
    }

    const resourceKey = normalizeKey(resource.name);
    const result = await query(
        `DELETE FROM service_records
         WHERE service_id = $1 AND resource_name = $2 AND id = $3
         RETURNING id, payload, created_at, updated_at`,
        [req.params.serviceId, resourceKey, req.params.id]
    );

    if (result.rows.length === 0) {
        res.status(404).json({ error: "Record not found" });
        return;
    }

    const row = result.rows[0];
    res.json({
        success: true,
        resource: resourceKey,
        data: {
            id: row.id,
            ...row.payload,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }
    });
};
