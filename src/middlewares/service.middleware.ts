import type { Request, Response, NextFunction } from 'express';
import { query } from '../db/index.js';

// This wil help access next Function without querying DB again

declare global {
    namespace Express {
        interface Request {
            service?: any;
        }
    }
}

export const validateService = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { serviceId } = req.params;

        // Check if the service Exists
        const result = await query('SELECT * FROM services WHERE id = $1', [serviceId]);
        if(result.rows.length === 0) {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        const service = result.rows[0];

        // Check if destroyed or expired

        const now = new Date();
        const isExpired = new Date(service.expires_at) < now;
        const isDestroyed = service.status === 'DESTROYED';

        if(isExpired || isDestroyed ) {
            res.status(410).json({
                error: "Service Expired",
                message: "This infrastructure is Destroyed"
            });
            return;
        }

        // Atach service to request object
        next();
    } catch (error) {
        console.error("validateService error:", error);
        const details = error instanceof Error ? error.message : String(error);
        res.status(500).json({
            error: "Internal Server Error Checking Service Status",
            details
        });
    }


    
};
