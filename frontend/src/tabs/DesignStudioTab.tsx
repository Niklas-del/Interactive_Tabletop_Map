import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { Room, RoomObject, RoomObjectType } from "../types";

type Props = {
  rooms: Room[];
  refreshRooms: () => Promise<void>;
};

const palette: RoomObjectType[] = ["floor", "wall", "furniture", "obstacle"];

export function DesignStudioTab({ rooms, refreshRooms }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(rooms[0]?.id ?? null);
  const [selectedType, setSelectedType] = useState<RoomObjectType>("wall");
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("Prototype Room");
  const [newWidth, setNewWidth] = useState(12);
  const [newHeight, setNewHeight] = useState(10);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  useEffect(() => {
    if (selectedRoom) setObjects(selectedRoom.layout.objects);
  }, [selectedRoom]);

  async function createRoom() {
    const created = await api.createRoom({
      name: newRoomName,
      description: "Created in Design Studio",
      width: newWidth,
      height: newHeight,
      layout: { objects: [] },
    });
    await refreshRooms();
    setSelectedRoomId(created.id);
  }

  async function saveLayout() {
    if (!selectedRoom) return;
    await api.updateRoomLayout(selectedRoom.id, { objects });
    await refreshRooms();
  }

  function placeObject(x: number, y: number) {
    const existing = objects.find((obj) => obj.x === x && obj.y === y);
    if (existing) {
      setSelectedObjectId(existing.id);
      return;
    }
    const newObject: RoomObject = {
      id: crypto.randomUUID(),
      type: selectedType,
      x,
      y,
      properties: {},
    };
    setObjects((prev) => [...prev, newObject]);
    setSelectedObjectId(newObject.id);
  }

  function removeSelected() {
    if (!selectedObjectId) return;
    setObjects((prev) => prev.filter((obj) => obj.id !== selectedObjectId));
    setSelectedObjectId(null);
  }

  function moveSelected(dx: number, dy: number) {
    if (!selectedRoom || !selectedObjectId) return;
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== selectedObjectId) return obj;
        const nextX = Math.max(0, Math.min(selectedRoom.width - 1, obj.x + dx));
        const nextY = Math.max(0, Math.min(selectedRoom.height - 1, obj.y + dy));
        return { ...obj, x: nextX, y: nextY };
      }),
    );
  }

  return (
    <section className="panel split">
      <div>
        <h2>Design Studio</h2>
        <div className="form-grid">
          <label>Open Room
            <select value={selectedRoomId ?? ""} onChange={(e) => setSelectedRoomId(Number(e.target.value))}>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </label>
          <label>New Room Name<input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} /></label>
          <label>Width<input type="number" min={4} value={newWidth} onChange={(e) => setNewWidth(Number(e.target.value))} /></label>
          <label>Height<input type="number" min={4} value={newHeight} onChange={(e) => setNewHeight(Number(e.target.value))} /></label>
        </div>
        <div className="actions">
          <button onClick={createRoom}>Create New Room</button>
          <button onClick={saveLayout} disabled={!selectedRoom}>Save Layout</button>
        </div>

        <h3>Palette</h3>
        <div className="actions">
          {palette.map((item) => (
            <button key={item} className={item === selectedType ? "active" : ""} onClick={() => setSelectedType(item)}>{item}</button>
          ))}
        </div>

        <h3>Object Tools</h3>
        <div className="actions">
          <button onClick={() => moveSelected(-1, 0)}>←</button>
          <button onClick={() => moveSelected(1, 0)}>→</button>
          <button onClick={() => moveSelected(0, -1)}>↑</button>
          <button onClick={() => moveSelected(0, 1)}>↓</button>
          <button className="danger" onClick={removeSelected}>Remove</button>
        </div>
      </div>

      <div>
        <h2>Grid Editor</h2>
        {!selectedRoom ? <p className="hint">Create or select a room to begin editing.</p> : null}
        {selectedRoom ? (
          <div className="grid-editor" style={{ gridTemplateColumns: `repeat(${selectedRoom.width}, 28px)` }}>
            {Array.from({ length: selectedRoom.width * selectedRoom.height }).map((_, index) => {
              const x = index % selectedRoom.width;
              const y = Math.floor(index / selectedRoom.width);
              const object = objects.find((item) => item.x === x && item.y === y);
              const selected = object?.id === selectedObjectId;
              return (
                <button
                  key={`${x}-${y}`}
                  className={`cell ${object ? object.type : ""} ${selected ? "selected" : ""}`}
                  onClick={() => placeObject(x, y)}
                >
                  {object ? object.type.slice(0, 1).toUpperCase() : ""}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
