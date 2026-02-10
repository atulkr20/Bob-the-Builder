import { type Request, type Response } from "express";
import { z } from "zod";
import { query } from '../db/index.js'
import { scheduleCleanup } from "../../queue/cleanup.queue.js";
import { delay } from "bullmq";

// Defining validation Schema

const createServiceSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 chars"),
    ttlHours: z.number().min(0.1).max(48, "TTL must be between 0.1 and  48 hours")
});

export const createService = async (req: Request, res: Response): Promise<void> => {
    try{
        // Validating the input
        const validData = createServiceSchema.parse(req.body);

        // Calculating Expiring Time
        const expiresAt = new Date(Date.now() + validData.ttlHours * 60 * 60 * 1000);

        // Saving to DB
        const result = await query(
            `INSERT INTO services (name, expires_at, status)
            VALUES ($1, $2, 'ACTIVE' )
            RETURNING *`,
            [validData.name, expiresAt]
        );

        const newService = result.rows[0];

        // Calculate delay in milliseconds
        const delay = newService.expires_at.getTime() - Date.now();

        // Schedule the Reaper 
        if (delay > 0 ) {
            await scheduleCleanup(newService.id, delay);
        }

        // Responding to User 
        res.status(201).json({
            success: true,
            message: "Service created Successfully",
            data:{
                serviceId: newService.id,
                name: newService.name,
                expiresAt: newService.expires_at,

                // The URLS the user will use Next
                endpoints: {
                    send: `POST /${newService.id}/message`,
                    read: `GET /${newService.id}/messages`
                }

            }

        });


    } catch (error) {
        // Handling Validation errors 
        if(error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
            return;
        }
        console.error(error);
        res.status(500).json({ error: "Internal Server Error"})
    }

};

export const renewService = async (req: Request, res: Response): Promise<void> => {
    const { serviceId } = req.params;
    const { ttlHours } = req.body;

    if (!ttlHours || ttlHours < 0.1 || ttlHours > 48) {
        res.status(400).json({ error: "ttlHours must be between 0.1 and 48 hours" });
        return;
    }

    try {
        const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
        
        const result = await query(
            `UPDATE services 
             SET expires_at = $1, status = 'ACTIVE' 
             WHERE id = $2 
             RETURNING *`,
            [expiresAt, serviceId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: "Service not found" });
            return;
        }

        res.json({
            success: true,
            message: "Service renewed successfully",
            data: {
                serviceId: result.rows[0].id,
                expiresAt: result.rows[0].expires_at,
                status: result.rows[0].status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};