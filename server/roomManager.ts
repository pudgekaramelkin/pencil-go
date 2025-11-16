import { Room } from "./types.js";

export class RoomManager {
  private rooms = new Map<string, Room>();

  generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code: string;
    do {
      code = Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostId: string, hostName: string): Room {
    const code = this.generateRoomCode();
    const room: Room = {
      code,
      hostId,
      players: new Map([
        [
          hostId,
          {
            id: hostId,
            name: hostName,
            score: 0,
            isReady: true,
            hasGuessedCorrectly: false,
          },
        ],
      ]),
      maxPlayers: 10,
      totalRounds: 3,
      roundTime: 120,
      currentRound: 0,
      currentDrawerId: null,
      currentWord: null,
      wordOptions: [],
      gameState: "lobby",
      strokes: [],
      roundStartTime: null,
      revealedIndices: new Set(),
      guessedPlayers: new Set(),
    };
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  deleteRoom(code: string): void {
    this.rooms.delete(code);
  }

  addPlayer(code: string, playerId: string, playerName: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.players.size >= room.maxPlayers) return false;

    room.players.set(playerId, {
      id: playerId,
      name: playerName,
      score: 0,
      isReady: false,
      hasGuessedCorrectly: false,
    });
    return true;
  }

  removePlayer(code: string, playerId: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.players.delete(playerId);

    if (room.players.size === 0) {
      this.deleteRoom(code);
    } else if (room.hostId === playerId) {
      const newHostId = Array.from(room.players.keys())[0];
      if (newHostId) {
        room.hostId = newHostId;
      }
    }
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  findRoomByPlayerId(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) {
        return room;
      }
    }
    return undefined;
  }
}
