import { useGameStore } from "../store/gameStore";

export default function WordSelector() {
  const { wordOptions, selectWord } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-2">
            Выберите слово
          </h2>
          <p className="text-gray-600">
            Выберите только одно слово для рисования
          </p>
        </div>

        <div className="space-y-4">
          {wordOptions.map((word) => (
            <button
              key={word}
              onClick={() => selectWord(word)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/50 hover:border-blue-300/80 hover:from-blue-100/80 hover:to-teal-100/80 text-blue-900 rounded-xl transition-all duration-300 font-semibold text-lg shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
