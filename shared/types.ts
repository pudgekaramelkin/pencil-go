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

