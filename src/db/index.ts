import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any []) => {
    return pool.query(text, params);
};

export const testDbConnection = async () => {
    try{
        const res = await pool.query('SELECT NOW()');
        console.log('Databse connected succesfully');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // this stops the app if DB is dead
    }
};