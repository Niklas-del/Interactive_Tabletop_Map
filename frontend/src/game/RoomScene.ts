import Phaser from "phaser";
import type { Character, Room } from "../types";

type RoomSceneData = {
  room: Room;
  character: Character;
};

export class RoomScene extends Phaser.Scene {
  private roomData!: Room;
  private characterData!: Character;
  private token!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private blocked = new Set<string>();
  private indicator?: Phaser.GameObjects.Arc;

  constructor() {
    super("RoomScene");
  }

  init(data: RoomSceneData) {
    this.roomData = data.room;
    this.characterData = data.character;
    this.blocked = new Set(
      this.roomData.layout.objects
        .filter((item) => item.type === "wall" || item.type === "obstacle" || item.type === "furniture")
        .map((item) => `${item.x},${item.y}`),
    );
  }

  create() {
    const tileSize = 40;
    const width = this.roomData.width * tileSize;
    const height = this.roomData.height * tileSize;

    this.cameras.main.setBounds(0, 0, width, height).setBackgroundColor("#0f1119");

    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0x2f3444 } });
    for (let x = 0; x <= this.roomData.width; x += 1) {
      graphics.lineBetween(x * tileSize, 0, x * tileSize, height);
    }
    for (let y = 0; y <= this.roomData.height; y += 1) {
      graphics.lineBetween(0, y * tileSize, width, y * tileSize);
    }

    this.roomData.layout.objects.forEach((item) => {
      const color = item.type === "wall" ? 0x5a3a2b : item.type === "furniture" ? 0x6d5842 : 0x5c2434;
      this.add.rectangle(item.x * tileSize + 20, item.y * tileSize + 20, 36, 36, color).setAlpha(0.8);
    });

    this.token = this.add.circle(tileSize + 20, tileSize + 20, 12, 0x8fd3ff);
    this.indicator = this.add.circle(tileSize + 20, tileSize + 20, 16, 0xe6c66d, 0.2).setStrokeStyle(2, 0xe6c66d);
    this.cameras.main.startFollow(this.token, true, 0.08, 0.08);

    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const tileX = Math.floor(pointer.worldX / tileSize);
      const tileY = Math.floor(pointer.worldY / tileSize);
      this.moveToTile(tileX, tileY);
    });

    this.input.on("wheel", (_pointer: unknown, _gameObject: unknown, _dx: number, dy: number) => {
      const nextZoom = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.001, 0.6, 1.8);
      this.cameras.main.setZoom(nextZoom);
    });

    this.input.keyboard?.on("keydown-Q", () => this.cameras.main.scrollX -= 30);
    this.input.keyboard?.on("keydown-E", () => this.cameras.main.scrollX += 30);

    this.add.text(12, 12, `Exploring: ${this.characterData.name}`, {
      color: "#f0e4c0",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      backgroundColor: "#1a1f2b",
      padding: { x: 8, y: 6 },
    }).setScrollFactor(0);
  }

  update() {
    const currentX = Math.floor(this.token.x / 40);
    const currentY = Math.floor(this.token.y / 40);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) this.moveToTile(currentX - 1, currentY);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) this.moveToTile(currentX + 1, currentY);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) this.moveToTile(currentX, currentY - 1);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) this.moveToTile(currentX, currentY + 1);
  }

  private moveToTile(tileX: number, tileY: number) {
    if (tileX < 0 || tileY < 0 || tileX >= this.roomData.width || tileY >= this.roomData.height) return;
    if (this.blocked.has(`${tileX},${tileY}`)) return;

    const x = tileX * 40 + 20;
    const y = tileY * 40 + 20;
    this.tweens.add({ targets: [this.token, this.indicator], x, y, duration: 120, ease: "Sine.easeOut" });
  }
}
