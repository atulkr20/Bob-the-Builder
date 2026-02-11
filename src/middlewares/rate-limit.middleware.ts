import type { NextFunction, Request, Response } from "express";

type Bucket = {
    count: number;
    resetAt: number;
};

const buckets = new Map<string, Bucket>();

const getClientKey = (req: Request): string => {
    const forwarded = req.headers["x-forwarded-for"];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return (value || req.ip || "unknown").toString();
};

export const createRateLimiter = (maxRequests: number, windowMs: number) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const now = Date.now();
        const key = `${getClientKey(req)}:${req.baseUrl || req.path}`;
        const bucket = buckets.get(key);

        if (!bucket || now > bucket.resetAt) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }

        if (bucket.count >= maxRequests) {
            const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
            res.setHeader("Retry-After", String(retryAfter));
            res.status(429).json({
                error: "Too many requests. Please retry later.",
                retryAfterSeconds: retryAfter
            });
            return;
        }

        bucket.count += 1;
        next();
    };
};
