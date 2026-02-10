import type { Request, Response } from "express";
import { query } from "../db/index.js";

// POST / sendMessage
export const sendMessage = async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    const { text } = req.body;

    if (!text) {
        res.status(400).json({ error: "Message text is required"});
        return;
    }
    try {
        const result = await query(
            `INSERT INTO messages (service_id, text) VALUES ($1, $2) RETURNING *`,
            [serviceId, text]
        );
        res.status(201).json({ success:true, data: result.rows[0]});
    } catch (error) {
        res.status(500).json({ error: "Failed to send Message"});
    }
};

// GET // GetMessage

export const getMessage = async (req: Request, res:Response) => {
    const { serviceId } = req.params;

    try {
        const result = await query(
            `SELECT * FROM messages WHERE service_id = $1 ORDER BY created_at DESC`,
            [serviceId]
        );
        res.json({ success: true, count: result.rows.length, messages: result.rows });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages "});
    }
};