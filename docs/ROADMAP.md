# Project Atlas Roadmap

## 0. Current Baseline

Repository currently includes only a concept-level `README.md`. No runtime source code exists yet. This roadmap starts from that baseline and sequences work into realistic stages.

---

## Stage 1 — Foundation and Project Skeleton

Goal: establish maintainable frontend/backend structure and basic dev workflow.

Deliverables:
- Create frontend skeleton (React + TypeScript).
- Create backend skeleton (FastAPI app).
- Set up SQLite database access layer.
- Define initial API contract document for characters/rooms/maps.
- Add basic local run instructions.

Acceptance criteria:
- Frontend and backend each start successfully.
- Health endpoint available from backend.
- One documented way to run both services locally.

Deferred at this stage:
- Any multiplayer or authentication complexity.

---

## Stage 2 — Character System (MVP Core)

Goal: make character creation and persistence functional.

Deliverables:
- Character data model and table.
- Endpoints: create/read/update/list characters.
- React form and list/detail views.
- Basic validation feedback in UI.

Acceptance criteria:
- User can create a character and retrieve it after restart.
- Invalid character payloads are rejected cleanly.

Deferred at this stage:
- Rich inventory/spell systems.

---

## Stage 3 — Room Grid and Movement (MVP Core)

Goal: playable tactical room movement.

Deliverables:
- Room + tile models and storage.
- Phaser room rendering with visible grid.
- Movement endpoint with backend validation.
- Frontend interaction to move selected character.

Acceptance criteria:
- Character position updates persist in SQLite.
- Blocked/out-of-bounds movement is rejected.
- Movement logic covered by backend tests.

Deferred at this stage:
- Full turn order and combat calculations.

---

## Stage 4 — Room Editor (MVP Core)

Goal: let users design rooms without code.

Deliverables:
- Editor mode toggle in frontend.
- Tile paint/select/erase tools.
- Save/load room maps through API.
- Reopen and continue editing existing rooms.

Acceptance criteria:
- A created room can be edited and reused in gameplay mode.
- Tile metadata (blocked/type/cost) persists correctly.

Deferred at this stage:
- Multi-user collaborative editing.

---

## Stage 5 — City/World Navigation (MVP Core)

Goal: connect room play to a broader map layer.

Deliverables:
- Node/connection map model.
- City/world map screen in React/Phaser.
- Travel action from node to node.
- Room entry transitions from map nodes.

Acceptance criteria:
- User can navigate nodes and enter associated rooms.
- Travel constraints (locked/connected) validated.

Deferred at this stage:
- True geospatial or streaming 3D world visualization.

---

## Stage 6 — MVP Hardening

Goal: make MVP reliable and safe enough for early users.

Deliverables:
- Baseline security checks in API (validation, ownership-ready patterns).
- Test coverage expansion for critical API and movement rules.
- Error handling and logging pass.
- Documentation refresh for setup, architecture, and known limits.

Acceptance criteria:
- Core flows pass repeatable smoke tests.
- No obvious high-risk security gaps in exposed endpoints.

Deferred at this stage:
- Horizontal scaling and cloud-native deployment architecture.

---

## Stage 7 — Post-MVP: Multiplayer Track (Deferred from MVP)

Goal: evolve single-user architecture toward real-time shared sessions.

Deliverables:
- Session/user model.
- WebSocket event channel for room state updates.
- Server-authoritative action/event pipeline.
- Conflict-safe room update/version strategy.

Entry criteria:
- MVP single-player experience is stable.
- Domain rules are already server-enforced.

---

## Stage 8 — Post-MVP: 3D Exploration Track (Deferred from MVP)

Goal: evaluate optional 3D rendering while preserving core rules.

Deliverables:
- Technical spike for 3D viewer module.
- Adapter layer proving existing room/map data can render in 3D.
- Performance and complexity evaluation report.

Entry criteria:
- 2D/2.5D gameplay loop is complete and tested.

---

## Priority Rules for Staying Realistic

1. Finish server-validated room movement before advanced visuals.
2. Do not start multiplayer before single-player stability.
3. Keep database and API schemas simple until usage proves new complexity is needed.
4. Every stage should end with testable, demoable outcomes.

---

## MVP Boundary Summary

Included in MVP:
- Character creation/persistence
- Room grid rendering and movement validation
- Room editor
- City/world node navigation
- Local SQLite-backed state

Excluded from MVP:
- Real-time multiplayer sessions
- Advanced combat automation
- Full 3D production world rendering
- Large-scale online infrastructure
