import type { Player, DrawStroke } from "../shared/types.js";

export type { Player, DrawStroke };

export type Room = {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  maxPlayers: number;
  totalRounds: number;
  roundTime: number;
  currentRound: number;
  currentDrawerId: string | null;
  currentWord: string | null;
  wordOptions: string[];
  gameState: "lobby" | "choosing" | "drawing" | "results" | "gameOver";
  strokes: DrawStroke[];
  roundStartTime: number | null;
  revealedIndices: Set<number>;
  guessedPlayers: Set<string>;
};
