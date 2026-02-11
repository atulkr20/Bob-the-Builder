import type { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "../db/index.js";
import { scheduleCleanup } from "../../queue/cleanup.queue.js";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
export const buildInfrastructure = async (req: Request, res: Response): Promise<void> => {
const { prompt } = req.body;

if(!prompt) {
    res.status(400).json({ error: "Prompt is required "});
    return;

}
 try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Strict System Instruction
    const systemPrompt = `
    you are a Backend Insfrastructure Architect.
    Analyze the user's request and strictly output valid JSON.
    
    Rules:
    1. Extract a suitable "name" (slug-case).
    2. specific "ttlHours" (number). If they say "tomorrow", calculate hours. Default is 2.
    3. "description" (short summary of what you built).
    4. Output JSON ONLY. No markdown, no text.
    
    Format:
    { "name": "string", "ttlHours": number, "description": "string"}
     
    User Request: "${prompt}"
    `;

    // Ask AI
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean the output
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(cleanJson);

    if (!aiData?.name || typeof aiData.ttlHours !== "number" || !aiData?.description) {
        res.status(502).json({ error: "AI response format was invalid" });
        return;
    }

    // Automatically Executre the build
    const expiresAt = new Date(Date.now() + aiData.ttlHours * 60 * 60 * 1000);

    const dbResult = await query(
        `INSERT INTO services (name, expires_at, status)
        VALUES ($1, $2, 'ACTIVE')
        RETURNING *`,
        [aiData.name, expiresAt]

    );

    const newService = dbResult.rows[0];

    // Scheduling Cleanup
    const delay = newService.expires_at.getTime() - Date.now();

    if(delay > 0) {
        await scheduleCleanup(newService.id, delay);
    }

    // Returning the Response 

    res.status(201).json({
        success: true, 
        message: "AI has constructed your infrastructure",
        aiResponse: aiData.description,
        data: {
            serviceId: newService.id,
            name: newService.name,
            expiresAt: newService.expires_at,
            ttlHours: aiData.ttlHours

        }
    });

 } catch (error) {
    console.error("AI build failed:", error);
    res.status(500).json({ error: "AI Architect failed to Parse request"});

 }

};
