import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";

function App() {
  const { gameState, initSocket } = useGameStore();

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <div className="min-h-screen">
      {gameState === "home" && <Home />}
      {gameState === "lobby" && <Lobby />}
      {(gameState === "choosing" || gameState === "drawing") && <Game />}
      {(gameState === "results" || gameState === "gameOver") && <Results />}
    </div>
  );
}

export default App;
