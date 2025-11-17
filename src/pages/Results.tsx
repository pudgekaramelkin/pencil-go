import { useGameStore } from "../store/gameStore";
import { EMPTY_PLAYER_INITIAL } from "../constants/ui";

export default function Results() {
  const {
    gameState,
    players,
    currentRound,
    totalRounds,
    nextRound,
    leaveRoom,
    playerId,
    hostId,
  } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isHost = playerId === hostId;
  const isGameOver = gameState === "gameOver";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
            {isGameOver ? "🏆 Игра окончена!" : "✨ Раунд завершен!"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isGameOver
              ? "Финальные результаты"
              : `Раунд ${currentRound} / ${totalRounds}`}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-5 rounded-xl ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400"
                  : index === 1
                    ? "bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-400"
                    : index === 2
                      ? "bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-400"
                      : "bg-gray-50/80 border border-gray-200/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`text-2xl font-bold ${
                    index === 0
                      ? "text-yellow-600"
                      : index === 1
                        ? "text-gray-600"
                        : index === 2
                          ? "text-orange-600"
                          : "text-gray-500"
                  }`}
                >
                  {index === 0
                    ? "1"
                    : index === 1
                      ? "2"
                      : index === 2
                        ? "3"
                        : `${index + 1}`}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {player.name[0]?.toUpperCase() ?? EMPTY_PLAYER_INITIAL}
                </div>
                <div
                  className={`font-semibold text-lg ${
                    index === 0
                      ? "text-yellow-800"
                      : index === 1
                        ? "text-gray-800"
                        : index === 2
                          ? "text-orange-800"
                          : "text-gray-700"
                  }`}
                >
                  {player.name}
                </div>
              </div>
              <div
                className={`text-2xl font-bold ${
                  index === 0
                    ? "text-yellow-600"
                    : index === 1
                      ? "text-gray-600"
                      : index === 2
                        ? "text-orange-600"
                        : "text-indigo-600"
                }`}
              >
                {player.score}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isGameOver && isHost && (
            <button
              onClick={nextRound}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Следующий раунд
            </button>
          )}
          {!isGameOver && !isHost && (
            <div className="flex-1 py-3.5 bg-gray-100/50 border border-gray-300 text-gray-600 rounded-xl text-center font-semibold">
              Ожидание создателя комнаты...
            </div>
          )}
          {isGameOver && (
            <button
              onClick={leaveRoom}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              На главную
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
