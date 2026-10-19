# Project Atlas Data Model (MVP)

This document proposes a beginner-friendly data model for:
- Characters
- Rooms
- Room objects
- Maps
- Map locations
- Saved room layouts

Planned stack: Python + FastAPI + SQLAlchemy + SQLite + React + TypeScript.

Current repository direction (from `README.md`) emphasizes:
- Player-created characters
- Movement inside rooms
- City/world views later
- A design tab for editing

This model keeps the MVP simple while leaving room for multiplayer growth.

---

## 1) Entity Overview

### Character
A reusable player/avatar definition (name, visual style, stats).
- A character is **not tied to one room**.
- It can appear in many rooms over time through placement records.

### Room
A playable scene (for example tavern interior, dungeon chamber).
- Owns default dimensions/grid settings.
- Can contain placed characters and room objects.

### RoomObject
Reusable object template (table, chest, pillar, tree).
- Defines object type and default metadata.
- Actual position in a room is handled by a placement row.

### Map
A larger world/city/region container.
- Holds map locations (points of interest, entrances, room links).

### MapLocation
A coordinate point on a map.
- Can optionally reference a room (entering that location opens a room).

### SavedLayout
A named snapshot of all placements for one room.
- Supports save/restore of room state.
- Can be used as “default setup” or user/session-specific saves later.

### Placement Tables (join/snapshot support)
To keep entities reusable, placements are separate:
- `room_character_placements`: where a character is in a room
- `room_object_placements`: where an object is in a room

---

## 2) Relationships

- `Map (1) -> (many) MapLocation`
- `Room (1) -> (many) RoomCharacterPlacement`
- `Character (1) -> (many) RoomCharacterPlacement`
- `Room (1) -> (many) RoomObjectPlacement`
- `RoomObject (1) -> (many) RoomObjectPlacement`
- `Room (1) -> (many) SavedLayout`
- `SavedLayout (1) -> (many) SavedLayoutCharacter`
- `SavedLayout (1) -> (many) SavedLayoutObject`
- `MapLocation (0..1) -> (1) Room` (optional room link)

This separation is what enables character/object reuse and layout snapshots.

---

## 3) Stable ID Strategy

Use string UUIDs (`uuid4`) generated in backend code and stored as `TEXT` in SQLite.

ID format recommendation:
- `char_<uuid>`
- `room_<uuid>`
- `obj_<uuid>`
- `map_<uuid>`
- `loc_<uuid>`
- `layout_<uuid>`

Why:
- Stable across frontend/backend and exports/imports
- Safe to merge later in multiplayer or sync scenarios
- Avoids fragile auto-increment IDs for cross-system references

Also store `created_at` and `updated_at` (ISO timestamp strings in UTC).

---

## 4) Position and Grid Conventions

Use a 2D top-down grid for MVP.

- Coordinate origin: `(0, 0)` at top-left
- `x` increases to the right
- `y` increases downward
- `z_index` controls draw order (higher drawn on top)
- Optional `rotation_deg` for future visual direction (default `0`)

Grid settings:
- Room defines `grid_cell_size` (for rendering snap, e.g. 64 px)
- Positions are stored as **integer grid cells** (`x`, `y`)
- Pixel position in frontend = `x * grid_cell_size`, `y * grid_cell_size`

Collision:
- Keep MVP simple: boolean `blocks_movement` on placed objects
- Pathfinding can be added later without changing core model

---

## 5) Validation Rules (API + DB)

### Common
- IDs required, unique, immutable after creation
- `name`: 1..80 chars, trimmed
- `created_at`, `updated_at` required UTC timestamps

### Character
- `display_name`: required
- `size_cells`: default `1`, allowed `1..4`
- `max_hp`: optional, if provided must be `>= 1`

### Room
- `width_cells`, `height_cells`: required, `>= 1`
- `grid_cell_size`: required, `>= 16` and `<= 256`

### RoomObject
- `object_type`: required (e.g. `table`, `chest`, `wall`, `decor`)
- `default_size_w`, `default_size_h`: `>= 1`

### Placement
- Referenced parent rows must exist
- `x`, `y`: required integers, `>= 0`
- Placement must stay in room bounds:
  - `x < room.width_cells`
  - `y < room.height_cells`
- Optional unique constraint to prevent duplicate same-entity placement in one room

