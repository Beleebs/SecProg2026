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
app.use(express.urlencoded({ extended: true }));

app.get('/api/message', (req, res) => {
    console.log(`Received request from user`);
    res.json({ message: "Hello from the Express backend!" });
});

app.post('/api/db-login', async (req, res) => {
    try {
        console.log(req.body.name + " " + req.body.pass);
        const result = await pool.query(`SELECT * FROM rooms`);

        res.status(200).json({
            contents: result.rows
        });
    }
    catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({ error: 'Database unavailable' });
    }
});

app.get('/api/get-rooms', async (req, res) => {
    try {
        console.log(`Received db query request from user`);
        const result = await pool.query(`SELECT * FROM rooms`);

        res.status(200).json({
            contents: result.rows
        });
    }
    catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({ error: 'Database unavailable' });
    }
});

app.post('/api/enter-room', async (req, res) => {
    try {
        console.log(`Get Room`);
        console.log(req.body.room);
        const roomID = await pool.query(`select r.id from rooms r where r.room_name = $1`, [req.body.room]);
        console.log(roomID.rows[0]['id']);

        const images = await pool.query(`select a.image_path, a.art_name, a.art_description, a.artist from art a where a.room_id = $1`, [roomID.rows[0]['id']]);

        for (let i = 0; i < images.rows.length; i++)
        {
            console.log(images.rows[0]['image_path'] + " " + images.rows[0]['art_name'] + " " + images.rows[0]['art_description'] + " " + images.rows[0]['artist']);
        }

        res.status(200).json({
            contents: images.rows
        });
    }
    catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({ error: 'Database unavailable' });
    }
});

app.post('/api/fetch-image', async (req, res) => {
    try {
        console.log(req.body.image);
        res.sendFile('/data/images/' + req.body.image);
    }
    catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({ error: 'Database unavailable' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
