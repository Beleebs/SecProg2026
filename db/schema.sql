-- DATABASE NOT COMPLETE.
-- NEEDS MORE CONSTRAINTS FOR PROPER USAGE

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    user_role TEXT NOT NULL DEFAULT 'guest',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE persons (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    u_id INTEGER UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    employees_only BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE person_state (
    person_id INTEGER PRIMARY KEY REFERENCES persons(id) ON DELETE RESTRICT,
    in_gallery BOOLEAN NOT NULL DEFAULT FALSE,
    current_room_id INTEGER REFERENCES rooms(id) ON DELETE RESTRICT,
    last_action_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE person_session (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id) ON DELETE RESTRICT,
    token_hash TEXT NOT NULL UNIQUE,
    token_expiration_at TIMESTAMPTZ NOT NULL,
    last_action_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE room_connection (
    room1_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    room2_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    PRIMARY KEY (room1_id, room2_id)
);

CREATE TABLE gallery_events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    room_id INTEGER REFERENCES rooms(id) ON DELETE RESTRICT,
    event_date DATE
);

CREATE TABLE art (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id INTEGER REFERENCES gallery_events(id) ON DELETE RESTRICT,
    posted_by INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    image_path TEXT NOT NULL,
    art_name TEXT NOT NULL,
    art_description TEXT,
    artist TEXT NOT NULL,
    art_creation_date DATE,
    art_posted_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_person_id INTEGER REFERENCES persons(id) ON DELETE RESTRICT,
    actor_user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id INTEGER,
    outcome TEXT NOT NULL,
    details JSONB
);

-- Initial Values
    INSERT INTO rooms (room_name, capacity, employees_only)
    VALUES
        ('lobby', 100, FALSE),  -- index 1
        ('room1', 30, FALSE),   -- index 2
        ('room2', 30, FALSE),   -- index 3
        ('room3', 30, FALSE),   -- index 4
        ('room4', 25, FALSE),   -- index 5
        ('room5', 15, FALSE),   -- index 6
        ('storage', 5, TRUE);   -- index 7

-- Room Connections
    INSERT INTO room_connection (room1_id, room2_id)
    VALUES
        (1,2), (2,1),
        (1,3), (3,1),
        (1,4), (4,1),
        (2,6), (6,2),
        (4,5), (5,4),
        (3,5), (5,3),
        (3,7), (7,3),
        (6,7), (7,6);

-- User
    INSERT INTO users (email, password_hash, user_role, is_active)
    VALUES
        ('user@email.com', '$2b$10$K9rWwySniTgRgvsRTanpfOoyR.ObpNKELhMAwKOGfyGtsfm4ASmoK', 'regUser', false),
        ('employ@email.com', '$2b$10$K9rWwySniTgRgvsRTanpfOoyR.ObpNKELhMAwKOGfyGtsfm4ASmoK', 'employee', false),
        ('admin@email.com', '$2b$10$K9rWwySniTgRgvsRTanpfOoyR.ObpNKELhMAwKOGfyGtsfm4ASmoK', 'admin', false);

-- Gallery Events
    INSERT INTO gallery_events (person_id, room_id, event_date)
    VALUES
        (1, 2, null),
        (1, 3, null),
        (1, 4, null),
        (1, 5, null),
        (1, 6, null),
        (1, 3, '2026-10-29');

-- Images
    INSERT INTO art (event_id, posted_by, image_path, art_name, art_description, artist, art_creation_date)
    VALUES
        (1, 1, 'image1.png' , 'image1' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (1, 1, 'image1.png' , 'image2' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (2, 1, 'image3.png' , 'image3' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (2, 1, 'image4.png' , 'image4' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (3, 1, 'image5.png' , 'image5' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (3, 1, 'image6.png' , 'image6' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (4, 1, 'image7.png' , 'image7' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (4, 1, 'image8.png' , 'image8' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (5, 1, 'image9.png' , 'image9' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (5, 1, 'image10.png', 'image10', 'desc', 'artistNameStandIn', '2026-10-28'),
        (6, 1, 'image7.png' , 'image7' , 'desc', 'artistNameStandIn', '2026-10-28'),
        (6, 1, 'image8.png' , 'image8' , 'desc', 'artistNameStandIn', '2026-10-28');