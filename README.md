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

The program will require you to use Docker/Docker Compose, nodejs, and react. Make sure that is installed before continuing
- docker: https://docs.docker.com/desktop/
- node.js: https://nodejs.org/en

After that, we can create the docker containers using docker compose. First, make sure the docker engine is running/opened. Then run the command:

```bash
docker compose up
```

This will start the client, server, and database containers. 

## To Stop

```bash
# stops the containers while still maintaining database entries
docker compose down

# completely stop containers, delete all database data
docker compose down -v
```

