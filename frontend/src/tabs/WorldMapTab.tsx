import { useState } from "react";
import type { Room } from "../types";

type Props = {
  rooms: Room[];
  onOpenRoom: (roomId: number) => void;
};

const locations = [
  { id: "l1", name: "Wayfarer Inn", x: 30, y: 45, roomName: "Wayfarer Inn", lore: "A hub for travelers." },
  { id: "l2", name: "Moonwatch Keep", x: 58, y: 25, roomName: "", lore: "Locked in this prototype." },
  { id: "l3", name: "Ashen Market", x: 70, y: 60, roomName: "", lore: "Merchants from every region." },
];

export function WorldMapTab({ rooms, onOpenRoom }: Props) {
  const [selected, setSelected] = useState(locations[0]);
  const selectedRoom = rooms.find((room) => room.name === selected.roomName) ?? null;

  return (
    <section className="panel split">
      <div>
        <h2>World Map</h2>
        <div className="map-stage">
          {locations.map((location) => (
            <button
              key={location.id}
              className="marker"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onClick={() => setSelected(location)}
            >
              ⬢
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2>Location Details</h2>
        <article className="list-card">
          <h3>{selected.name}</h3>
          <p>{selected.lore}</p>
          <p>Room Link: {selectedRoom ? "Available" : "Not yet"}</p>
          <button disabled={!selectedRoom} onClick={() => selectedRoom && onOpenRoom(selectedRoom.id)}>Open Linked Room</button>
        </article>
      </div>
    </section>
  );
}
