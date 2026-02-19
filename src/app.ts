import express from 'express';
import cors from 'cors';
import serviceRoutes from './routes/services.routes.js'
import messageRoutes from "./routes/message.routes.js"
import aiRoutes from './routes/ai.routes.js'
import generatedRoutes from './routes/generated.routes.js'
import { query } from "./db/index.js";
import RedisModule from "ioredis";
// @ts-ignore - ioredis ESM compatibility
const Redis = RedisModule.default || RedisModule;
const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

//middleware

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("CORS origin not allowed"));
    }
}));
app.use(express.static('public'));
app.use(express.json());
app.use('/ai',aiRoutes);

const metrics = {
    startedAt: Date.now(),
    totalRequests: 0,
    totalErrors: 0,
    totalLatencyMs: 0
};

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        metrics.totalRequests += 1;
        metrics.totalLatencyMs += duration;
        if (res.statusCode >= 500) {
            metrics.totalErrors += 1;
        }
    });
    next();
});

const redisEnabled = Boolean(process.env.REDIS_HOST || process.env.REDIS_PORT);
const redis = redisEnabled
    ? new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true
    })
    : null;

const pingRedis = async (): Promise<"connected" | "timeout" | "error" | "disabled"> => {
    if (!redis) return "disabled";
    try {
        const result = await Promise.race([
            redis.ping(),
            new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 500))
        ]);
        if (result === "timeout") return "timeout";
        return "connected";
    } catch {
        return "error";
    }
};

// Routes 
app.use('/services', serviceRoutes)
app.use('/generated/:serviceId', generatedRoutes);
app.use('/:serviceId', messageRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Bob the builder is up and running"})
});

app.get("/health", async (_req, res) => {
    const health = {
        ok: true,
        uptimeSec: Math.floor(process.uptime()),
        db: "unknown" as "connected" | "error" | "unknown",
        redis: "unknown" as "connected" | "timeout" | "error" | "disabled" | "unknown"
    };

    try {
        await query("SELECT 1");
        health.db = "connected";
    } catch {
        health.ok = false;
        health.db = "error";
    }

    health.redis = await pingRedis();
    if (health.redis !== "connected" && health.redis !== "disabled") {
        health.ok = false;
    }

    res.status(health.ok ? 200 : 503).json(health);
});

app.get("/metrics", (_req, res) => {
    const avgLatencyMs =
        metrics.totalRequests === 0 ? 0 : Math.round(metrics.totalLatencyMs / metrics.totalRequests);
    res.json({
        uptimeSec: Math.floor((Date.now() - metrics.startedAt) / 1000),
        totalRequests: metrics.totalRequests,
        totalErrors: metrics.totalErrors,
        avgLatencyMs
    });
});

export default app;
