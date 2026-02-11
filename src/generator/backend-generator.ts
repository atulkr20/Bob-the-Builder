import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type FieldType = "string" | "number" | "boolean" | "object";

export interface BackendField {
    name: string;
    type: FieldType;
    required: boolean;
    description?: string;
}

export interface BackendResource {
    name: string;
    description: string;
    fields: BackendField[];
}

export interface BackendSpec {
    name: string;
    description: string;
    ttlHours: number;
    serviceType: string;
    resources: BackendResource[];
}

export interface GeneratedBackendArtifact {
    rootDir: string;
    apiBaseUrl: string;
    openApiPath: string;
    runCommand: string;
    endpoints: Array<{ method: string; path: string }>;
}

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) || "generated-backend";

const toPlural = (value: string): string => (value.endsWith("s") ? value : `${value}s`);

const renderResourceConfig = (spec: BackendSpec): string => {
    const config = Object.fromEntries(
        spec.resources.map((resource) => [
            toPlural(slugify(resource.name)),
            {
                title: resource.name,
                description: resource.description,
                fields: resource.fields
            }
        ])
    );
    return JSON.stringify(config, null, 2);
};

const renderServerJs = (spec: BackendSpec): string => `import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const resourceConfigs = ${renderResourceConfig(spec)};

const stores = Object.fromEntries(
  Object.keys(resourceConfigs).map((key) => [key, { items: [], nextId: 1 }])
);

const isValidType = (value, type) => {
  if (type === "string") return typeof value === "string";
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "boolean") return typeof value === "boolean";
  if (type === "object") return typeof value === "object" && value !== null;
  return false;
};

const validatePayload = (resourceKey, payload) => {
  const config = resourceConfigs[resourceKey];
  const errors = [];

  for (const field of config.fields) {
    const fieldValue = payload[field.name];
    if (field.required && (fieldValue === undefined || fieldValue === null)) {
      errors.push(\`\${field.name} is required\`);
      continue;
    }

    if (fieldValue !== undefined && !isValidType(fieldValue, field.type)) {
      errors.push(\`\${field.name} must be of type \${field.type}\`);
    }
  }

  return errors;
};

app.get("/", (req, res) => {
  res.json({
    name: ${JSON.stringify(spec.name)},
    description: ${JSON.stringify(spec.description)},
    resources: Object.keys(resourceConfigs)
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

for (const resourceKey of Object.keys(resourceConfigs)) {
  app.get(\`/api/\${resourceKey}\`, (req, res) => {
    res.json({ success: true, count: stores[resourceKey].items.length, data: stores[resourceKey].items });
  });

  app.get(\`/api/\${resourceKey}/:id\`, (req, res) => {
    const id = Number(req.params.id);
    const item = stores[resourceKey].items.find((entry) => entry.id === id);
    if (!item) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.json({ success: true, data: item });
  });

  app.post(\`/api/\${resourceKey}\`, (req, res) => {
    const errors = validatePayload(resourceKey, req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const item = {
      id: stores[resourceKey].nextId++,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    stores[resourceKey].items.push(item);
    return res.status(201).json({ success: true, data: item });
  });

  app.put(\`/api/\${resourceKey}/:id\`, (req, res) => {
    const id = Number(req.params.id);
    const index = stores[resourceKey].items.findIndex((entry) => entry.id === id);
    if (index < 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const candidate = { ...stores[resourceKey].items[index], ...req.body };
    const errors = validatePayload(resourceKey, candidate);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    stores[resourceKey].items[index] = {
      ...stores[resourceKey].items[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    return res.json({ success: true, data: stores[resourceKey].items[index] });
  });

  app.delete(\`/api/\${resourceKey}/:id\`, (req, res) => {
    const id = Number(req.params.id);
    const index = stores[resourceKey].items.findIndex((entry) => entry.id === id);
    if (index < 0) {
      return res.status(404).json({ error: "Not found" });
    }
    const [deleted] = stores[resourceKey].items.splice(index, 1);
    return res.json({ success: true, data: deleted });
  });
}

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(\`Generated backend running on http://localhost:\${port}\`);
});
`;

const fieldSchema = (field: BackendField): { type: string; description?: string } => {
    const baseType =
        field.type === "object"
            ? { type: "object", additionalProperties: true as const }
            : { type: field.type };
    if (!field.description) return baseType;
    return { ...baseType, description: field.description };
};

