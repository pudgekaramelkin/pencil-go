import { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { useGameStore } from "../store/gameStore";

export default function Canvas() {
  const { playerId, currentDrawerId, strokes, sendStroke, clearCanvas } =
    useGameStore();
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[]>([]);

  const isDrawer = playerId === currentDrawerId;
  const stageRef = useRef<any>(null);

  const handleMouseDown = (e: any) => {
    if (!isDrawer) return;
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setCurrentLine([pos.x, pos.y]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !isDrawer) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setCurrentLine([...currentLine, point.x, point.y]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isDrawer) return;
    setIsDrawing(false);
    if (currentLine.length > 0) {
      const stroke = {
        tool,
        points: currentLine,
        color: tool === "pen" ? color : "#FFFFFF",
        size: tool === "pen" ? size : size * 3,
      };
      sendStroke(stroke);
    }
    setCurrentLine([]);
  };

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
  ];

  return (
    <div className="bg-white/95 rounded-2xl shadow-xl p-4 border border-white/20">
      {isDrawer && (
        <div className="mb-3 flex flex-wrap gap-3 items-center bg-gradient-to-r from-blue-50/50 to-teal-50/50 p-3 rounded-xl border border-gray-200/50">
          <div className="flex gap-2">
            <button
              onClick={() => setTool("pen")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                tool === "pen"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              ✏️ Кисть
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                tool === "eraser"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              🧹 Ластик
            </button>
          </div>

          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c
                    ? "border-blue-600 scale-110"
                    : "border-gray-300 hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700">
              Размер:
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-20 accent-blue-600"
            />
            <span className="text-xs font-medium text-gray-700 w-6">
              {size}
            </span>
          </div>

          <button
            onClick={clearCanvas}
            className="ml-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-sm"
          >
            Очистить
          </button>
        </div>
      )}

      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
        <Stage
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {strokes.map((stroke, i) => (
              <Line
                key={i}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.size}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  stroke.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
            {isDrawing && currentLine.length > 0 && (
              <Line
                points={currentLine}
                stroke={tool === "pen" ? color : "#FFFFFF"}
                strokeWidth={tool === "pen" ? size : size * 3}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
