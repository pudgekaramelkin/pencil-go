import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import Canvas from "../components/Canvas";
import Chat from "../components/Chat";
import PlayerList from "../components/PlayerList";
import WordSelector from "../components/WordSelector";

export default function Game() {
  const {
    gameState,
    playerId,
    currentDrawerId,
    maskedWord,
    unmaskedWord,
    currentRound,
    totalRounds,
    roundTime,
    roundStartTime,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(roundTime);

useEffect(() => {
  if (gameState !== "drawing" || !roundStartTime) return;

  const interval = setInterval(() => {
    const elapsed = (Date.now() - roundStartTime) / 1000;
    const remaining = Math.max(0, roundTime - elapsed);
    setTimeLeft(Math.floor(remaining));

    if (remaining <= 0) {
      clearInterval(interval);
    }
  }, 100);

  return () => clearInterval(interval);
}, [gameState, roundStartTime, roundTime]);

  const isDrawer = playerId === currentDrawerId;

  if (gameState === "choosing" && isDrawer) {
    return <WordSelector />;
  }

  if (gameState === "choosing" && !isDrawer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 max-w-md w-full">
          <div className="animate-pulse">
            <div className="text-5xl mb-5">✏️</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Ожидание рисующего...
            </h2>
            <p className="text-gray-600 mt-3">Рисующий выбирает слово</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-5 mb-4 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-lg font-semibold text-gray-800">
              Раунд {currentRound} / {totalRounds}
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 text-transparent bg-clip-text">
              {isDrawer ? unmaskedWord : maskedWord || "_ _ _ _"}
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold ${timeLeft <= 5 ? "text-red-600 animate-pulse" : "text-gray-800"}`}
            >
              {timeLeft} с.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 backdrop-blur-sm rounded-2xl">
            <Canvas />
          </div>

          <div className="space-y-4">
            <PlayerList />
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}
