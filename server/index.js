import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt'
import { body, validationResult } from "express-validator";

const { Pool } = pg; 
// grab things from the env file
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const saltRounds = 10;

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

app.post('/api/db-register',
    [
        [
         body('email').isEmail(),
         body('password').notEmpty(),
        ],
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({ errors: errors.array() });
        }

        const user_email_check = await pool.query(`select count(*) from users u where u.email = $1`, [req.body.email]);
        console.log(user_email_check.rows[0]['count']);

        if (user_email_check.rows[0]['count'] !== '0'){
            console.log('email fail');
            return res.status(400).json({ errors: 'Account already attached to email' });
        }

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(req.body.password, salt, async function (err, hash) {
                // returns hash
                console.log(hash);
                const result = await pool.query(`INSERT INTO users (email, password_hash, user_role, is_active)
                                                 VALUES ($1, $2, 'regUser', false)`, [req.body.email, hash]);
                console.log(result);
            });
        });

        res.status(200).json({
            contents: "Registered Successfully"
        });

    }
    catch (error) {
        console.error('Failed Database Query:', error);
        res.status(403).json({ error: 'Database unavailable' });
    }
});

// app.post('/api/db-register',
//     [
//         [
//             body('email').isEmail(),
//             body('password').notEmpty(),
//         ],
//     ],
//     async (req, res) => {
//         try {
//             const errors = validationResult(req);
//             if (!errors.isEmpty())
//             {
//                 return res.status(400).json({ errors: errors.array() });
//             }

//             console.log(req.body.email + " " + req.body.password);



//             res.status(200).json({
//                 contents: "Registered Successfully"
//             });

//         }
//         catch (error) {
//             console.error('Failed Database Query:', error);
//             res.status(403).json({ error: 'Database unavailable' });
//         }
//     });

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

// in a room, we get the rooms connected
app.post('/api/get-room-connections', async (req, res) => {
    try {
        console.log(`Received db room connection request from user`);
        const result = await pool.query(`SELECT * FROM room_connection WHERE room1_id = $1`, [req.body.room]);

        res.status(200).json({
            contents: result.rows
        });
        
    } catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({ error: 'Database unavailable' });
    }
});

app.post('/api/enter-room', async (req, res) => {
    try {
        let today = new Date().toISOString().slice(0, 10);
        const event_id = await pool.query(`select ge.id from gallery_events ge where ge.room_id = $1 and ge.event_date = $2`, [req.body.room, today]);
        console.log(event_id.rows.length);
        let images;

        if (event_id.rows.length !== 0)
        {
            images = await pool.query(`select a.image_path, a.art_name, a.art_description, a.artist from art a where a.event_id = $1`, [event_id.rows[0]['id']]);
        }
        else
        {
            const default_event = await pool.query(`select ge.id from gallery_events ge where ge.room_id = $1`, [req.body.room]);
            if (default_event.rows.length === 0) {
                return res.status(200).json({ contents: [] });
            }
            images = await pool.query(`select a.image_path, a.art_name, a.art_description, a.artist from art a where a.event_id = $1`, [default_event.rows[0]['id']]);
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
