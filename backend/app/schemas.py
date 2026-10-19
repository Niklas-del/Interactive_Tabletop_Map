from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class CharacterAttributes(BaseModel):
    strength: int = Field(default=5, ge=1, le=20)
    agility: int = Field(default=5, ge=1, le=20)
    intelligence: int = Field(default=5, ge=1, le=20)


class CharacterBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=1000)
    archetype: str = Field(min_length=2, max_length=50)
    appearance: str = Field(default="wanderer", min_length=2, max_length=50)
    level: int = Field(default=1, ge=1, le=99)
    health: int = Field(default=10, ge=0, le=999)
    max_health: int = Field(default=10, ge=1, le=999)
    attributes: CharacterAttributes = Field(default_factory=CharacterAttributes)
    equipment: dict[str, str] = Field(
        default_factory=lambda: {
            "weapon": "Rusty Dagger",
            "armor": "Traveler's Cloak",
            "trinket": "Lantern Charm",
        }
    )
    portrait: str | None = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def validate_health(self):
        if self.health > self.max_health:
            raise ValueError("health cannot exceed max_health")
        return self


class CharacterCreate(CharacterBase):
    pass


class CharacterUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    archetype: str | None = Field(default=None, min_length=2, max_length=50)
    appearance: str | None = Field(default=None, min_length=2, max_length=50)
    level: int | None = Field(default=None, ge=1, le=99)
    health: int | None = Field(default=None, ge=0, le=999)
    max_health: int | None = Field(default=None, ge=1, le=999)
    attributes: CharacterAttributes | None = None
    equipment: dict[str, str] | None = None
    portrait: str | None = Field(default=None, max_length=255)


class CharacterOut(CharacterBase):
    id: int
    uid: str

    model_config = ConfigDict(from_attributes=True)


class RoomObject(BaseModel):
    id: str
    type: Literal["floor", "wall", "furniture", "obstacle"]
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    properties: dict[str, str | int | float | bool] = Field(default_factory=dict)


class RoomLayout(BaseModel):
    objects: list[RoomObject] = Field(default_factory=list)


class RoomBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=1000)
    width: int = Field(default=16, ge=4, le=100)
    height: int = Field(default=12, ge=4, le=100)


class RoomCreate(RoomBase):
    layout: RoomLayout = Field(default_factory=RoomLayout)


class RoomUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    width: int | None = Field(default=None, ge=4, le=100)
    height: int | None = Field(default=None, ge=4, le=100)
    layout: RoomLayout | None = None


class RoomOut(RoomBase):
    id: int
    uid: str
    layout: RoomLayout

    model_config = ConfigDict(from_attributes=True)
