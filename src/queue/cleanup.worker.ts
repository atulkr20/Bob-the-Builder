import { Worker } from 'bullmq';
import RedisModule from 'ioredis';
// @ts-ignore - ioredis ESM compatibility
const Redis = RedisModule.default || RedisModule;
import { query } from '../db/index.js';

let connection;
let cleanupWorker;

try {
    connection = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        maxRetriesPerRequest: null
    });
    connection.on('error', (err) => {
        console.warn('Redis connection error (cleanup worker disabled):', err.message);
    });
    connection.on('connect', () => {
        console.log('Redis connected successfully for cleanup worker');
    });
    
    cleanupWorker = new Worker('service-cleanup', async (job) => {
        const { serviceId } = job.data;
        console.log(`Worker wiring up, Destroying Service: ${serviceId}`);
        
        try {
            // Deleting all Messages first
            await query('DELETE FROM messages WHERE service_id = $1', [serviceId]);
            await query('DELETE FROM service_records WHERE service_id = $1', [serviceId]);

            // Mark Service as Destroyed
            await query(
                "UPDATE services SET status = 'DESTROYED' WHERE id = $1",
                [serviceId] 
            );

            console.log(`Service ${serviceId} successfully nuked`);
        } catch(error) {
            console.error(`Failed to cleanup service ${serviceId}`, error);
        }
    }, { connection });
} catch (err) {
    console.warn('Failed to initialize Redis connection (cleanup worker disabled):', err);
}
