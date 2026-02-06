import { type Request, type Response } from "express";
import { z } from "zod";
import { query } from '../db/index.js'


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