import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { RoomManager } from "./roomManager.js";
import { GameLogic } from "./gameLogic.js";
import { containsProfanity } from "./profanityFilter.js";
import type { DrawStroke } from "./types.js";

interface SocketResponse {
  success: boolean;
  error?: string;
  roomCode?: string;
}

interface GameSettings {
  maxPlayers?: number;
  totalRounds?: number;
  roundTime?: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const roomManager = new RoomManager();
const gameLogic = new GameLogic();
const revealTimers = new Map<string, NodeJS.Timeout[]>();

app.use(express.static(join(__dirname, "../dist")));

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    rooms: roomManager.getRoomCount(),
    connections: io.engine.clientsCount,
  });
});

app.get("/api/info", (_, res) => {
  res.json({
    name: "Pencil GO API",
    version: "1.0.0",
    status: "running",
  });
});

io.on("connection", (socket) => {
  console.log("Пользователь подключился:", socket.id);

  socket.on(
    "createRoom",
    (
      { playerName }: { playerName: string },
      callback: (res: SocketResponse) => void
    ) => {
      if (containsProfanity(playerName)) {
        callback({ success: false, error: "Недопустимое имя" });
        return;
      }

      const room = roomManager.createRoom(socket.id, playerName);
      socket.join(room.code);
      callback({ success: true, roomCode: room.code });
      emitRoomState(room.code);
    },
  );

  socket.on(
    "joinRoom",
    (
      { roomCode, playerName }: { roomCode: string; playerName: string },
      callback: (res: SocketResponse) => void
    ) => {
      if (containsProfanity(playerName)) {
        callback({ success: false, error: "Недопустимое имя" });
        return;
      }

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        callback({ success: false, error: "Комната не найдена" });
        return;
      }

      if (!roomManager.addPlayer(roomCode, socket.id, playerName)) {
        callback({ success: false, error: "Комната заполнена" });
        return;
      }

      socket.join(roomCode);
      callback({ success: true });
      emitRoomState(roomCode);
    },
  );

  socket.on("toggleReady", ({ roomCode }: { roomCode: string }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player && socket.id !== room.hostId) {
      player.isReady = !player.isReady;
      emitRoomState(roomCode);
    }
  });

  socket.on(
    "updateSettings",
    ({
      roomCode,
      settings,
    }: {
      roomCode: string;
      settings: GameSettings;
    }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room || socket.id !== room.hostId) return;

      if (settings.maxPlayers)
        room.maxPlayers = Math.min(10, Math.max(3, settings.maxPlayers));
      if (settings.totalRounds)
        room.totalRounds = Math.min(10, Math.max(1, settings.totalRounds));
      if (settings.roundTime)
        room.roundTime = Math.min(120, Math.max(15, settings.roundTime));

      emitRoomState(roomCode);
    },
  );

  socket.on("startGame", async ({ roomCode }: { roomCode: string }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || socket.id !== room.hostId || room.players.size < 3) return;

    await gameLogic.startGame(room);
    emitRoomState(roomCode);
  });

  socket.on(
    "selectWord",
    ({ roomCode, word }: { roomCode: string; word: string }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room || socket.id !== room.currentDrawerId) return;

      gameLogic.selectWord(room, word);
      emitRoomState(roomCode);
      startRoundTimers(roomCode);
    },
  );

  socket.on(
    "draw",
    ({ roomCode, stroke }: { roomCode: string; stroke: DrawStroke }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room || socket.id !== room.currentDrawerId) return;

      room.strokes.push(stroke);
      socket.to(roomCode).emit("drawUpdate", stroke);
    },
  );

  socket.on("clearCanvas", ({ roomCode }: { roomCode: string }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || socket.id !== room.currentDrawerId) return;

    room.strokes = [];
    io.to(roomCode).emit("canvasCleared");
  });

  socket.on(
    "sendMessage",
    ({ roomCode, message }: { roomCode: string; message: string }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      if (room.gameState === "drawing" && socket.id !== room.currentDrawerId) {
        const isCorrect = gameLogic.checkGuess(room, socket.id, message);

        if (isCorrect) {
          io.to(roomCode).emit("correctGuess", {
            playerId: socket.id,
            playerName: player.name,
          });
          emitRoomState(roomCode);

          const nonDrawers = Array.from(room.players.keys()).filter(
            (id) => id !== room.currentDrawerId,
          );
          const allGuessed = nonDrawers.every((id) =>
            room.guessedPlayers.has(id),
          );

          if (allGuessed) {
            endRoundNow(roomCode);
          }
          return;
        }
      }

      io.to(roomCode).emit("chatMessage", {
        playerId: socket.id,
        playerName: player.name,
        message,
        timestamp: Date.now(),
      });
    },
  );

  socket.on("nextRound", async ({ roomCode }: { roomCode: string }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || socket.id !== room.hostId) return;

    await gameLogic.nextRound(room);
    emitRoomState(roomCode);
  });

  socket.on(
    "kickPlayer",
    ({ roomCode, playerId }: { roomCode: string; playerId: string }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room || socket.id !== room.hostId) return;

      io.to(playerId).emit("kicked");
      roomManager.removePlayer(roomCode, playerId);
      io.in(playerId).socketsLeave(roomCode);
      emitRoomState(roomCode);
    },
  );

  socket.on("disconnect", () => {
    console.log("Пользователь отключился:", socket.id);

    const room = roomManager.findRoomByPlayerId(socket.id);
    if (room) {
      roomManager.removePlayer(room.code, socket.id);
      emitRoomState(room.code);
    }
  });
});

