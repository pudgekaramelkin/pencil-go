import { useGameStore } from "../store/gameStore";
import { EMPTY_PLAYER_INITIAL } from "../constants/ui";

export default function Lobby() {
  const {
    roomCode,
    playerId,
    hostId,
    players,
    maxPlayers,
    totalRounds,
    roundTime,
    toggleReady,
    updateSettings,
    startGame,
    kickPlayer,
    leaveRoom,
  } = useGameStore();

  const isHost = playerId === hostId;
  const canStart =
    players.length >= 3 &&
    players.filter((p) => p.id !== hostId).every((p) => p.isReady);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                Комната: {roomCode}
              </h1>
              <p className="text-gray-600 mt-1">Ожидание игроков...</p>
            </div>
            <button
              onClick={leaveRoom}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Покинуть комнату
            </button>
          </div>

          {isHost && (
            <div className="bg-gray-50/80 rounded-xl p-6 mb-6 border border-gray-200/50">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Настройки игры
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Макс. игроков
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={maxPlayers}
                    onChange={(e) =>
                      updateSettings({ maxPlayers: +e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Количество раундов
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={totalRounds}
                    onChange={(e) =>
                      updateSettings({ totalRounds: +e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время раунда (сек)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    value={roundTime}
                    onChange={(e) =>
                      updateSettings({ roundTime: +e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="font-bold text-xl text-gray-800 mb-4">
              Игроки ({players.length}/{maxPlayers})
            </h3>
            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    player.id === playerId
                      ? "bg-blue-50/80 border border-blue-200"
                      : "bg-gray-50/80 border border-gray-200/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {player.name[0]?.toUpperCase() ?? EMPTY_PLAYER_INITIAL}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        {player.name}
                        {player.id === hostId && (
                          <span className="text-xs bg-yellow-400 px-2.5 py-1 rounded-full">
                            Создатель
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.id === hostId ? (
                          "Готов"
                        ) : player.isReady ? (
                          <span className="text-green-600">✓ Готов</span>
                        ) : (
                          <span className="text-orange-500">Не готов</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isHost && player.id !== hostId && (
                    <button
                      onClick={() => kickPlayer(player.id)}
                      className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
                    >
                      Выгнать
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {!isHost ? (
              <button
                onClick={toggleReady}
                className={`flex-1 py-3.5 ${
                  players.find((p) => p.id === playerId)?.isReady
                    ? "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                } text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg active:scale-[0.98]`}
              >
                {players.find((p) => p.id === playerId)?.isReady
                  ? "Не готов"
                  : "Готов"}
              </button>
            ) : (
              <button
                onClick={startGame}
                disabled={!canStart}
                className={`flex-1 py-3.5 ${
                  canStart
                    ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    : "bg-gradient-to-r from-gray-400 to-gray-300 cursor-not-allowed"
                } text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg active:scale-[0.98]`}
              >
                Начать игру
              </button>
            )}
          </div>

          {isHost && !canStart && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Необходимо хотя бы 3 игрока и чтобы все были готовы
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
