# Project Atlas Technical Blueprint

## 1. Repository Reality Check (Current State)

This repository is currently at idea stage:
- `README.md` contains the high-level concept (browser tabletop game, character movement, 2.5D room, possible future 3D, city/world view, design tab).
- No frontend or backend source directories are present yet.
- No dependency manifests are present yet.

This blueprint therefore defines a **practical target architecture** that is consistent with the existing idea and realistic for staged implementation.

---

## 2. Product Vision and Scope

Project Atlas is a browser-based tabletop RPG platform where players:
1. Create and manage characters.
2. Move those characters on tactical room grids.
3. Explore higher-level city/world maps.
4. Use a room editor to create playable battle/exploration spaces.

### MVP Goal (must stay realistic)
A single-player/local-hosted experience with:
- Character creation and persistence.
- 2D/2.5D room grid movement.
- Basic room editor.
- City/world map navigation (non-geospatial, game stylized).
- REST API backend and SQLite storage.

### Explicitly Deferred from MVP
- Real-time multiplayer synchronization.
- Complex combat rules engine.
- 3D production renderer.
- Cloud-scale persistence and distributed services.

---

## 3. Proposed High-Level Architecture

## Frontend (React + TypeScript + Phaser)
- **React**: UI shell, routing, forms, editor controls, state views.
- **Phaser**: Render/map/gameplay scenes inside React-managed containers.
- **TypeScript**: Type safety for UI/game contracts.

## Backend (Python + FastAPI + SQLite)
- **FastAPI**: HTTP API, validation via Pydantic models.
- **SQLite**: Simple relational persistence for MVP.
- **Python service layer**: game rules that should not live in UI (movement validation, map constraints, ownership checks).

## Data Flow
1. React UI collects intent (create character, move token, edit room).
2. Phaser handles visual scene and interaction details.
3. Frontend calls FastAPI endpoints.
4. FastAPI validates and applies domain rules.
5. SQLite stores canonical state.
6. Frontend refreshes from API responses.

### Why this split is beginner-friendly
For a university Python learner, this separation helps:
- Python handles server logic and data rules.
- TypeScript handles browser rendering and interaction.
- Clear API contracts prevent mixing concerns.

---

## 4. Frontend Responsibility Boundaries

Frontend owns:
- Input handling and UX feedback.
- Scene rendering (Phaser tile layers, token sprites, highlights).
- Client-side navigation between character, room, city/world, and editor views.
- Optimistic interaction only where safe (e.g., local hover previews).

Frontend does **not** own final authority for:
- Legal movement results.
- Security-sensitive ownership checks.
- Persistent source of truth.

Suggested initial frontend structure:
- `frontend/src/app` (routing/layout)
- `frontend/src/features/characters`
- `frontend/src/features/rooms`
- `frontend/src/features/maps`
- `frontend/src/features/editor`
- `frontend/src/game/phaser`
- `frontend/src/api`

---

## 5. Backend Responsibility Boundaries

Backend owns:
- CRUD for characters, rooms, tiles, maps.
- Movement validation and turn-independent constraints.
- Referential integrity and persistence.
- Security checks (authorization boundaries for future multiplayer).

Suggested initial backend structure:
- `backend/app/main.py` (FastAPI entry)
- `backend/app/api/` (routers)
- `backend/app/models/` (Pydantic + DB models)
- `backend/app/services/` (game/domain logic)
- `backend/app/db/` (SQLite access/migrations)

---

## 6. Core Data Models (MVP)

## Character
Fields:
- `id` (UUID/text)
- `name` (string)
- `class` (string; simple enum-like validation)
- `level` (int, default 1)
- `hp_current`, `hp_max` (int)
- `stats_json` (JSON text for STR/DEX/INT etc.)
- `position_room_id` (nullable FK)
- `position_x`, `position_y` (nullable ints)
- `created_at`, `updated_at`

## Room
Fields:
- `id`
- `name`
- `width`, `height`
- `tile_size` (default grid size)
- `theme` (string, optional)
- `created_by` (future user id, nullable for MVP)
- `created_at`, `updated_at`

## RoomTile
Fields:
- `id`
- `room_id` (FK)
- `x`, `y`
- `tile_type` (floor, wall, obstacle, water, etc.)
- `movement_cost` (int)
- `is_blocked` (bool)