function emitRoomState(roomCode: string): void {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  const players = Array.from(room.players.values());

  io.to(roomCode).emit("roomState", {
    code: room.code,
    hostId: room.hostId,
    players,
    maxPlayers: room.maxPlayers,
    totalRounds: room.totalRounds,
    roundTime: room.roundTime,
    currentRound: room.currentRound,
    currentDrawerId: room.currentDrawerId,
    gameState: room.gameState,
    wordOptions: room.wordOptions,
    maskedWord: gameLogic.getMaskedWord(room),
    unmaskedWord: room.currentWord,
    strokes: room.strokes,
    roundStartTime: room.roundStartTime,
  });
}

function startRoundTimers(roomCode: string): void {
  clearRoundTimers(roomCode);

  const room = roomManager.getRoom(roomCode);
  if (!room || !room.currentWord) return;

  const timers: NodeJS.Timeout[] = [];

  const letters = room.currentWord
    .split("")
    .filter((char) => char !== " ")
    .length;

  const lettersToReveal = Math.max(0, letters - 1);

  if (lettersToReveal > 0) {
    const finalRevealTime = 5;
    const revealDuration = Math.max(1, room.roundTime - finalRevealTime);
    const interval = revealDuration / lettersToReveal;

    for (let i = 0; i < lettersToReveal; i++) {
      const delay = Math.round(interval * (i + 1) * 1000);
      const timer = setTimeout(() => {
        gameLogic.revealLetter(room);
        emitRoomState(roomCode);
      }, delay);
      timers.push(timer);
    }

    const finalRevealTimer = setTimeout(() => {
      gameLogic.revealAllButOne(room);
      emitRoomState(roomCode);
    }, (room.roundTime - finalRevealTime) * 1000);
    timers.push(finalRevealTimer);
  }

  const endTimer = setTimeout(() => {
    endRoundNow(roomCode);
  }, room.roundTime * 1000);

  timers.push(endTimer);
  revealTimers.set(roomCode, timers);
}

function endRoundNow(roomCode: string): void {
  clearRoundTimers(roomCode);

  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  gameLogic.endRound(room);
  emitRoomState(roomCode);
}

function clearRoundTimers(roomCode: string): void {
  const timers = revealTimers.get(roomCode);
  if (timers) {
    timers.forEach((t) => clearTimeout(t));
    revealTimers.delete(roomCode);
  }
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (_, res) => {
    res.sendFile(join(__dirname, "../dist/index.html"));
  });
}

const host = "0.0.0.0";
httpServer.listen(PORT, host, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://<your-ip>:${PORT}`);
  }
});
