import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
    ...(process.env.REDIS_TLS === 'true' ? { tls: {} } : {})
};

// Connecting to Redis
const connection = new Redis(redisOptions);

// Creating the Queue

export const cleanupQueue = new Queue('service-cleanup', { connection });

// Creating Helper function to schedule a cleanup

export const scheduleCleanup = async (serviceId: string | number, delayMs: number) => {
    const serviceKey = String(serviceId);
    const jobId = `cleanup-${serviceKey}`;
    console.log(`Scheduling Cleanup for ${serviceKey} in ${delayMs / 1000} seconds`);

    // Keep exactly one pending cleanup job per service to avoid stale destruction after renewals.
    const existingJob = await cleanupQueue.getJob(jobId);
    if (existingJob) {
        await existingJob.remove();
    }

    await cleanupQueue.add (
        'destroy-service',
        { serviceId: serviceKey },
        { delay: delayMs, jobId, removeOnComplete: true, removeOnFail: 20 }
    );
};