## CityMapNode (world/city abstraction)
Fields:
- `id`
- `map_scope` (`city` or `world`)
- `name`
- `x`, `y` (display coordinates)
- `node_type` (district, gate, tavern, landmark, etc.)

## MapConnection
Fields:
- `id`
- `from_node_id`, `to_node_id`
- `travel_cost`
- `is_locked`

## RoomTemplate (for editor reuse)
Fields:
- `id`
- `name`
- `room_payload_json` (serialized tile setup)
- `version`

---

## 7. Grid Movement System (MVP)

Movement rules:
1. Character requests move from `(x1,y1)` to `(x2,y2)`.
2. Backend checks:
   - target in room bounds
   - target tile not blocked
   - movement distance rule (start with Manhattan distance 1 per step)
   - optional movement cost budget if enabled
3. Backend updates canonical character position.

Recommended simplification for MVP:
- No diagonal movement at first.
- One-tile step API.
- No simultaneous actors.

Why this is good early:
- Easier Python rule testing.
- Fewer Phaser synchronization edge cases.

---

## 8. Room Editor (MVP)

Capabilities:
- Create room dimensions.
- Paint tiles by type.
- Mark blocking tiles.
- Save room.
- Load and continue editing.

Out of MVP scope for editor:
- Collaborative editing.
- Scripted events.
- Asset marketplace/import pipeline.

Implementation split:
- React: editor toolbar/state controls.
- Phaser: tile painting canvas.
- FastAPI: save/load room definitions.

---

## 9. City/World Map Layer

Purpose:
- Provide non-combat navigation layer between rooms.

MVP behavior:
- Clickable nodes with static connections.
- Transition from node to room scenes.
- Basic travel time/cost metadata.

Deferred:
- Real geospatial rendering.
- “Google Earth”-like streaming terrain.

---

## 10. Future Multiplayer Architecture (Deferred)

Not in MVP, but design for compatibility:
- Add `user`, `session`, and `party` entities.
- Move from polling-heavy REST to mixed REST + WebSocket for live room updates.
- Introduce authoritative server turn/events stream.
- Add conflict resolution/versioning for map edits.

Security/consistency implications:
- Never trust client positions.
- Server validates every movement/action event.

---

## 11. Future 3D Options (Deferred)

Pragmatic progression:
1. Keep gameplay logic grid-based and renderer-agnostic.
2. Continue 2D/2.5D Phaser for MVP.
3. Prototype optional 3D view in a separate module later (e.g., Three.js/Babylon integration).
4. Reuse backend room/character APIs unchanged.

Key decision:
- **Do not couple game rules to rendering engine.**

---

## 12. Security Considerations

Even for local MVP, include baseline security:
- Input validation on every FastAPI endpoint (Pydantic schemas).
- Use parameterized SQL (or ORM/query builder) to avoid injection.
- Server-side ownership checks for all mutable resources (future users).
- Basic rate limiting strategy for write endpoints (future internet deployment).
- CORS restrictions per environment.
- No secrets in source; use environment variables for keys/config.

SQLite-specific care:
- Store DB file outside publicly served directories.
- Ensure backups for save corruption scenarios.

---

## 13. Testing Strategy

## Backend tests (highest priority)
- Unit tests for movement validation and map constraints.
- API tests for character/room/map CRUD.
- Persistence tests against temporary SQLite DB.

## Frontend tests
- Component tests for forms and editor controls.
- Integration tests for React + Phaser boundary events.

## End-to-end smoke tests
- Create character → load room → move token → save/load state.

Beginner-friendly recommendation:
- Focus first on deterministic Python unit tests for domain rules; they provide fast feedback and build confidence.

---

## 14. Important Technical Decisions and Rationale

1. **FastAPI + SQLite for MVP**
   - Low setup complexity, ideal for learning and iteration.
2. **Server-authoritative movement**
   - Prevents cheating/invalid state and prepares for multiplayer.
3. **Phaser isolated from business logic**
   - Allows renderer changes without rewriting game rules.
4. **Incremental map complexity**
   - Start node-based city/world navigation before advanced world simulation.
5. **Defer advanced features intentionally**
   - Protects schedule and learning outcomes.

---

## 15. MVP Definition Checklist

Must have:
- Character CRUD
- Room creation and tile editing
- Single-character room movement with validation
- City/world node navigation to rooms
- Local persistence in SQLite
- Basic tests for movement and key API paths

Must be deferred:
- Real-time multiplayer
- Full combat automation
- Production 3D world
- Highly dynamic procedural world generation
