from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app


def create_client(tmp_path: Path) -> TestClient:
    db_path = tmp_path / "test.db"
    app = create_app(f"sqlite:///{db_path}")
    return TestClient(app)


def test_health_and_seed_data(tmp_path: Path):
    client = create_client(tmp_path)

    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    characters = client.get("/characters")
    assert characters.status_code == 200
    assert len(characters.json()) >= 1


def test_character_crud(tmp_path: Path):
    client = create_client(tmp_path)

    payload = {
        "name": "Bram Ironroot",
        "description": "A dwarf shieldbearer",
        "archetype": "Guardian",
        "appearance": "armored",
        "level": 3,
        "health": 18,
        "max_health": 18,
        "attributes": {"strength": 9, "agility": 4, "intelligence": 5},
        "equipment": {"weapon": "Warhammer", "armor": "Tower Shield", "trinket": "Rune"},
    }

    created = client.post("/characters", json=payload)
    assert created.status_code == 201
    character_id = created.json()["id"]

    updated = client.put(f"/characters/{character_id}", json={"name": "Bram Stoneguard", "health": 16})
    assert updated.status_code == 200
    assert updated.json()["name"] == "Bram Stoneguard"

    deleted = client.delete(f"/characters/{character_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/characters/{character_id}")
    assert missing.status_code == 404


def test_room_layout_crud(tmp_path: Path):
    client = create_client(tmp_path)

    room_payload = {
        "name": "Test Hall",
        "description": "Editor room",
        "width": 10,
        "height": 10,
        "layout": {"objects": []},
    }
    room = client.post("/rooms", json=room_payload)
    assert room.status_code == 201
    room_id = room.json()["id"]

    new_layout = {
        "objects": [
            {"id": "x1", "type": "obstacle", "x": 2, "y": 3, "properties": {"kind": "pillar"}}
        ]
    }
    saved = client.put(f"/rooms/{room_id}/layout", json=new_layout)
    assert saved.status_code == 200

    loaded = client.get(f"/rooms/{room_id}/layout")
    assert loaded.status_code == 200
    assert loaded.json()["objects"][0]["id"] == "x1"