const renderOpenApi = (spec: BackendSpec): string => {
    const schemas: Record<string, unknown> = {};
    const paths: Record<string, unknown> = {};
    const endpointList: Array<{ method: string; path: string }> = [];

    for (const resource of spec.resources) {
        const key = toPlural(slugify(resource.name));
        const required = resource.fields.filter((field) => field.required).map((field) => field.name);
        const properties = Object.fromEntries(resource.fields.map((field) => [field.name, fieldSchema(field)]));

        schemas[resource.name] = {
            type: "object",
            required,
            properties
        };

        paths[`/api/${key}`] = {
            get: {
                summary: `List ${key}`,
                responses: { "200": { description: "Successful response" } }
            },
            post: {
                summary: `Create ${resource.name}`,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.name}` }
                        }
                    }
                },
                responses: { "201": { description: "Created" } }
            }
        };

        paths[`/api/${key}/{id}`] = {
            get: {
                summary: `Get ${resource.name} by id`,
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
                responses: { "200": { description: "Successful response" }, "404": { description: "Not found" } }
            },
            put: {
                summary: `Update ${resource.name} by id`,
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${resource.name}` }
                        }
                    }
                },
                responses: { "200": { description: "Updated" }, "400": { description: "Validation failed" } }
            },
            delete: {
                summary: `Delete ${resource.name} by id`,
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
                responses: { "200": { description: "Deleted" }, "404": { description: "Not found" } }
            }
        };

        endpointList.push(
            { method: "GET", path: `/api/${key}` },
            { method: "POST", path: `/api/${key}` },
            { method: "GET", path: `/api/${key}/{id}` },
            { method: "PUT", path: `/api/${key}/{id}` },
            { method: "DELETE", path: `/api/${key}/{id}` }
        );
    }

    const openApi = {
        openapi: "3.0.3",
        info: {
            title: spec.name,
            version: "1.0.0",
            description: spec.description
        },
        servers: [{ url: "http://localhost:4000" }],
        paths,
        components: { schemas }
    };

    return JSON.stringify({ openApi, endpointList }, null, 2);
};

const renderReadme = (spec: BackendSpec, apiBaseUrl: string): string => `# ${spec.name}

${spec.description}

## Generated From
- Service type: ${spec.serviceType}
- TTL (hours): ${spec.ttlHours}

## Run
\`\`\`bash
npm install
npm run dev
\`\`\`

Default URL: \`${apiBaseUrl}\`

## Files
- \`src/server.js\` - Express API runtime
- \`openapi.json\` - API contract for frontend integration
- \`backend-spec.json\` - Normalized AI spec used for generation
`;

export const generateBackendScaffold = async (
    spec: BackendSpec,
    serviceId: number
): Promise<GeneratedBackendArtifact> => {
    const folderName = `${serviceId}-${slugify(spec.name)}-${Date.now()}`;
    const rootDir = path.join(process.cwd(), "generated", folderName);
    const srcDir = path.join(rootDir, "src");
    const apiBaseUrl = "http://localhost:4000";
    const openApiPath = path.join(rootDir, "openapi.json");

    await mkdir(srcDir, { recursive: true });

    const packageJson = {
        name: slugify(spec.name),
        version: "1.0.0",
        type: "module",
        scripts: {
            dev: "node src/server.js"
        },
        dependencies: {
            cors: "^2.8.5",
            express: "^5.1.0"
        }
    };

    const openApiBundle = JSON.parse(renderOpenApi(spec)) as {
        openApi: Record<string, unknown>;
        endpointList: Array<{ method: string; path: string }>;
    };

    await Promise.all([
        writeFile(path.join(rootDir, "package.json"), JSON.stringify(packageJson, null, 2), "utf8"),
        writeFile(path.join(rootDir, ".env.example"), "PORT=4000\n", "utf8"),
        writeFile(path.join(rootDir, "README.md"), renderReadme(spec, apiBaseUrl), "utf8"),
        writeFile(path.join(rootDir, "backend-spec.json"), JSON.stringify(spec, null, 2), "utf8"),
        writeFile(openApiPath, JSON.stringify(openApiBundle.openApi, null, 2), "utf8"),
        writeFile(path.join(srcDir, "server.js"), renderServerJs(spec), "utf8")
    ]);

    return {
        rootDir,
        apiBaseUrl,
        openApiPath,
        runCommand: "npm install && npm run dev",
        endpoints: openApiBundle.endpointList
    };
};
