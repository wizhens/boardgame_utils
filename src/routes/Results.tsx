import { useGames } from "@/hooks/useGames";
import { usePlayers } from "@/hooks/usePlayer";
import { useScoreboard, type ScoreValue } from "@/hooks/useScoreboard";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsIcon, RotateCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Results() {
  const { games } = useGames();
  const { participants } = usePlayers();

  // 抽選対象設定
  const [gameFilterOpen, setGameFilterOpen] = useState(false);
  const [eligibleGameIds, setEligibleGameIds] = useState<Set<string>>(
    new Set()
  );
  const [weightSort, setWeightSort] = useState<"none" | "asc" | "desc">("none");
  const [weightFilters, setWeightFilters] = useState<
    Set<"軽量" | "中量" | "重量">
  >(new Set());
  const [nameQuery, setNameQuery] = useState("");

  useEffect(() => {
    setEligibleGameIds((prev) => {
      const valid = new Set(games.map((g) => g.id));
      const next = new Set<string>();
      for (const id of prev) {
        if (valid.has(id)) next.add(id);
      }
      if (next.size === 0 && games.length > 0) {
        for (const g of games) next.add(g.id);
      }
      return next;
    });
  }, [games]);

  const gamesFilteredForDialog = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return games.filter((g) => {
      const byWeight =
        weightFilters.size > 0 ? weightFilters.has(g.weight) : true;
      const byText = q
        ? g.name.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q)
        : true;
      return byWeight && byText;
    });
  }, [games, weightFilters, nameQuery]);

  const gamesSortedForDialog = useMemo(() => {
    if (weightSort === "none") return gamesFilteredForDialog;
    const rank: Record<"軽量" | "中量" | "重量", number> = {
      軽量: 1,
      中量: 2,
      重量: 3,
    };
    const list = [...gamesFilteredForDialog];
    list.sort(
      (a, b) =>
        (rank[a.weight] - rank[b.weight]) * (weightSort === "asc" ? 1 : -1)
    );
    return list;
  }, [gamesFilteredForDialog, weightSort]);

  // 抽選対象: チェック済み ∩ ダイアログのフィルタで表示中
  const eligiblePool = useMemo(
    () =>
      gamesFilteredForDialog.filter((g) => {
        return eligibleGameIds.has(g.id);
      }),
    [gamesFilteredForDialog, eligibleGameIds]
  );

  const toggleEligible = (id: string, checked: boolean) => {
    setEligibleGameIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const selectAllEligible = () =>
    setEligibleGameIds(new Set(games.map((g) => g.id)));
  const clearAllEligible = () => setEligibleGameIds(new Set());

  const {
    rows,
    setRowCount,
    addRow,
    removeLastRow,
    setRowGame,
    setRowFirstPlayer,
    cycleCell,
    resetRow,
  } = useScoreboard({ userIds: participants.map((p) => p.id), initialRows: 1 });

  const symbolOf = (v: ScoreValue) =>
    v === "win" ? "◯" : v === "lose" ? "☓" : "-";

  const spinRowGame = (rowId: string) => {
    const pool = eligiblePool;
    if (pool.length === 0) return;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setRowGame(rowId, picked.id);
  };
  const spinRowFirst = (rowId: string) => {
    if (participants.length === 0) return;
    const picked =
      participants[Math.floor(Math.random() * participants.length)];
    setRowFirstPlayer(rowId, picked.id);
  };

  return (
    <main className="pt-16 pb-8 container mx-auto px-4">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          勝敗表（行ベース）
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <span>行数</span>
            <input
              type="number"
              min={1}
              className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm"
              value={rows.length}
              onChange={(e) => setRowCount(parseInt(e.target.value || "1", 10))}
            />
          </label>
          <Button size="sm" variant="secondary" onClick={addRow}>
            行を追加
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={removeLastRow}
            disabled={rows.length <= 1}
          >
            末尾を削除
          </Button>
        </div>
      </header>

      {participants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          ユーザーを登録してください
        </p>
      ) : (
        <div className="overflow-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">行</TableHead>
                <TableHead className="w-96">ゲーム</TableHead>
                <TableHead className="w-52">先手</TableHead>
                {participants.map((u) => (
                  <TableHead
                    key={u.id}
                    className="text-center whitespace-nowrap"
                  >
                    {u.name}
                  </TableHead>
                ))}
                <TableHead className="text-right w-28">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => {
                const gameName =
                  games.find((g) => g.id === row.gameId)?.name ?? "(未選択)";
                const firstName =
                  participants.find((p) => p.id === row.firstPlayerId)?.name ??
                  "(未選択)";
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{idx + 1} 戦目</div>
                    </TableCell>
                    <TableCell className="">
                      <div className="font-medium flex justify-between items-center">
                        <p>{gameName}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => spinRowGame(row.id)}
                            disabled={eligiblePool.length === 0}
                          >
                            ゲーム抽選
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setGameFilterOpen(true)}
                            aria-label="抽選対象の設定"
                          >
                            <SettingsIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium flex justify-between items-center">
                        {firstName}{" "}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => spinRowFirst(row.id)}
                          disabled={participants.length === 0}
                        >
                          先手抽選
                        </Button>
                      </div>
                    </TableCell>
                    {participants.map((u) => {
                      const value = row.cells[u.id] ?? "none";
                      const variant: VariantProps<
                        typeof buttonVariants
                      >["variant"] =
                        value === "win"
                          ? "default"
                          : value === "lose"
                          ? "destructive"
                          : "outline";
                      return (
                        <TableCell key={u.id} className="text-center">
                          <div className="flex items-center justify-center">
                            <Button
                              size="sm"
                              variant={variant}
                              onClick={() => cycleCell(row.id, u.id)}
                              className="w-12"
                            >
                              {symbolOf(value)}
                            </Button>
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => resetRow(row.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 抽選対象ゲーム 設定ダイアログ */}
      <Dialog open={gameFilterOpen} onOpenChange={setGameFilterOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>抽選対象ゲームの設定</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-sm text-muted-foreground">
              {eligiblePool.length} / {games.length} 件を抽選対象に設定
            </div>
            <div className="flex items-center gap-2">
              <fieldset className="text-sm flex items-center gap-3">
                <legend className="sr-only">重量フィルタ</legend>
                <span>重量</span>
                {(["軽量", "中量", "重量"] as const).map((w) => (
                  <label key={w} className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={weightFilters.has(w)}
                      onChange={(e) => {
                        setWeightFilters((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(w);
                          else next.delete(w);
                          return next;
                        });
                      }}
                    />
                    <span>{w}</span>
                  </label>
                ))}
                <button
                  type="button"
                  className="underline text-muted-foreground"
                  onClick={() => setWeightFilters(new Set())}
                >
                  解除
                </button>
              </fieldset>
              <input
                className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="タイトル/ジャンルで検索"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
              />
              <label className="text-sm flex items-center gap-2">
                <span>並び替え</span>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={weightSort}
                  onChange={(e) =>
                    setWeightSort(e.target.value as "none" | "asc" | "desc")
                  }
                >
                  <option value="none">指定なし</option>
                  <option value="asc">軽→重</option>
                  <option value="desc">重→軽</option>
                </select>
              </label>
            </div>
          </div>
          <div className="max-h-72 overflow-auto space-y-2">
            {games.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                登録ゲームがありません
              </p>
            ) : (
              gamesSortedForDialog.map((g) => {
                const checked = eligibleGameIds.has(g.id);
                return (
                  <label key={g.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={checked}
                      onChange={(e) => toggleEligible(g.id, e.target.checked)}
                    />
                    <span className="text-sm">{g.name}</span>
                  </label>
                );
              })
            )}
          </div>
          <DialogFooter>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={selectAllEligible}>
                全選択
              </Button>
              <Button variant="outline" onClick={clearAllEligible}>
                全解除
              </Button>
              <Button onClick={() => setGameFilterOpen(false)}>閉じる</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
