import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const resourceConfigs = {
  "questions": {
    "title": "question",
    "description": "An interview question along with its suggested answer.",
    "fields": [
      {
        "name": "id",
        "type": "string",
        "required": true,
        "description": "Unique identifier for the question"
      },
      {
        "name": "question_text",
        "type": "string",
        "required": true,
        "description": "The text of the interview question"
      },
      {
        "name": "answer_text",
        "type": "string",
        "required": true,
        "description": "The suggested answer to the question"
      },
      {
        "name": "category",
        "type": "string",
        "required": false,
        "description": "Category of the question (e.g., behavioral, technical, system design)"
      },
      {
        "name": "difficulty_level",
        "type": "string",
        "required": false,
        "description": "Difficulty level of the question (e.g., easy, medium, hard)"
      }
    ]
  }
};

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
      errors.push(`${field.name} is required`);
      continue;
    }

    if (fieldValue !== undefined && !isValidType(fieldValue, field.type)) {
      errors.push(`${field.name} must be of type ${field.type}`);
    }
  }

  return errors;
};

app.get("/", (req, res) => {
  res.json({
    name: "interview-prep-qa",
    description: "Backend for managing interview questions and their answers for interview preparation.",
    resources: Object.keys(resourceConfigs)
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

for (const resourceKey of Object.keys(resourceConfigs)) {
  app.get(`/api/${resourceKey}`, (req, res) => {
    res.json({ success: true, count: stores[resourceKey].items.length, data: stores[resourceKey].items });
  });

  app.get(`/api/${resourceKey}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const item = stores[resourceKey].items.find((entry) => entry.id === id);
    if (!item) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.json({ success: true, data: item });
  });

  app.post(`/api/${resourceKey}`, (req, res) => {
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

  app.put(`/api/${resourceKey}/:id`, (req, res) => {
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

  app.delete(`/api/${resourceKey}/:id`, (req, res) => {
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
  console.log(`Generated backend running on http://localhost:${port}`);
});
