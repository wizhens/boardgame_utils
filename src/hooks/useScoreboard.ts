import { useEffect, useMemo, useState } from "react";

export type ScoreValue = "none" | "win" | "lose";

export type ScoreRow = {
  id: string;
  gameId: string | null;
  firstPlayerId: string | null;
  cells: Record<string, ScoreValue>; // userId -> score
};

const STORAGE_KEY = "boardgame.scoreboard.v1";

export function useScoreboard(options?: {
  userIds?: string[];
  initialRows?: number;
}) {
  const { userIds = [], initialRows = 1 } = options ?? {};

  const [rows, setRows] = useState<ScoreRow[]>([]);

  // 初回ロード or 初期行作成
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          const loaded: ScoreRow[] = data
            .map((r) => ({
              id: String(r.id ?? crypto.randomUUID()),
              gameId: (r.gameId ?? null) as string | null,
              firstPlayerId: (r.firstPlayerId ?? null) as string | null,
              cells:
                typeof r.cells === "object" && r.cells
                  ? Object.fromEntries(
                      Object.entries<any>(r.cells).map(([uid, v]) => [
                        uid,
                        v === "win" || v === "lose" ? v : ("none" as const),
                      ])
                    )
                  : {},
            }))
            .filter((r) => r.id);
          if (loaded.length > 0) {
            setRows(loaded);
            return;
          }
        }
      }
    } catch {}
    // なければ初期行を用意
    setRows(() =>
      Array.from({ length: Math.max(1, initialRows) }, () => ({
        id: crypto.randomUUID(),
        gameId: null,
        firstPlayerId: null,
        cells: {},
      }))
    );
  }, [initialRows]);

  // 永続化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {}
  }, [rows]);

  // ユーザーIDの増減に追従（セル追加/削除）
  useEffect(() => {
    if (!userIds) return;
    setRows((prev) => {
      const userSet = new Set(userIds);
      let changed = false;
      const next = prev.map((row) => {
        const nextCells: Record<string, ScoreValue> = {};
        // 既存をフィルタ
        for (const [uid, val] of Object.entries(row.cells)) {
          if (userSet.has(uid)) nextCells[uid] = val;
          else changed = true;
        }
        // 新規ユーザーを none で追加
        for (const uid of userSet) {
          if (!(uid in nextCells)) {
            nextCells[uid] = "none";
            changed = true;
          }
        }
        if (!changed) return row;
        return { ...row, cells: nextCells };
      });
      return changed ? next : prev;
    });
  }, [userIds]);

  const setRowCount = (count: number) => {
    const n = Math.max(1, Math.floor(count || 1));
    setRows((prev) => {
      if (n === prev.length) return prev;
      if (n < prev.length) return prev.slice(0, n);
      const add = n - prev.length;
      const templateCells = prev[0]?.cells ?? {};
      const extras: ScoreRow[] = Array.from({ length: add }, () => ({
        id: crypto.randomUUID(),
        gameId: null,
        firstPlayerId: null,
        cells: { ...templateCells },
      }));
      return [...prev, ...extras];
    });
  };

  const addRow = () => setRowCount(rows.length + 1);
  const removeLastRow = () => setRowCount(rows.length - 1);

  const setRowGame = (rowId: string, gameId: string | null) =>
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, gameId } : r)));
  const setRowFirstPlayer = (rowId: string, userId: string | null) =>
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, firstPlayerId: userId } : r))
    );

  const cycleCell = (rowId: string, userId: string) =>
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const cur = r.cells[userId] ?? "none";
        const nextVal: ScoreValue =
          cur === "none" ? "win" : cur === "win" ? "lose" : "none";
        return { ...r, cells: { ...r.cells, [userId]: nextVal } };
      })
    );

  const setCell = (rowId: string, userId: string, value: ScoreValue) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, cells: { ...r.cells, [userId]: value } } : r
      )
    );

  const resetRow = (rowId: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              gameId: null,
              firstPlayerId: null,
              cells: Object.fromEntries(
                Object.keys(r.cells).map((uid) => [uid, "none"])
              ),
            }
          : r
      )
    );

  const resetAll = () =>
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        gameId: null,
        firstPlayerId: null,
        cells: Object.fromEntries(
          Object.keys(r.cells).map((uid) => [uid, "none"])
        ),
      }))
    );

  const totalsByUser = useMemo(() => {
    const map: Record<string, { w: number; l: number }> = {};
    for (const row of rows) {
      for (const [uid, v] of Object.entries(row.cells)) {
        if (!map[uid]) map[uid] = { w: 0, l: 0 };
        if (v === "win") map[uid].w += 1;
        else if (v === "lose") map[uid].l += 1;
      }
    }
    return map;
  }, [rows]);

  return {
    rows,
    setRowCount,
    addRow,
    removeLastRow,
    setRowGame,
    setRowFirstPlayer,
    cycleCell,
    setCell,
    resetRow,
    resetAll,
    totalsByUser,
  } as const;
}

