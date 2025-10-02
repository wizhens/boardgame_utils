import { useState } from "react";
import "./App.css";
import Roulette from "./routes/Roulette";
import FirstPlayerRoulette from "./routes/FirstPlayerRoulette";
import Dice from "./routes/Dice";
import Results from "./routes/Results";
import Games from "./routes/GamesTable";

function App() {
  const [active, setActive] = useState<
    "results" | "roulette" | "first" | "dice" | "games"
  >("results");
  return (
    <>
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-12 flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${
              active === "results"
                ? "bg-primary text-primary-foreground"
                : "border"
            }`}
            onClick={() => setActive("results")}
          >
            勝敗表
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${
              active === "roulette"
                ? "bg-primary text-primary-foreground"
                : "border"
            }`}
            onClick={() => setActive("roulette")}
          >
            ゲーム抽選
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${
              active === "first"
                ? "bg-primary text-primary-foreground"
                : "border"
            }`}
            onClick={() => setActive("first")}
          >
            先手抽選
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${
              active === "dice"
                ? "bg-primary text-primary-foreground"
                : "border"
            }`}
            onClick={() => setActive("dice")}
          >
            ダイス
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${
              active === "games"
                ? "bg-primary text-primary-foreground"
                : "border"
            }`}
            onClick={() => setActive("games")}
          >
            ゲーム管理
          </button>
        </div>
      </nav>
      {active === "results" && <Results />}
      {active === "roulette" && <Roulette />}
      {active === "first" && <FirstPlayerRoulette />}
      {active === "dice" && <Dice />}
      {active === "games" && <Games />}
    </>
  );
}

export default App;
