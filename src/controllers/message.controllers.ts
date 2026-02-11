import type { Request, Response } from "express";
import { query } from "../db/index.js";

// POST / sendMessage
export const sendMessage = async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    const { text, note, question, deviceId, payload } = req.body;
    const serviceType = req.service?.service_type || "chat";

    const incomingText =
        serviceType === "iot_logger" && payload !== undefined
            ? JSON.stringify({
                deviceId: typeof deviceId === "string" ? deviceId : "unknown-device",
                payload,
                receivedAt: new Date().toISOString()
            })
        : typeof text === "string" ? text :
        typeof note === "string" ? note :
        typeof question === "string" ? question :
        "";

    if (!incomingText.trim()) {
        res.status(400).json({ error: "Message text is required"});
        return;
    }
    try {
        const result = await query(
            `INSERT INTO messages (service_id, text) VALUES ($1, $2) RETURNING *`,
            [serviceId, incomingText]
        );

        const messageByType =
            serviceType === "iot_logger" ? "Telemetry logged successfully" :
            serviceType === "notes" ? "Note saved successfully" :
            serviceType === "qa" ? "Question submitted successfully" :
            "Message sent successfully";

        res.status(201).json({
            success: true,
            serviceType,
            message: messageByType,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to send Message"});
    }
};

// GET // GetMessage

export const getMessage = async (req: Request, res:Response) => {
    const { serviceId } = req.params;
    const serviceType = req.service?.service_type || "chat";

    try {
        const result = await query(
            `SELECT * FROM messages WHERE service_id = $1 ORDER BY created_at DESC`,
            [serviceId]
        );
        res.json({
            success: true,
            serviceType,
            count: result.rows.length,
            messages: result.rows
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages "});
    }
};
