import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt'
import {body, validationResult} from "express-validator";
import pg from 'pg';
import jwt from 'jsonwebtoken'
import multer from 'multer';
import { unlink } from 'node:fs'

const {Pool} = pg;
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
app.use(express.urlencoded({extended: true}));

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
})
let upload = multer({dest: '/data/images/'})

app.get('/api/message', (req, res) => {
    console.log(`Received request from user`);
    res.json({message: "Hello from the Express backend!"});
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authentication token required'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
}

app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users u WHERE u.id = $1`, [req.user.userId]);
        if (!result) {
            return res.status(404).json({error: 'User not found'}); 
        }

        return res.status(200).json({
            email: result.rows[0].email,
            role: result.rows[0].user_role
        });

    } catch (error) {
        console.error('Failed Database Query:', error);
        res.status(403).json({error: 'Database unavailable'});
    }
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

            if (user_email_check.rows[0]['count'] !== '0') {
                return res.status(400).json({errors: 'Account already attached to email'});
            }

            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    // returns hash
                    const result = await pool.query(`INSERT INTO users (email, password_hash, user_role)
                                                     VALUES ($1, $2, 'guest')`, [req.body.email, hash]);
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
                return res.status(400).json({
                    errors: "Incorrect Email or Password"
                });
            }

            bcrypt.compare(req.body.password, hashed_password.rows[0]['password_hash'], async function (err, result) {
                if (result) {
                    const token = jwt.sign(
                        {userId: hashed_password.rows[0]['id']},
                        process.env.JWT_SECRET,
                        {expiresIn: '1h'}
                    );

                    console.log("past token");

                    const getPerson = await pool.query(`select p.user_id
                                                        from persons p
                                                        where p.user_id = $1`, [hashed_password.rows[0]['id']]);

                    if (getPerson.rows.length === 0) {
                        const addPerson = await pool.query(`insert into persons(user_id, token)
                                                            values ($1,
                                                                    $2)`, [hashed_password.rows[0]['id'], token]);
                        const getRoomID = await pool.query(`select r.id
                                                            from rooms r
                                                            where r.room_name = $1`, ['lobby']);
                        const addPersonState = await pool.query(`insert into person_state(user_id, in_gallery, current_room_id)
                                                                 values ($1, true,
                                                                         $2)`, [hashed_password.rows[0]['id'], getRoomID.rows[0]['id']]);
                    } else {
                        const addPerson = await pool.query(`update persons
                                                            set token = $2
                                                            where user_id = $1`, [hashed_password.rows[0]['id'], token]);
                        const getRoomID = await pool.query(`select r.id
                                                            from rooms r
                                                            where r.room_name = $1`, ['lobby']);
                        const addPersonState = await pool.query(`update person_state ps
                                                                 set current_room_id = $2
                                                                 where user_id = $1;`, [hashed_password.rows[0]['id'], getRoomID.rows[0]['id']]);
                    }


                    return res.status(200).json({
                        contents: "Signed In Successfully", token: token
                    });
                } else {
                    return res.status(401).json({
                        errors: "Incorrect Email or Password"
                    });
                }
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(403).json({error: 'Service unavailable'});
        }
    });

app.get('/api/get-rooms', authenticateToken, async (req, res) => {
    try {
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

app.post('/api/get-room-connections', authenticateToken, async (req, res) => {
    try {
        console.log(`Received db query request from user`);
        const result = await pool.query(`SELECT * FROM room_connection WHERE room1_id = $1`, [req.body.room]);

        res.status(200).json({
            contents: result.rows
        });
    } catch (error) {
        console.error('Failed Database Query:', error);
        res.status(503).json({error: 'Service unavailable'});
    }
});

app.post('/api/enter-room',
    [
        [
            body('room').isNumeric(),
        ],
    ],
    authenticateToken,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            // Check if room is full
            const roomCapacity = await pool.query(`select count(*)
                                                   from person_state ps
                                                   where ps.current_room_id = $1`, [req.body.room]);
            const maxRoomCapacity = await pool.query(`select capacity
                                                      from rooms r
                                                      where r.id = $1`, [req.body.room]);

            if (!(roomCapacity.rows[0]['count'] < maxRoomCapacity.rows[0]['capacity'])) {
                return res.status(400).json({errors: 'Room Full'});
            }

            //Check if user can access
            const roomPerms = await pool.query(`select employees_only
                                                from rooms r
                                                where r.id = $1`, [req.body.room]);
            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (getUserPerms.rows[0]['user_role'] === 'guest' && roomPerms.rows[0]['employees_only'] === true) {
                return res.status(400).json({errors: 'Employees Only'});
            }


            let today = new Date().toISOString().slice(0, 10);
            const event_id = await pool.query(`select ge.id
                                               from gallery_events ge
                                               where ge.room_id = $1
                                                 and ge.event_date = $2`, [req.body.room, today]);
            let images;

            if (event_id.rows.length !== 0) {
                images = await pool.query(`select a.id, a.image_path, a.art_name, a.art_description, a.artist
                                           from art a
                                           where a.event_id = $1`, [event_id.rows[0]['id']]);
            } else {
                const default_event = await pool.query(`select ge.id
                                                        from gallery_events ge
                                                        where ge.room_id = $1`, [req.body.room]);
                
                // also need to check if there actually is an event
                if (default_event.rows.length === 0) {
                    return res.status(200).json({ 
                        contents: []
                    })
                }

                images = await pool.query(`select a.id, a.image_path, a.art_name, a.art_description, a.artist
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

app.post('/api/fetch-image',
    [
        [
            body('image').isString(),
        ],
    ],
    authenticateToken,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            res.sendFile('/data/images/' + req.body.image);
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.get('/api/fetch-events',
    authenticateToken,
    async (req, res) => {
        try {
            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);
            let event_ids;

            if (getUserPerms.rows[0]['user_role'] === 'admin') {
                event_ids = await pool.query(`select *
                                              from gallery_events ge`, []);
            } else {
                event_ids = await pool.query(`select *
                                              from gallery_events ge
                                              where ge.user_id = $1`, [req.user['userId']]);
            }

            res.status(200).json({
                contents: event_ids.rows
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/fetch-event',
    [
        [
            body('event').isNumeric(),
        ],
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const event = await pool.query(`select *
                                            from gallery_events ge
                                            where ge.id = $1`, [req.body.event]);

            res.status(200).json({
                contents: event.rows
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/get-images',
    async (req, res) => {
        try {
            const art = await pool.query(`select *
                                          from art`, []);

            res.status(200).json({
                contents: art.rows
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/edit-event',
    [
        [
            body('id').isNumeric(),
            body('room_id').isNumeric(),
            body('date').isDate(),
        ],
    ],
    authenticateToken, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin' || getUserPerms.rows[0]['user_role'] === 'employee')) {
                return res.status(400).json({errors: 'Employee Only Operation'});
            }

            const eventCount = await pool.query(`select count(*)
                                                 from gallery_events ge where ge.event_date = $1 and ge.room_id = $2`, [req.body.date, req.body.room_id]);

            if(!(eventCount.rows[0]['count'] === '0'))
            {
                return res.status(400).json({errors: "Event already in room and on date"});
            }

            const event = await pool.query(`update gallery_events
                                            set user_id = $1,
                                                room_id = $2,
                                                event_date    = $3
                                            where id = $4`, [req.user['userId'], req.body.room_id, req.body.date, req.body.id]);

            res.status(200).json({
                contents: "Updated Event" + req.body.id
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/upload-event',
    [
        [
            body('room_id').isNumeric(),
            body('date').isString(),
        ],
    ],
    authenticateToken, async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin' || getUserPerms.rows[0]['user_role'] === 'employee')) {
                return res.status(400).json({errors: 'Employee Only Operation'});
            }

            const eventCount = await pool.query(`select count(*)
                                              from gallery_events ge where ge.event_date = $1 and ge.room_id = $2`, [req.body.date, req.body.room_id]);

            if(!(eventCount.rows[0]['count'] === '0'))
            {
                return res.status(400).json({errors: "Event already in room and on date"});
            }

            const event = await pool.query(`insert into gallery_events (user_id, room_id, event_date)
                                            values ($1, $2,
                                                    $3)`, [req.user['userId'], req.body.room_id, req.body.date]);

            res.status(200).json({
                contents: "Created Event"
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/delete-event',
    [
        [
            body('room_id').isNumeric(),
            body('date').isString(),
        ],
    ],
    authenticateToken, async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin' || getUserPerms.rows[0]['user_role'] === 'employee')) {
                return res.status(400).json({errors: 'Employee Only Operation'});
            }

            const event = await pool.query(`delete from gallery_events where user_id = $1 and room_id = $2 and event_date = $3`,
                                            [req.user['userId'], req.body.room_id, req.body.date, req.body.id]);

            res.status(200).json({
                contents: "Created Event"
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/upload-image', upload.single('image'),
    [
        [
            body('event_id').isNumeric(),
            body('posted_by').isNumeric(),
            body('art_name').isString(),
            body('desc').isString(),
            body('artist').isString(),
            body('date').isString(),
        ],
    ],
    authenticateToken, async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin' || getUserPerms.rows[0]['user_role'] === 'employee')) {
                return res.status(400).json({errors: 'Employee Only Operation'});
            }


            const event = await pool.query(`insert into art (event_id, posted_by, image_path, art_name, art_description,
                                                             artist,
                                                             art_creation_date)
                                            values ($1, $2, $3, $4, $5, $6,
                                                    $7)`, [req.body.event_id, req.user['userId'], req.file.filename, req.body.art_name,
                req.body.desc, req.body.artist, req.body.date]);

            res.status(200).json({
                contents: event.rows
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    })

app.post('/api/delete-image',
    [
        [
            body('image').isString(),
            body('image_id').isNumeric()
        ],
    ],
    authenticateToken,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin' || getUserPerms.rows[0]['user_role'] === 'employee')) {
                return res.status(400).json({errors: 'Employee Only Operation'});
            }

            const event = await pool.query(`delete from art where id = $1`,
                [req.body.image_id]);

            unlink('data/images/'+req.body.image, (err) => {
                if (err) throw err;
                console.log('path/file.txt was deleted');
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.get('/api/fetch-users',
    authenticateToken,
    async (req, res) => {
        try {
            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin')) {
                return res.status(400).json({errors: 'Admin Only Operation'});
            }

            const users = await pool.query(`select * from users u where u.user_role = 'employee' or u.user_role = 'guest' or u.id = $1`, [req.user['userId']]);

            res.status(200).json({
                contents: users.rows
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/fetch-user',
    [
        [
            body('id').isNumeric(),
        ],
    ],
    authenticateToken,
    async (req, res) => {
        try {
            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin')) {
                return res.status(400).json({errors: 'Admin Only Operation'});
            }

            const users = await pool.query(`select * from users u where u.id = $1`, [req.body.id]);

            res.status(200).json({
                contents: users.rows
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/update-user',
    [
        [
            body('id').isNumeric(),
            body('role').isString()
        ],
    ],
    authenticateToken,
    async (req, res) => {
        try {
            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin')) {
                return res.status(400).json({errors: 'Admin Only Operation'});
            }

            if (!(req.body.role === 'guest' || req.body.role === 'employee' || req.body.role === 'admin'))
            {
                return res.status(400).json({errors: 'Please Enter a Valid role'});
            }

            const users = await pool.query(`update users set user_role = $2 where id = $1`, [req.body.id, req.body.role]);

            res.status(200).json({
                contents: {response: "User info Updated"}
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.post('/api/delete-user',
    [
        [
            body('id').isNumeric(),
        ],
    ],
    authenticateToken,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin')) {
                return res.status(400).json({errors: 'Employee Only Operation'});
            }

            const deleteUser = await pool.query(`delete from users u where u.id = $1`, [req.body.id]);

            res.status(200).json({
                contents: { response: 'User Removed' }
            });

        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.get('/api/fetch-logs',
    authenticateToken,
    async (req, res) => {
        try {
            const getUserPerms = await pool.query(`select user_role
                                                   from users u
                                                   where u.id = $1`, [req.user['userId']]);

            if (!(getUserPerms.rows[0]['user_role'] === 'admin')) {
                return res.status(400).json({errors: 'Admin Only Operation'});
            }

            const logs = await pool.query(`select * from audit_logs`);

            res.status(200).json({
                contents: logs.rows
            });
        } catch (error) {
            console.error('Failed Database Query:', error);
            res.status(503).json({error: 'Service unavailable'});
        }
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
