import { useEffect, useRef } from "react";
import Phaser from "phaser";
import type { Character, Room } from "../types";
import { RoomScene } from "./RoomScene";

type Props = {
  room: Room;
  character: Character;
};

export function RoomGame({ room, character }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: rootRef.current,
      width: 640,
      height: 480,
      scene: [RoomScene],
      backgroundColor: "#0f1119",
      physics: { default: "arcade" },
    });

    game.scene.start("RoomScene", { room, character });

    return () => {
      game.destroy(true);
    };
  }, [room, character]);

  return <div className="game-canvas" ref={rootRef} />;
}
