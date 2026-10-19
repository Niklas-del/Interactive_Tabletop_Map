from collections.abc import Generator

from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .config import settings
from .database import Base, get_db, get_session_factory
from .seed import seed_database


def create_app(database_url: str | None = None) -> FastAPI:
    resolved_db_url = database_url or settings.database_url
    engine, session_factory = get_session_factory(resolved_db_url)
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title="Project Atlas API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def session_dependency() -> Generator[Session, None, None]:
        yield from get_db(session_factory)

    with session_factory() as db:
        seed_database(db)

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/characters", response_model=list[schemas.CharacterOut])
    def list_characters(db: Session = Depends(session_dependency)):
        return crud.list_characters(db)

    @app.post("/characters", response_model=schemas.CharacterOut, status_code=status.HTTP_201_CREATED)
    def create_character(payload: schemas.CharacterCreate, db: Session = Depends(session_dependency)):
        return crud.create_character(db, payload)

    @app.get("/characters/{character_id}", response_model=schemas.CharacterOut)
    def get_character(character_id: int, db: Session = Depends(session_dependency)):
        return crud.get_character(db, character_id)

    @app.put("/characters/{character_id}", response_model=schemas.CharacterOut)
    def update_character(character_id: int, payload: schemas.CharacterUpdate, db: Session = Depends(session_dependency)):
        return crud.update_character(db, character_id, payload)

    @app.delete("/characters/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_character(character_id: int, db: Session = Depends(session_dependency)):
        crud.delete_character(db, character_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.get("/rooms", response_model=list[schemas.RoomOut])
    def list_rooms(db: Session = Depends(session_dependency)):
        return crud.list_rooms(db)

    @app.post("/rooms", response_model=schemas.RoomOut, status_code=status.HTTP_201_CREATED)
    def create_room(payload: schemas.RoomCreate, db: Session = Depends(session_dependency)):
        return crud.create_room(db, payload)

    @app.get("/rooms/{room_id}", response_model=schemas.RoomOut)
    def get_room(room_id: int, db: Session = Depends(session_dependency)):
        return crud.get_room(db, room_id)

    @app.put("/rooms/{room_id}", response_model=schemas.RoomOut)
    def update_room(room_id: int, payload: schemas.RoomUpdate, db: Session = Depends(session_dependency)):
        return crud.update_room(db, payload=payload, room_id=room_id)

    @app.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_room(room_id: int, db: Session = Depends(session_dependency)):
        crud.delete_room(db, room_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.get("/rooms/{room_id}/layout", response_model=schemas.RoomLayout)
    def get_room_layout(room_id: int, db: Session = Depends(session_dependency)):
        return crud.get_room_layout(db, room_id)

    @app.put("/rooms/{room_id}/layout", response_model=schemas.RoomLayout)
    def update_room_layout(room_id: int, payload: schemas.RoomLayout, db: Session = Depends(session_dependency)):
        return crud.update_room_layout(db, room_id, payload)

    return app


app = create_app()
