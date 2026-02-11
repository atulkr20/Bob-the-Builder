import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setupDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Setting up database...');
    
    // Create tables here
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        service_type VARCHAR(50) NOT NULL DEFAULT 'chat',
        spec_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        expires_at TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Backfill for existing DBs created before service_type was introduced.
    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) NOT NULL DEFAULT 'chat';
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS spec_json JSONB NOT NULL DEFAULT '{}'::jsonb;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_records (
        id SERIAL PRIMARY KEY,
        service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        resource_name VARCHAR(255) NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

setupDatabase();
