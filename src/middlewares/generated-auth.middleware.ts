import type { NextFunction, Request, Response } from "express";

const getBearerToken = (authorization?: string): string | null => {
    if (!authorization) return null;
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return null;
    return token.trim();
};

export const requireServiceToken = (req: Request, res: Response, next: NextFunction): void => {
    const expectedToken = req.service?.access_token;
    if (!expectedToken) {
        res.status(403).json({ error: "Service token is not configured" });
        return;
    }

    const headerToken = (req.headers["x-service-token"] as string | undefined)?.trim();
    const queryToken = typeof req.query.token === "string" ? req.query.token.trim() : undefined;
    const bearerToken = getBearerToken(req.headers.authorization);
    const providedToken = headerToken || queryToken || bearerToken;

    if (!providedToken || providedToken !== expectedToken) {
        res.status(401).json({ error: "Unauthorized. Missing or invalid service token." });
        return;
    }

    next();
};
