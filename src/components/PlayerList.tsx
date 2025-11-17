import { useGameStore } from "../store/gameStore";
import { EMPTY_PLAYER_INITIAL } from "../constants/ui";

export default function PlayerList() {
  const { players, currentDrawerId } = useGameStore();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
      <h3 className="font-semibold text-lg text-gray-800 mb-3">Игроки</h3>
      <div className="space-y-3">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-xl ${
              player.id === currentDrawerId
                ? "bg-gradient-to-r from-blue-100/80 to-blue-50/80 border-2 border-blue-300/70"
                : "bg-gray-50/80 border border-gray-200/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  player.id === currentDrawerId
                    ? "bg-gradient-to-r from-blue-600 to-blue-500"
                    : "bg-gradient-to-r from-gray-600 to-gray-500"
                }`}
              >
                {player.name[0]?.toUpperCase() ?? EMPTY_PLAYER_INITIAL}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{player.name}</div>
                <div className="flex gap-2 items-center">
                  {player.id === currentDrawerId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      ✏️ Рисует
                    </span>
                  )}
                  {player.hasGuessedCorrectly &&
                    player.id !== currentDrawerId && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ✓ Угадал
                      </span>
                    )}
                </div>
              </div>
            </div>
            <div
              className={`font-bold ${
                player.id === currentDrawerId
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {player.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
