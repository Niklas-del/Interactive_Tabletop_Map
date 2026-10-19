import json

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from . import models, schemas


def room_to_schema(room: models.Room) -> schemas.RoomOut:
    return schemas.RoomOut(
        id=room.id,
        uid=room.uid,
        name=room.name,
        description=room.description,
        width=room.width,
        height=room.height,
        layout=schemas.RoomLayout.model_validate(json.loads(room.layout_json)),
    )


def character_to_schema(character: models.Character) -> schemas.CharacterOut:
    return schemas.CharacterOut(
        id=character.id,
        uid=character.uid,
        name=character.name,
        description=character.description,
        archetype=character.archetype,
        appearance=character.appearance,
        level=character.level,
        health=character.health,
        max_health=character.max_health,
        attributes=schemas.CharacterAttributes(
            strength=character.strength,
            agility=character.agility,
            intelligence=character.intelligence,
        ),
        equipment=json.loads(character.equipment_json),
        portrait=character.portrait,
    )


def list_characters(db: Session) -> list[schemas.CharacterOut]:
    return [character_to_schema(item) for item in db.query(models.Character).order_by(models.Character.id.desc()).all()]


def create_character(db: Session, payload: schemas.CharacterCreate) -> schemas.CharacterOut:
    character = models.Character(
        name=payload.name,
        description=payload.description,
        archetype=payload.archetype,
        appearance=payload.appearance,
        level=payload.level,
        health=payload.health,
        max_health=payload.max_health,
        strength=payload.attributes.strength,
        agility=payload.attributes.agility,
        intelligence=payload.attributes.intelligence,
        equipment_json=json.dumps(payload.equipment),
        portrait=payload.portrait,
    )
    db.add(character)
    db.commit()
    db.refresh(character)
    return character_to_schema(character)


def get_character(db: Session, character_id: int) -> schemas.CharacterOut:
    character = db.query(models.Character).filter(models.Character.id == character_id).first()
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return character_to_schema(character)


def update_character(db: Session, character_id: int, payload: schemas.CharacterUpdate) -> schemas.CharacterOut:
    character = db.query(models.Character).filter(models.Character.id == character_id).first()
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

    patch = payload.model_dump(exclude_unset=True)
    for key in ["name", "description", "archetype", "appearance", "level", "health", "max_health", "portrait"]:
        if key in patch:
            setattr(character, key, patch[key])

    if "attributes" in patch and patch["attributes"] is not None:
        character.strength = patch["attributes"].strength
        character.agility = patch["attributes"].agility
        character.intelligence = patch["attributes"].intelligence

    if "equipment" in patch and patch["equipment"] is not None:
        character.equipment_json = json.dumps(patch["equipment"])

    if character.health > character.max_health:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="health cannot exceed max_health")

    db.commit()
    db.refresh(character)
    return character_to_schema(character)


def delete_character(db: Session, character_id: int) -> None:
    character = db.query(models.Character).filter(models.Character.id == character_id).first()
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    db.delete(character)
    db.commit()


def list_rooms(db: Session) -> list[schemas.RoomOut]:
    return [room_to_schema(item) for item in db.query(models.Room).order_by(models.Room.id.desc()).all()]


def create_room(db: Session, payload: schemas.RoomCreate) -> schemas.RoomOut:
    room = models.Room(
        name=payload.name,
        description=payload.description,
        width=payload.width,
        height=payload.height,
        layout_json=payload.layout.model_dump_json(),
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room_to_schema(room)


def get_room(db: Session, room_id: int) -> schemas.RoomOut:
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room_to_schema(room)


def update_room(db: Session, room_id: int, payload: schemas.RoomUpdate) -> schemas.RoomOut:
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    patch = payload.model_dump(exclude_unset=True)
    for key in ["name", "description", "width", "height"]:
        if key in patch:
            setattr(room, key, patch[key])
    if "layout" in patch and patch["layout"] is not None:
        room.layout_json = patch["layout"].model_dump_json()

    db.commit()
    db.refresh(room)
    return room_to_schema(room)


def delete_room(db: Session, room_id: int) -> None:
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    db.delete(room)
    db.commit()


def get_room_layout(db: Session, room_id: int) -> schemas.RoomLayout:
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return schemas.RoomLayout.model_validate(json.loads(room.layout_json))


def update_room_layout(db: Session, room_id: int, payload: schemas.RoomLayout) -> schemas.RoomLayout:
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    room.layout_json = payload.model_dump_json()
    db.commit()
    return payload
