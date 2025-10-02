import { useEffect, useState } from "react";

export type Game = {
  id: string;
  name: string;
  genre: string;
  weight: "軽量" | "中量" | "重量";
};

const STORAGE_KEY = "boardgame.games.v1";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);

  // 初期ロード
  useEffect(() => {
    try {
      // localStorage.setItem(
      //   "boardgame.games.v1",
      //   JSON.stringify([
      //     { name: "ウキヨエ", genre: "Ukiyo-e", weight: "軽量" },
      //     { name: "アメリアの秘密", genre: "Amelia's Secret", weight: "中量" },
      //     {
      //       name: "ディズニー・ヴィランズ 拡張版1 ―邪悪なるもの―",
      //       genre: "Villainous: Wicked to the Core",
      //       weight: "重量",
      //     },
      //     {
      //       name: "ディズニー・ヴィランズ 拡張版2 ―悪者は用意周到―",
      //       genre: "Disney Villainous: Evil Comes Prepared",
      //       weight: "重量",
      //     },
      //     {
      //       name: "ディズニー・ヴィランズ 拡張版3 ―完璧な不幸―",
      //       genre: "Disney Villainous: Perfectly Wretched",
      //       weight: "重量",
      //     },
      //     {
      //       name: "ディズニー・ヴィランズ ―悪の勝利―",
      //       genre: "Villainous",
      //       weight: "重量",
      //     },
      //     { name: "どうぶつ食堂", genre: "Doubutsu Shokudo", weight: "軽量" },
      //     { name: "カタン", genre: "Die Siedler von Catan", weight: "重量" },
      //     {
      //       name: "ザ・ヴェイル・オブ・エタニティ",
      //       genre: "The Vale of Eternity",
      //       weight: "中量",
      //     },
      //     { name: "コーヒーラッシュ", genre: "Coffee Rush", weight: "軽量" },
      //     { name: "ジキルvsハイド", genre: "Jekyll vs. Hyde", weight: "軽量" },
      //     { name: "ウイングスパン", genre: "Wingspan", weight: "重量" },
      //     {
      //       name: "精霊回路ドライヴ Ctrl-Z／ゼロ",
      //       genre: "Seirei Kairo Drive: Ctrl-Z/Zero",
      //       weight: "重量",
      //     },
      //     { name: "パッチワーク", genre: "Patchwork", weight: "軽量" },
      //     {
      //       name: "ウミガメのスープ",
      //       genre: "Umigame no Soup",
      //       weight: "中量",
      //     },
      //     {
      //       name: "双子の王子 リボーン版",
      //       genre: "Twin princes Reborn edition",
      //       weight: "中量",
      //     },
      //     {
      //       name: "街コロ（新装版）",
      //       genre: "Machikoro Sinsou",
      //       weight: "軽量",
      //     },
      //     { name: "ガムトーク", genre: "Gum Talk", weight: "重量" },
      //     {
      //       name: "なつのたからもの",
      //       genre: "Circus Flohcati / Zirkus Flohcati: Japanese Edition",
      //       weight: "軽量",
      //     },
      //     { name: "ウィザーズカップ", genre: "Wizards Cup", weight: "軽量" },
      //     {
      //       name: "フラワーマーケット",
      //       genre: "Flower Market",
      //       weight: "中量",
      //     },
      //     { name: "ギリギリカレー", genre: "GiriGiri Curry", weight: "軽量" },
      //     {
      //       name: "スカイチーム追加フライト：乱気流",
      //       genre: "Sky Team: Turbulence",
      //       weight: "軽量",
      //     },
      //     { name: "カルカソンヌ21", genre: "Carcassonne 21", weight: "中量" },
      //     { name: "トポロメモリー", genre: "Topolo Memory", weight: "軽量" },
      //     { name: "音速飯店", genre: "Onsoku Hanten", weight: "軽量" },
      //     {
      //       name: "ドロッセルマイヤーさんのさんぽ神",
      //       genre: "God of Walk",
      //       weight: "中量",
      //     },
      //     {
      //       name: "おばけキャッチ〜ミニチュアカードゲームコレクションvol.3〜",
      //       genre: "Ghost Blitz 〜miniature card game collection vol.3〜",
      //       weight: "軽量",
      //     },
      //     { name: "ニムト", genre: "6 nimmt!", weight: "中量" },
      //     { name: "トゥールームス", genre: "TWO ROOMS", weight: "軽量" },
      //     {
      //       name: "ドラスレ：ミンキャス（拡張）",
      //       genre: "DORASURE: MinCas",
      //       weight: "軽量",
      //     },
      //     { name: "キューボサウルス", genre: "Cubosaurs", weight: "軽量" },
      //     {
      //       name: "冒険者達のびしゅかこう",
      //       genre: "Adventurers Treats",
      //       weight: "軽量",
      //     },
      //     {
      //       name: "ツインイット！：ゲーマーズエディション",
      //       genre: "Twin It: Gamers Edition",
      //       weight: "軽量",
      //     },
      //     {
      //       name: "ブロックス",
      //       genre: "Blokus / The Strategy Game",
      //       weight: "軽量",
      //     },
      //     { name: "シネマポップコーン", genre: "Popcorn", weight: "重量" },
      //     { name: "ガイスター", genre: "Ghosts! / Geister", weight: "軽量" },
      //     {
      //       name: "てのひらダンジョン",
      //       genre: "Tenohira Dungeon",
      //       weight: "軽量",
      //     },
      //     { name: "マドリイズム", genre: "MADORI-ISM", weight: "軽量" },
      //     {
      //       name: "確定申告が学べるゲーム",
      //       genre: "KAKU TEI SHIN KOKU GAME",
      //       weight: "中量",
      //     },
      //     { name: "ウリカイ", genre: "Urikai", weight: "中量" },
      //     { name: "ドラスレ", genre: "DORASURE", weight: "中量" },
      //     {
      //       name: "バンディド ～ミニチュアカードゲームコレクション～",
      //       genre: "Bandido Miniature CardgamesCollection",
      //       weight: "軽量",
      //     },
      //     { name: "スカイチーム", genre: "Sky Team", weight: "軽量" },
      //     {
      //       name: "リトルタウンビルダーズ",
      //       genre: "Little Town Builders",
      //       weight: "軽量",
      //     },
      //     { name: "アズール", genre: "Azul", weight: "中量" },
      //   ])
      // );
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const loaded: Game[] = data
          .map((g) => ({
            id: String(g.id ?? crypto.randomUUID()),
            name: String(g.name ?? ""),
            genre: String(g.genre ?? ""),
            weight:
              g.weight === "軽量" || g.weight === "中量" || g.weight === "重量"
                ? g.weight
                : ("軽量" as const),
          }))
          .filter((g) => g.name);
        if (loaded.length > 0) setGames(loaded);
      }
    } catch {
      console.error("Failed to load games");
    }
  }, []);

  // 保存
  useEffect(() => {
    try {
      if (games.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      console.error("Failed to save games");
    }
  }, [games]);

  const addGame = (
    nameRaw: string,
    genreRaw: string,
    weight: Game["weight"]
  ) => {
    const name = nameRaw.trim();
    const genre = genreRaw.trim();
    if (!name) return;
    setGames((prev) => {
      if (prev.some((g) => g.name === name)) return prev;
      return [...prev, { id: crypto.randomUUID(), name, genre, weight }];
    });
  };

  const removeGame = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGame = (
    id: string,
    updates: Partial<Pick<Game, "name" | "genre" | "weight">>
  ) => {
    setGames((prev) => {
      const target = prev.find((g) => g.id === id);
      if (!target) return prev;

      const nextName = (updates.name ?? target.name).trim();
      const nextGenre = (updates.genre ?? target.genre).trim();
      const nextWeight =
        updates.weight === "軽量" ||
        updates.weight === "中量" ||
        updates.weight === "重量"
          ? updates.weight
          : target.weight;

      if (!nextName) return prev; // 空名は無視
      if (prev.some((g) => g.id !== id && g.name === nextName)) return prev; // 重複名は無視

      return prev.map((g) =>
        g.id === id
          ? { ...g, name: nextName, genre: nextGenre, weight: nextWeight }
          : g
      );
    });
  };

  const clearAll = () => {
    setGames([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.error("Failed to clear all games");
    }
  };

  return {
    games,
    addGame,
    removeGame,
    updateGame,
    clearAll,
  } as const;
}
