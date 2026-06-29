# Phileo HR AI

Sprint 1 starts with a non-AI HR application for login, CV upload, candidate storage, search, and duplicate detection.

## Stack

- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT, Pydantic
- Frontend: React, TypeScript, Material UI, Axios, React Router
- Infrastructure: Docker Compose and PostgreSQL

## Sprint 1 Scope

- Login
- Upload CVs
- Store candidates
- Search candidates
- Detect duplicates
- No AI scoring yet

## Quick Start

1. Install Docker Desktop, Python 3.12, Node.js, Git, and VS Code.
2. Copy `backend/.env.example` to `backend/.env`.
3. Start PostgreSQL: `docker compose -f docker/docker-compose.yml up -d`
4. Install backend dependencies from `backend`: `python -m pip install -r requirements.txt`
5. Create the first admin user from `backend`: `python -m app.database.seed`
6. Start the backend from `backend`: `python -m uvicorn app.main:app --reload`
7. Install frontend dependencies from `frontend`: `npm install`
8. Start the frontend from `frontend`: `npm run dev`

Default local login after seeding:

- Username: `admin`
- Password: `admin123`
