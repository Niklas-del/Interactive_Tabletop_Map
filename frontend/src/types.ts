export type Attributes = {
  strength: number;
  agility: number;
  intelligence: number;
};

export type Character = {
  id: number;
  uid: string;
  name: string;
  description: string;
  archetype: string;
  appearance: string;
  level: number;
  health: number;
  max_health: number;
  attributes: Attributes;
  equipment: Record<string, string>;
  portrait?: string | null;
};

export type RoomObjectType = "floor" | "wall" | "furniture" | "obstacle";

export type RoomObject = {
  id: string;
  type: RoomObjectType;
  x: number;
  y: number;
  properties: Record<string, string | number | boolean>;
};

export type RoomLayout = {
  objects: RoomObject[];
};

export type Room = {
  id: number;
  uid: string;
  name: string;
  description: string;
  width: number;
  height: number;
  layout: RoomLayout;
};

export type CharacterInput = Omit<Character, "id" | "uid">;
export type RoomInput = Omit<Room, "id" | "uid">;