### SavedLayout
- `layout_name`: required
- Per room, layout names should be unique
- Snapshot rows must only reference entities and coordinates valid for that room

---

## 6) Example JSON Objects

### Character
```json
{
  "id": "char_9e79d5f0-39fb-4f7d-99b4-446a0da3f7cd",
  "display_name": "Aria Vale",
  "portrait_url": null,
  "color_hex": "#6C8EFF",
  "size_cells": 1,
  "max_hp": 24,
  "metadata": {
    "class": "Ranger",
    "speed": 6
  },
  "created_at": "2026-10-19T20:00:00Z",
  "updated_at": "2026-10-19T20:00:00Z"
}
```

### Room
```json
{
  "id": "room_f4deac90-2cd6-4db4-9587-4681f2f1a5f2",
  "name": "Copper Tankard Inn",
  "width_cells": 40,
  "height_cells": 30,
  "grid_cell_size": 64,
  "background_image_url": null,
  "created_at": "2026-10-19T20:00:00Z",
  "updated_at": "2026-10-19T20:00:00Z"
}
```

### Room object template
```json
{
  "id": "obj_8756f32a-0e3b-44e0-9f9e-9df86e5f4f9b",
  "name": "Wooden Table",
  "object_type": "table",
  "default_size_w": 2,
  "default_size_h": 1,
  "metadata": {
    "material": "wood"
  },
  "created_at": "2026-10-19T20:00:00Z",
  "updated_at": "2026-10-19T20:00:00Z"
}
```

### Character placement in a room
```json
{
  "id": "rcp_76f7245f-e50f-4a6f-bf8c-df8d6907dfe4",
  "room_id": "room_f4deac90-2cd6-4db4-9587-4681f2f1a5f2",
  "character_id": "char_9e79d5f0-39fb-4f7d-99b4-446a0da3f7cd",
  "x": 10,
  "y": 12,
  "z_index": 10,
  "rotation_deg": 0
}
```

### Map and map location
```json
{
  "map": {
    "id": "map_7c58f1bd-237f-4df6-bb50-8ea8535ccff2",
    "name": "West Kingdom",
    "width": 5000,
    "height": 3000
  },
  "location": {
    "id": "loc_f8216fd4-bb82-4f8f-8f48-7cc71b7b995e",
    "map_id": "map_7c58f1bd-237f-4df6-bb50-8ea8535ccff2",
    "name": "Inn Entrance",
    "x": 2120,
    "y": 980,
    "linked_room_id": "room_f4deac90-2cd6-4db4-9587-4681f2f1a5f2"
  }
}
```

### Saved layout snapshot
```json
{
  "layout": {
    "id": "layout_8bd2390a-c9e4-4d0f-8104-d8b99ecf3478",
    "room_id": "room_f4deac90-2cd6-4db4-9587-4681f2f1a5f2",
    "layout_name": "Combat Setup A",
    "is_default": false,
    "created_by": "system"
  },
  "characters": [
    {
      "character_id": "char_9e79d5f0-39fb-4f7d-99b4-446a0da3f7cd",
      "x": 4,
      "y": 5,
      "z_index": 10
    }
  ],
  "objects": [
    {
      "room_object_id": "obj_8756f32a-0e3b-44e0-9f9e-9df86e5f4f9b",
      "x": 8,
      "y": 9,
      "z_index": 2,
      "blocks_movement": true
    }
  ]
}
```

---

## 7) Character Reuse Across Rooms

Character reuse is handled by separating **character definition** from **room placement**.

- `characters` table stores the reusable identity and stats.
- `room_character_placements` stores where that character appears now.

Result:
- The same character can be placed in room A today and room B tomorrow.
- Character updates (name, portrait, stats) stay consistent everywhere.
- Removing a placement does not delete the character itself.

This keeps authoring simple and avoids duplicate character records per room.

---

## 8) Saving and Restoring Room Layouts

### Save flow
1. User selects a room and clicks “Save Layout”.
2. Backend creates one `saved_layouts` row.
3. Backend copies current placements into:
   - `saved_layout_characters`
   - `saved_layout_objects`

### Restore flow
1. User selects a saved layout.
2. Backend validates layout belongs to target room.
3. In one transaction:
   - Delete current `room_character_placements` and `room_object_placements` for that room.
   - Insert placement rows recreated from snapshot tables.
4. Return restored placements to client.

