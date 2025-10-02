import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./routes/About";
import NotFound from "./routes/NotFound";
import GamesTable from "./routes/GamesTable";
import FirstPlayerRoulette from "./routes/FirstPlayerRoulette";
import Dice from "./routes/Dice";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/first" element={<FirstPlayerRoulette />} />
        <Route path="/dice" element={<Dice />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/games" element={<GamesTable />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
