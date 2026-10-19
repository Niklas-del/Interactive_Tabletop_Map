import type { Character, CharacterInput, Room, RoomInput, RoomLayout } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listCharacters: () => request<Character[]>("/characters"),
  createCharacter: (payload: CharacterInput) =>
    request<Character>("/characters", { method: "POST", body: JSON.stringify(payload) }),
  updateCharacter: (id: number, payload: Partial<CharacterInput>) =>
    request<Character>(`/characters/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCharacter: (id: number) => request<void>(`/characters/${id}`, { method: "DELETE" }),

  listRooms: () => request<Room[]>("/rooms"),
  createRoom: (payload: RoomInput) => request<Room>("/rooms", { method: "POST", body: JSON.stringify(payload) }),
  updateRoom: (id: number, payload: Partial<RoomInput>) =>
    request<Room>(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteRoom: (id: number) => request<void>(`/rooms/${id}`, { method: "DELETE" }),
  getRoomLayout: (id: number) => request<RoomLayout>(`/rooms/${id}/layout`),
  updateRoomLayout: (id: number, payload: RoomLayout) =>
    request<RoomLayout>(`/rooms/${id}/layout`, { method: "PUT", body: JSON.stringify(payload) }),
};