This approach is easy to reason about and works well with SQLite transactions.

---

## 9) Proposed SQLite Schema (MVP)

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  portrait_url TEXT,
  color_hex TEXT,
  size_cells INTEGER NOT NULL DEFAULT 1 CHECK (size_cells BETWEEN 1 AND 4),
  max_hp INTEGER CHECK (max_hp IS NULL OR max_hp >= 1),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  width_cells INTEGER NOT NULL CHECK (width_cells >= 1),
  height_cells INTEGER NOT NULL CHECK (height_cells >= 1),
  grid_cell_size INTEGER NOT NULL CHECK (grid_cell_size BETWEEN 16 AND 256),
  background_image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE room_objects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  object_type TEXT NOT NULL,
  default_size_w INTEGER NOT NULL DEFAULT 1 CHECK (default_size_w >= 1),
  default_size_h INTEGER NOT NULL DEFAULT 1 CHECK (default_size_h >= 1),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE maps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  width INTEGER NOT NULL CHECK (width >= 1),
  height INTEGER NOT NULL CHECK (height >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE map_locations (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL,
  name TEXT NOT NULL,
  x INTEGER NOT NULL CHECK (x >= 0),
  y INTEGER NOT NULL CHECK (y >= 0),
  linked_room_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE,
  FOREIGN KEY (linked_room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

CREATE TABLE room_character_placements (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  x INTEGER NOT NULL CHECK (x >= 0),
  y INTEGER NOT NULL CHECK (y >= 0),
  z_index INTEGER NOT NULL DEFAULT 0,
  rotation_deg INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE RESTRICT,
  UNIQUE (room_id, character_id)
);

CREATE TABLE room_object_placements (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  room_object_id TEXT NOT NULL,
  x INTEGER NOT NULL CHECK (x >= 0),
  y INTEGER NOT NULL CHECK (y >= 0),
  z_index INTEGER NOT NULL DEFAULT 0,
  rotation_deg INTEGER NOT NULL DEFAULT 0,
  blocks_movement INTEGER NOT NULL DEFAULT 0 CHECK (blocks_movement IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (room_object_id) REFERENCES room_objects(id) ON DELETE RESTRICT
);

CREATE TABLE saved_layouts (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  layout_name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1)),
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  UNIQUE (room_id, layout_name)
);

CREATE TABLE saved_layout_characters (
  id TEXT PRIMARY KEY,
  layout_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  x INTEGER NOT NULL CHECK (x >= 0),
  y INTEGER NOT NULL CHECK (y >= 0),
  z_index INTEGER NOT NULL DEFAULT 0,
  rotation_deg INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (layout_id) REFERENCES saved_layouts(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE RESTRICT
);

CREATE TABLE saved_layout_objects (
  id TEXT PRIMARY KEY,
  layout_id TEXT NOT NULL,
  room_object_id TEXT NOT NULL,
  x INTEGER NOT NULL CHECK (x >= 0),
  y INTEGER NOT NULL CHECK (y >= 0),
  z_index INTEGER NOT NULL DEFAULT 0,
  rotation_deg INTEGER NOT NULL DEFAULT 0,
  blocks_movement INTEGER NOT NULL DEFAULT 0 CHECK (blocks_movement IN (0,1)),
  FOREIGN KEY (layout_id) REFERENCES saved_layouts(id) ON DELETE CASCADE,
  FOREIGN KEY (room_object_id) REFERENCES room_objects(id) ON DELETE RESTRICT
);

CREATE INDEX idx_map_locations_map_id ON map_locations(map_id);
CREATE INDEX idx_room_char_placements_room_id ON room_character_placements(room_id);
CREATE INDEX idx_room_obj_placements_room_id ON room_object_placements(room_id);
CREATE INDEX idx_saved_layouts_room_id ON saved_layouts(room_id);
```

---

## 10) Extensibility Notes for Multiplayer

This MVP schema can evolve without breaking core IDs:

- Add `users` and `campaigns` tables
- Add ownership fields (`owner_user_id`, `campaign_id`) on rooms/maps/layouts
- Add optimistic concurrency (`version` integer) on placements/layouts
- Add `active_session_id` for simultaneous play states
- Add audit/event tables for move history and replay

Core entity separation (definition vs placement vs snapshot) remains valid for both single-player and multiplayer modes.
