# SecProg2026
2026 Secure Programming Final Project

## Project Overview

This project measures our team's capability of incorporating secure programming practices taught in the course. Our project, a virtual art gallery, actively uses these practices to mitigate security problems such as:

- Secure password storage
- Authentication
- Authorization
- Input validation
- Output encoding
- SQL injection prevention
- Cross-Site Scripting (XSS)
- Broken access control / IDOR
- Session/token security
- Information disclosure
- Secure error handling
- Secrets management
- Audit logging

## Tech Stack

Front-End:
- React/Vite Client

Back-End:
- Express Server

Database:
- PostgreSQL Relational Database

Containerization:
- Docker
- Docker Compose

## To Run

### 1. Install Docker and get the project

Install [Docker Desktop](https://docs.docker.com/desktop/) and follow its setup prompts (including WSL 2 on Windows, if requested). Open Docker Desktop and wait for the engine to start. Node.js, React, and PostgreSQL are installed inside the containers automatically.

Clone the repository, or download and extract its ZIP:

```bash
git clone https://github.com/Beleebs/SecProg2026.git
cd SecProg2026
```

Run all remaining commands from the project root, where `compose.yaml` is located. Verify Docker is ready with `docker info` and `docker compose version`.

### 2. Configure the environment

Copy `.env.example` to `.env` (edit your existing `.env` instead if you already have one):

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS/Linux
cp .env.example .env
```

Edit `.env` using this structure, replacing the password and secret placeholders:

```dotenv
POSTGRES_DB=secprog2026
POSTGRES_USER=gallery_user
POSTGRES_PASSWORD=replace_with_your_database_password

DB_HOST=db
DB_PORT=5432
DB_NAME=secprog2026
DB_USER=gallery_user
DB_PASSWORD=replace_with_your_database_password

JWT_SECRET=replace_with_your_generated_secret
```

Keep the corresponding `POSTGRES_*` and `DB_*` credentials identical. Use `DB_HOST=db` and `DB_PORT=5432` for the Docker database.

Generate a JWT secret with:

```bash
docker run --rm node:22-alpine node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the printed string into `JWT_SECRET`; do not paste the command itself. Save `.env` and keep its credentials out of Git.

### 3. Build and run

With Docker Desktop running and ports `3000`, `5000`, and `5432` available:

```bash
docker compose up --build -d
```

The first build downloads dependencies and may take several minutes. PostgreSQL automatically loads `db/schema.sql` when creating a new database. Check startup progress with:

```bash
docker compose ps
docker compose logs -f
```

Once the services are ready, open [http://localhost:3000](http://localhost:3000). The API runs at `http://localhost:5000`. Press `Ctrl+C` to leave the logs; the containers keep running.

For later starts, use `docker compose up -d`. Add `--build` after changing server code, dependencies, or Dockerfiles. Run `docker compose up -d` after editing `.env` to apply the new settings.

## To Stop

Stop and remove the containers while keeping database records:

```bash
docker compose down
```

You can then quit Docker Desktop. To restart, open Docker Desktop and run `docker compose up -d`.

To reset everything, **permanently deleting all database records**:

```bash
docker compose down -v
docker compose up --build -d
```

Existing database volumes retain their original credentials and schema. Changes to `POSTGRES_*` or `db/schema.sql` only apply automatically when initializing a fresh database.

## To add images

Place image files in `server/images`; Compose mounts this folder at `/data/images` in the server. Database image paths must match the filenames; copying files does not create gallery records. The mount is writable so employees and admins can upload images through the dashboard. Local files survive container and volume removal.

## Troubleshooting

- **Docker cannot connect:** Open Docker Desktop and wait for the engine to start.
- **Database errors:** Check `.env` credentials match the existing database. If startup is still in progress, wait for PostgreSQL to be ready and retry.
- **Port already in use:** Stop the other application using port `3000`, `5000`, or `5432`.
- **Page or container fails:** Inspect `docker compose ps -a` and `docker compose logs client server db` for errors.
