import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  hasGuessedCorrectly: boolean;
}

interface DrawStroke {
  tool: "pen" | "eraser";
  points: number[];
  color: string;
  size: number;
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface GameState {
  socket: Socket | null;
  gameState: "home" | "lobby" | "choosing" | "drawing" | "results" | "gameOver";
  roomCode: string;
  playerId: string;
  playerName: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  totalRounds: number;
  roundTime: number;
  currentRound: number;
  currentDrawerId: string | null;
  wordOptions: string[];
  maskedWord: string;
  unmaskedWord: string;
  strokes: DrawStroke[];
  chatMessages: ChatMessage[];
  roundStartTime: number | null;

  initSocket: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  toggleReady: () => void;
  updateSettings: (settings: any) => void;
  startGame: () => void;
  selectWord: (word: string) => void;
  sendStroke: (stroke: DrawStroke) => void;
  clearCanvas: () => void;
  sendMessage: (message: string) => void;
  nextRound: () => void;
  kickPlayer: (playerId: string) => void;
  leaveRoom: () => void;
}

export const useGameStore = create<GameState>((set: any, get: any) => ({
  socket: null,
  gameState: "home",
  roomCode: "",
  playerId: "",
  playerName: "",
  hostId: "",
  players: [],
  maxPlayers: 10,
  totalRounds: 3,
  roundTime: 30,
  currentRound: 0,
  currentDrawerId: null,
  wordOptions: [],
  maskedWord: "",
  unmaskedWord: "",
  strokes: [],
  chatMessages: [],
  roundStartTime: null,

  initSocket: () => {
    const serverUrl =
      process.env.NODE_ENV === "production"
        ? window.location.origin
        : `http://${window.location.hostname}:3001`;
    const socket = io(serverUrl);

    socket.on("connect", () => {
      set({ socket, playerId: socket.id });
    });

    socket.on("roomState", (state: any) => {
      set({
        roomCode: state.code,
        hostId: state.hostId,
        players: state.players,
        maxPlayers: state.maxPlayers,
        totalRounds: state.totalRounds,
        roundTime: state.roundTime,
        currentRound: state.currentRound,
        currentDrawerId: state.currentDrawerId,
        gameState: state.gameState,
        wordOptions: state.wordOptions || [],
        maskedWord: state.maskedWord || "",
        unmaskedWord: state.unmaskedWord || "",
        strokes: state.strokes || [],
        roundStartTime: state.roundStartTime,
      });
    });

    socket.on("chatMessage", (msg: ChatMessage) => {
      set((state: any) => ({ chatMessages: [...state.chatMessages, msg] }));
    });

    socket.on(
      "correctGuess",
      ({ playerId, playerName }: { playerId: string; playerName: string }) => {
        set((state: any) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              playerId,
              playerName,
              message: "✅ Слово угадано!",
              timestamp: Date.now(),
            },
          ],
        }));
      },
    );

    socket.on("drawUpdate", (stroke: DrawStroke) => {
      set((state: any) => ({ strokes: [...state.strokes, stroke] }));
    });

    socket.on("canvasCleared", () => {
      set({ strokes: [] });
    });

    socket.on("kicked", () => {
      set({ gameState: "home", roomCode: "", chatMessages: [] });
      alert("Вы были исключены из комнаты");
    });

    set({ socket });
  },

  createRoom: (playerName: string) => {
    const { socket } = get();
    socket?.emit("createRoom", { playerName }, (response: any) => {
      if (response.success) {
        set({ playerName, roomCode: response.roomCode, gameState: "lobby" });
      } else {
        alert(response.error);
      }
    });
  },

  joinRoom: (roomCode: string, playerName: string) => {
    const { socket } = get();
    socket?.emit(
      "joinRoom",
      { roomCode: roomCode.toUpperCase(), playerName },
      (response: any) => {
        if (response.success) {
          set({
            playerName,
            roomCode: roomCode.toUpperCase(),
            gameState: "lobby",
          });
        } else {
          alert(response.error);
        }
      },
    );
  },

  toggleReady: () => {
    const { socket, roomCode } = get();
    socket?.emit("toggleReady", { roomCode });
  },

  updateSettings: (settings: any) => {
    const { socket, roomCode } = get();
    socket?.emit("updateSettings", { roomCode, settings });
  },

  startGame: () => {
    const { socket, roomCode } = get();
    socket?.emit("startGame", { roomCode });
  },

  selectWord: (word: string) => {
    const { socket, roomCode } = get();
    socket?.emit("selectWord", { roomCode, word });
  },

  sendStroke: (stroke: DrawStroke) => {
    const { socket, roomCode } = get();
    set((state: any) => ({ strokes: [...state.strokes, stroke] }));
    socket?.emit("draw", { roomCode, stroke });
  },

  clearCanvas: () => {
    const { socket, roomCode } = get();
    set({ strokes: [] });
    socket?.emit("clearCanvas", { roomCode });
  },

  sendMessage: (message: string) => {
    const { socket, roomCode } = get();
    socket?.emit("sendMessage", { roomCode, message });
  },

  nextRound: () => {
    const { socket, roomCode } = get();
    set({ chatMessages: [] });
    socket?.emit("nextRound", { roomCode });
  },

  kickPlayer: (playerId: string) => {
    const { socket, roomCode } = get();
    socket?.emit("kickPlayer", { roomCode, playerId });
  },

  leaveRoom: () => {
    set({ gameState: "home", roomCode: "", chatMessages: [], strokes: [] });
  },
}));
