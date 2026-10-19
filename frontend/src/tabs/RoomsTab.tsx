import { RoomGame } from "../game/RoomGame";
import type { Character, Room } from "../types";

type Props = {
  rooms: Room[];
  selectedRoomId: number | null;
  onSelectRoom: (roomId: number) => void;
  selectedCharacter: Character | null;
};

export function RoomsTab({ rooms, selectedRoomId, onSelectRoom, selectedCharacter }: Props) {
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null;

  return (
    <section className="panel split">
      <div>
        <h2>Available Rooms</h2>
        <div className="list">
          {rooms.map((room) => (
            <article key={room.id} className={`list-card ${room.id === selectedRoom?.id ? "selected" : ""}`}>
              <h3>{room.name}</h3>
              <p>{room.description}</p>
              <p>{room.width} × {room.height}</p>
              <button onClick={() => onSelectRoom(room.id)}>Open Room</button>
            </article>
          ))}
        </div>
      </div>
      <div>
        <h2>Room Explorer</h2>
        {!selectedCharacter ? <p className="error">Select a character in the Characters tab before entering a room.</p> : null}
        {selectedRoom && selectedCharacter ? (
          <>
            <RoomGame room={selectedRoom} character={selectedCharacter} />
            <article className="list-card">
              <h3>{selectedCharacter.name}</h3>
              <p>{selectedCharacter.archetype}</p>
              <p>HP {selectedCharacter.health}/{selectedCharacter.max_health}</p>
              <p>Use click-to-move, arrow keys for step movement, mouse wheel to zoom, and Q/E to pan camera.</p>
            </article>
          </>
        ) : (
          <p className="hint">Choose a room and character to begin exploration.</p>
        )}
      </div>
    </section>
  );
}
