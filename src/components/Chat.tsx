import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";

export default function Chat() {
  const { chatMessages, sendMessage, playerId, currentDrawerId, players } =
    useGameStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentPlayer = players.find((p) => p.id === playerId);
  const isDrawer = playerId === currentDrawerId;
  const hasGuessed = currentPlayer?.hasGuessedCorrectly;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isDrawer && !hasGuessed) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 h-96 flex flex-col border border-white/20">
      <h3 className="font-semibold text-lg text-gray-800 mb-3">Чат</h3>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scroll">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl ${
              msg.playerId === playerId
                ? "bg-gradient-to-r from-blue-50/80 to-blue-100/80 border border-blue-200/50 ml-8"
                : "bg-gray-50/80 border border-gray-200/50 mr-8"
            }`}
          >
            <div
              className={`font-semibold text-sm ${
                msg.playerId === playerId ? "text-blue-700" : "text-gray-700"
              }`}
            >
              {msg.playerName}
            </div>
            <div className="text-gray-800 mt-1">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isDrawer
              ? "Вы рисуете..."
              : hasGuessed
                ? "Вы угадали правильно!"
                : "Введите вашу догадку..."
          }
          disabled={isDrawer || hasGuessed}
          className={`w-full px-4 py-2.5 rounded-xl border ${
            isDrawer || hasGuessed
              ? "border-gray-300 bg-gray-100/50 text-gray-500"
              : "border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          } transition-all`}
        />
      </form>
    </div>
  );
}
