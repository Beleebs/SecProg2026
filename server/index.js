import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg; 
// grab things from the env file
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// app handles requests
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/message', (req, res) => {
    console.log(`Received request from user`);
    res.json({ message: "Hello from the Express backend!" });
});

app.get('/api/db-check', async (req, res) => {
    try {
        console.log(`Received db request from user`);
        const result = await pool.query('SELECT current_database() AS database');

        const tablesResult = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        res.status(200).json({
            message: 'Database connection successful',
            database: result.rows[0].database,
            tables: tablesResult.rows.map(row => row.table_name)
        });
    }
    catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({ error: 'Database unavailable' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
