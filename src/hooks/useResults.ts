import { useEffect, useMemo, useState } from "react";

type WinLoss = {
  w: number; // wins
  l: number; // losses
};

export type ResultsMatrix = Record<string, Record<string, WinLoss>>;

const STORAGE_KEY = "boardgame.results.v1";

export function useResults(options?: {
  gameIds?: string[];
  userIds?: string[];
}) {
  const { gameIds = [], userIds = [] } = options ?? {};
  const [results, setResults] = useState<ResultsMatrix>({});

  // 初回ロード
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === "object") {
        const loaded: ResultsMatrix = {};
        for (const [gid, byUser] of Object.entries<any>(data)) {
          if (typeof byUser !== "object" || byUser === null) continue;
          loaded[gid] = {};
          for (const [uid, wl] of Object.entries<any>(byUser)) {
            const w = Number((wl as any).w ?? 0) || 0;
            const l = Number((wl as any).l ?? 0) || 0;
            if (w !== 0 || l !== 0) loaded[gid][uid] = { w, l };
          }
        }
        setResults(loaded);
      }
    } catch {
      // noop
    }
  }, []);

  // 永続化
  useEffect(() => {
    try {
      const hasAny = Object.values(results).some(
        (byUser) => Object.keys(byUser).length > 0
      );
      if (hasAny) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // noop
    }
  }, [results]);

  // 参照クリーンアップ（存在しないゲーム/ユーザーのレコードは削除）
  useEffect(() => {
    if (gameIds.length === 0 && userIds.length === 0) return;
    setResults((prev) => {
      let changed = false;
      const gameSet = new Set(gameIds);
      const userSet = new Set(userIds);
      const next: ResultsMatrix = {};
      for (const [gid, byUser] of Object.entries(prev)) {
        if (!gameSet.has(gid)) {
          changed = true;
          continue;
        }
        const filtered: Record<string, WinLoss> = {};
        for (const [uid, wl] of Object.entries(byUser)) {
          if (!userSet.has(uid)) {
            changed = true;
            continue;
          }
          filtered[uid] = wl;
        }
        next[gid] = filtered;
      }
      return changed ? next : prev;
    });
  }, [gameIds, userIds]);

  const increment = (
    gameId: string,
    userId: string,
    kind: "w" | "l",
    delta = 1
  ) => {
    setResults((prev) => {
      const byUser = prev[gameId] ?? {};
      const cur = byUser[userId] ?? { w: 0, l: 0 };
      const next: ResultsMatrix = {
        ...prev,
        [gameId]: {
          ...byUser,
          [userId]: {
            w: kind === "w" ? Math.max(0, cur.w + delta) : cur.w,
            l: kind === "l" ? Math.max(0, cur.l + delta) : cur.l,
          },
        },
      };
      return next;
    });
  };

  const resetGame = (gameId: string) => {
    setResults((prev) => {
      if (!(gameId in prev)) return prev;
      const next = { ...prev };
      delete next[gameId];
      return next;
    });
  };

  const resetAll = () => setResults({});

  // 集計
  const totalsByUser = useMemo(() => {
    const map: Record<string, WinLoss> = {};
    for (const byUser of Object.values(results)) {
      for (const [uid, wl] of Object.entries(byUser)) {
        if (!map[uid]) map[uid] = { w: 0, l: 0 };
        map[uid].w += wl.w;
        map[uid].l += wl.l;
      }
    }
    return map;
  }, [results]);

  const totalsByGame = useMemo(() => {
    const map: Record<string, WinLoss> = {};
    for (const [gid, byUser] of Object.entries(results)) {
      let w = 0;
      let l = 0;
      for (const wl of Object.values(byUser)) {
        w += wl.w;
        l += wl.l;
      }
      map[gid] = { w, l };
    }
    return map;
  }, [results]);

  return {
    results,
    increment,
    resetGame,
    resetAll,
    totalsByUser,
    totalsByGame,
  } as const;
}
