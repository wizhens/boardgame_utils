import { useEffect, useMemo, useRef, useState } from "react";
import { useGames, type Game } from "@/hooks/useGames";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WeightKey = "軽量" | "中量" | "重量";

export default function Roulette() {
  const { games } = useGames();

  const [checks, setChecks] = useState<Record<WeightKey | "すべて", boolean>>({
    軽量: true,
    中量: true,
    重量: true,
    すべて: true,
  });

  const toggle = (key: WeightKey | "すべて") => {
    setChecks((prev) => {
      if (key === "すべて") {
        const next = !prev["すべて"];
        return { 軽量: next, 中量: next, 重量: next, すべて: next };
      }
      const next = { ...prev, [key]: !prev[key] };
      const all = next.軽量 && next.中量 && next.重量;
      next["すべて"] = all;
      return next;
    });
  };

  const candidates = useMemo(() => {
    const enabled = new Set<WeightKey>([
      ...(checks.軽量 ? ["軽量" as const] : []),
      ...(checks.中量 ? ["中量" as const] : []),
      ...(checks.重量 ? ["重量" as const] : []),
    ]);
    return games.filter((g) => enabled.has(g.weight));
  }, [games, checks]);

  // 個別選択状態（可視候補のみ保持）
  const [selection, setSelection] = useState<Record<string, boolean>>({});

  // 候補が変わったら、既存は維持しつつ新規は選択 true で追加、対象外は削除
  useEffect(() => {
    setSelection((prev) => {
      const next: Record<string, boolean> = {};
      for (const g of candidates) {
        next[g.id] = prev[g.id] ?? true;
      }
      return next;
    });
  }, [candidates]);

  const allSelected = useMemo(
    () => candidates.length > 0 && candidates.every((g) => selection[g.id]),
    [candidates, selection]
  );

  const toggleOne = (id: string) => {
    setSelection((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllVisible = () => {
    const target = !allSelected;
    const next: Record<string, boolean> = {};
    for (const g of candidates) next[g.id] = target;
    setSelection(next);
  };

  const selectedCandidates = useMemo(
    () => candidates.filter((g) => selection[g.id]),
    [candidates, selection]
  );

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Game | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // 抽選中の視覚効果用
  const [rollingIndex, setRollingIndex] = useState<number | null>(null);
  const poolRef = useRef<Game[]>([]);
  const lastSwitchAtRef = useRef<number>(0);

  // Escape キーで閉じる
  useEffect(() => {
    if (!isDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDialogOpen]);

  const spin = () => {
    if (selectedCandidates.length === 0 || spinning) return;
    setSpinning(true);
    setResult(null);
    // スナップショットを使って抽選中に候補が変わっても安定表示
    poolRef.current = [...selectedCandidates];
    setRollingIndex(0);
    lastSwitchAtRef.current = 0;

    // 簡易アニメーション: 1.2秒間インジケータを回してから確定
    const durationMs = 1200;
    const endAt = Date.now() + durationMs;
    let raf = 0;
    const tick = () => {
      if (Date.now() >= endAt) {
        const pool = poolRef.current;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        setResult(picked ?? null);
        if (picked) {
          setSelection((prev) => ({ ...prev, [picked.id]: false }));
        }
        setSpinning(false);
        setRollingIndex(null);
        return;
      }
      const now = performance.now();
      if (now - lastSwitchAtRef.current > 90) {
        setRollingIndex((prev) => {
          const pool = poolRef.current;
          if (pool.length === 0) return null;
          const nextBase = typeof prev === "number" ? prev : 0;
          return (nextBase + 1) % pool.length;
        });
        lastSwitchAtRef.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // 念のためクリーンアップ
    setTimeout(() => cancelAnimationFrame(raf), durationMs + 100);
  };

  return (
    <main className="pt-16 pb-8 container mx-auto px-4">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">ルーレット</h1>
        <p className="text-muted-foreground text-sm">
          チェック済みの重量から抽選
        </p>
      </header>

      <section className="mb-8">
        <div className="flex items-center gap-3">
          <Button
            onClick={spin}
            disabled={spinning || selectedCandidates.length === 0}
          >
            {spinning ? "抽選中..." : "ルーレットを回す"}
          </Button>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            候補を選択
          </Button>
          <div className="text-sm text-muted-foreground">
            候補: {candidates.length} 件 / 選択中: {selectedCandidates.length}{" "}
            件
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>候補一覧</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-3">
            {(["すべて", "軽量", "中量", "重量"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={checks[k]}
                  onChange={() => toggle(k)}
                />
                <span>{k}</span>
              </label>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 select-none text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={allSelected}
                  onChange={toggleAllVisible}
                />
                <span>可視のすべてを{allSelected ? "解除" : "選択"}</span>
              </label>
              <div className="text-xs text-muted-foreground">
                表示: {candidates.length} 件 / 選択: {selectedCandidates.length}{" "}
                件
              </div>
            </div>
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                表示できる候補がありません
              </p>
            ) : (
              <div className="rounded-md border divide-y max-h-[50vh] overflow-auto">
                {candidates.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-2"
                  >
                    <label className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={Boolean(selection[g.id])}
                        onChange={() => toggleOne(g.id)}
                      />
                      <span className="font-medium">{g.name}</span>
                    </label>
                    <div className="text-xs text-muted-foreground">
                      {g.genre || "(ジャンル未設定)"} / {g.weight}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">閉じる</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>決定</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section>
        <div className="rounded-lg border p-6 min-h-28 flex items-center justify-center bg-accent/20 relative overflow-hidden">
          {result ? (
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                選ばれたゲーム
              </div>
              <div className="text-2xl font-bold">{result.name}</div>
              <div className="text-sm mt-1 text-muted-foreground">
                {result.genre || "(ジャンル未設定)"} / {result.weight}
              </div>
            </div>
          ) : spinning &&
            rollingIndex !== null &&
            poolRef.current.length > 0 ? (
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                抽選中...
              </div>
              <div className="text-2xl font-bold">
                {poolRef.current[rollingIndex]?.name}
              </div>
              <div className="text-sm mt-1 text-muted-foreground">
                {(poolRef.current[rollingIndex]?.genre || "(ジャンル未設定)") +
                  " / " +
                  (poolRef.current[rollingIndex]?.weight || "")}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {selectedCandidates.length === 0
                ? "選択中の候補がありません"
                : "ボタンを押して抽選"}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
