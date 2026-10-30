import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt'
import {body, validationResult} from "express-validator";
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';

const pgSession = connectPgSimple(session);

const {Pool} = pg;
// grab things from the env file
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const sessionConfig = {
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    name: 'SID',
    secret: generateRandomString(14),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: true,
        secure: false,
        httpOnly: true
    }
}

const saltRounds = 10;

function generateRandomString(length = 16, customChars = null) {
    const defaultChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const chars = customChars || defaultChars;

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
    }

    return result;
}

// app handles requests
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session(sessionConfig));

app.get('/api/message', (req, res) => {
    console.log(`Received request from user`);
    res.json({message: "Hello from the Express backend!"});
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
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const user_email_check = await pool.query(`select count(*)
                                                       from users u
                                                       where u.email = $1`, [req.body.email]);
            console.log(user_email_check.rows[0]['count']);

            if (user_email_check.rows[0]['count'] !== '0') {
                console.log('email fail');
                return res.status(400).json({errors: 'Account already attached to email'});
            }

            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    // returns hash
                    console.log(hash);
                    const result = await pool.query(`INSERT INTO users (email, password_hash, user_role)
                                                     VALUES ($1, $2, 'guest')`, [req.body.email, hash]);
                    console.log(result);
                });
            });

            res.status(200).json({
                contents: "Registered Successfully"
            });

        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(403).json({error: 'Database unavailable'});
        }
    });

app.post('/api/db-login',
    [
        [
            body('email').isEmail(),
            body('password').notEmpty(),
        ],
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const hashed_password = await pool.query(`select u.password_hash, u.id
                                                      from users u
                                                      where u.email = $1`, [req.body.email]);

            if (hashed_password.rows.length === 0) {
                res.status(400).json({
                    errors: "Incorrect Email or Password"
                });
            }

            bcrypt.compare(req.body.password, hashed_password.rows[0]['password_hash'], async function (err, result) {
                if (result) {
                    console.log(req.sessionID);
                    req.session.save(async (err) => {
                        if (err) {
                            return res.status(500).send('Database save failed');
                        }

                        const getPerson = await pool.query(`select p.user_id from persons p where p.user_id = $1`, [hashed_password.rows[0]['id']]);

                        if (getPerson.rows.length === 0)
                        {
                            const addPerson = await pool.query(`insert into persons(user_id, session_id) values ($1, $2)`, [hashed_password.rows[0]['id'], req.sessionID])
                            console.log('getRoom');
                            const getRoomID = await pool.query(`select r.id from rooms r where r.room_name = $1`, ['lobby']);
                            console.log('addState');
                            const addPersonState = await pool.query(`insert into person_state(user_id, in_gallery, current_room_id) values ($1, true, $2)`, [hashed_password.rows[0]['id'], getRoomID.rows[0]['id']]);
                        }
                        else
                        {
                            const addPerson = await pool.query(`update persons set session_id = $2 where user_id = $1`, [hashed_password.rows[0]['id'], req.sessionID])
                            console.log('getRoom');
                            const getRoomID = await pool.query(`select r.id from rooms r where r.room_name = $1`, ['lobby']);
                            console.log('addState');
                            const addPersonState = await pool.query(`update person_state ps set current_room_id = $2 where user_id = $1;`, [hashed_password.rows[0]['id'], getRoomID.rows[0]['id']]);
                        }


                        res.status(200).json({
                            contents: "Signed In Successfully"
                        });
                    });
                } else {
                    res.status(400).json({
                        errors: "Incorrect Email or Password"
                    });
                }
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(403).json({error: 'Service unavailable'});
        }
    });

app.get('/api/get-rooms', async (req, res) => {
    try {
        console.log(`Received db query request from user`);
        const result = await pool.query(`SELECT *
                                         FROM rooms`);

        res.status(200).json({
            contents: result.rows
        });
    } catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({error: 'Service unavailable'});
    }
});

app.post('/api/enter-room', async (req, res) => {
    try {
        let today = new Date().toISOString().slice(0, 10);
        const event_id = await pool.query(`select ge.id
                                           from gallery_events ge
                                           where ge.room_id = $1
                                             and ge.event_date = $2`, [req.body.room, today]);
        console.log(event_id.rows.length);
        let images;

        if (event_id.rows.length !== 0) {
            images = await pool.query(`select a.image_path, a.art_name, a.art_description, a.artist
                                       from art a
                                       where a.event_id = $1`, [event_id.rows[0]['id']]);
        } else {
            const default_event = await pool.query(`select ge.id
                                                    from gallery_events ge
                                                    where ge.room_id = $1`, [req.body.room]);
            images = await pool.query(`select a.image_path, a.art_name, a.art_description, a.artist
                                       from art a
                                       where a.event_id = $1`, [default_event.rows[0]['id']]);
        }

        res.status(200).json({
            contents: images.rows
        });
    } catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({error: 'Service unavailable'});
    }
});

app.post('/api/fetch-image', async (req, res) => {
    try {
        console.log(req.body.image);
        res.sendFile('/data/images/' + req.body.image);
    } catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({error: 'Service unavailable'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
