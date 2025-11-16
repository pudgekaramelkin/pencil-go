export type Player = {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  hasGuessedCorrectly: boolean;
};

export type DrawStroke = {
  tool: "pen" | "eraser";
  points: number[];
  color: string;
  size: number;
};

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
