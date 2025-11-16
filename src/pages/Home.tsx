import { useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const { createRoom, joinRoom } = useGameStore();

  const handleCreate = () => {
    if (playerName.trim().length < 2) {
      alert("Имя должно быть не менее 2 символов");
      return;
    }
    createRoom(playerName.trim());
  };

  const handleJoin = () => {
    if (playerName.trim().length < 2) {
      alert("Имя должно быть не менее 2 символов");
      return;
    }
    if (roomCode.trim().length !== 6) {
      alert("Код комнаты должен содержать 6 символов");
      return;
    }
    joinRoom(roomCode.trim(), playerName.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-lg border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-3">
            Pencil GO
          </h1>
          <p className="text-gray-600 text-lg">
            Рисуйте, угадавайте и выигрывайте!
          </p>
        </div>

        {mode === "menu" && (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setMode("create")}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Создать комнату
            </button>
            <button
              onClick={() => setMode("join")}
              className="px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Присоединиться к комнате
            </button>
          </div>
        )}

        {(mode === "create" || mode === "join") && (
          <div className="space-y-5">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ваше имя"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="w-full px-5 py-3.5 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />

              {mode === "join" && (
                <input
                  type="text"
                  placeholder="Код комнаты"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full px-5 py-3.5 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent uppercase tracking-widest font-mono"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={mode === "create" ? handleCreate : handleJoin}
                className="col-span-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {mode === "create" ? "Создать" : "Присоединиться"}
              </button>
              <button
                onClick={() => setMode("menu")}
                className="col-span-1 px-6 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-lg"
              >
                Назад
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
