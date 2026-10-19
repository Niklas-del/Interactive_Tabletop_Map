# Project Atlas Prototype

Project Atlas is an initial playable browser-based tabletop RPG prototype with:

- **Frontend:** React + TypeScript + Vite + Phaser
- **Backend:** FastAPI + SQLAlchemy + SQLite
- **Features:** Character creator, room explorer, design studio, world map placeholder

> ⚠️ This MVP is for local development only and is **not production-secure** (no auth, minimal hardening).

## Repository structure

- `/frontend` React UI and Phaser room experience
- `/backend` FastAPI API, SQLite models, validation, and tests

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API includes:

- `GET /health`
- Character CRUD: `GET/POST /characters`, `GET/PUT/DELETE /characters/{id}`
- Room CRUD: `GET/POST /rooms`, `GET/PUT/DELETE /rooms/{id}`
- Room layout: `GET/PUT /rooms/{id}/layout`

The database auto-initializes and seeds sample records on startup.

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open: `http://localhost:5173`

## Basic tests

Run backend tests:

```bash
cd backend
pytest
```

Run frontend typecheck/build:

```bash
cd frontend
npm run build
```

## MVP implemented tabs

1. **Home**: quick actions overview
2. **Characters**: create/edit/select/delete persisted characters
3. **World Map**: stylized map with clickable markers and room link action
4. **Rooms**: Phaser room scene with click + keyboard movement, collisions, zoom, and pan
5. **Design Studio**: grid editor with palette, placement, selection, move/remove, and save/reload
6. **Settings**: prototype preferences panel
