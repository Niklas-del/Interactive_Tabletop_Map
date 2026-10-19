import uuid

from sqlalchemy import Column, Integer, String, Text

from .database import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    archetype = Column(String(50), nullable=False)
    appearance = Column(String(50), nullable=False, default="wanderer")
    level = Column(Integer, nullable=False, default=1)
    health = Column(Integer, nullable=False, default=10)
    max_health = Column(Integer, nullable=False, default=10)
    strength = Column(Integer, nullable=False, default=5)
    agility = Column(Integer, nullable=False, default=5)
    intelligence = Column(Integer, nullable=False, default=5)
    equipment_json = Column(Text, nullable=False, default="{}")
    portrait = Column(String(255), nullable=True)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    width = Column(Integer, nullable=False, default=16)
    height = Column(Integer, nullable=False, default=12)
    layout_json = Column(Text, nullable=False, default='{"objects": []}')
