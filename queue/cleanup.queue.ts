import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Connecting to Redis
const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null // This is required by BullMQ
});

// Creating the Queue

export const cleanupQueue = new Queue('service-cleanup', { connection });

// Creating Helper function to schedule a cleanup

export const scheduleCleanup = async (serviceId: string, delayMs: number) => {
    console.log(`Scheduling Cleanup for ${serviceId} in ${delayMs/ 1000} seconds`)

    await cleanupQueue.add (
        'destroy-service',
        { serviceId },
        { delay: delayMs}
    );
};
