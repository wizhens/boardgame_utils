import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayers, type Participant } from "@/hooks/usePlayer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FirstPlayerRoulette() {
  const { participants, addParticipant, removeParticipant, clearParticipants } =
    usePlayers();

  const [nameInput, setNameInput] = useState("");

  const [selection, setSelection] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setSelection((prev) => {
      const next: Record<string, boolean> = {};
      for (const p of participants) next[p.id] = prev[p.id] ?? true;
      return next;
    });
  }, [participants]);

  const selected = useMemo(
    () => participants.filter((p) => selection[p.id]),
    [participants, selection]
  );

  const allSelected = useMemo(
    () => participants.length > 0 && participants.every((p) => selection[p.id]),
    [participants, selection]
  );

  const toggleOne = (id: string) =>
    setSelection((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = () => {
    const target = !allSelected;
    const next: Record<string, boolean> = {};
    for (const p of participants) next[p.id] = target;
    setSelection(next);
  };

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Participant | null>(null);
  const poolRef = useRef<Participant[]>([]);
  const [rollingIndex, setRollingIndex] = useState<number | null>(null);
  const lastSwitchAtRef = useRef<number>(0);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const spin = () => {
    if (selected.length === 0 || spinning) return;
    setSpinning(true);
    setResult(null);
    poolRef.current = [...selected];
    setRollingIndex(0);
    lastSwitchAtRef.current = 0;

    const durationMs = 1200;
    const endAt = Date.now() + durationMs;
    let raf = 0;
    const tick = () => {
      if (Date.now() >= endAt) {
        const pool = poolRef.current;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        setResult(picked ?? null);
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
    setTimeout(() => cancelAnimationFrame(raf), durationMs + 100);
  };

  const onAdd = () => {
    const name = nameInput.trim();
    if (!name) return;
    addParticipant(name);
    setNameInput("");
  };

  return (
    <main className="pt-16 pb-8 container mx-auto px-4">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          先手決めルーレット
        </h1>
        <p className="text-muted-foreground text-sm">
          選択した参加者から先手を抽選
        </p>
      </header>

      <section className="mb-6 flex items-center gap-3">
        <Button variant="outline" onClick={() => setDialogOpen(true)}>
          参加者を設定
        </Button>
        <div className="text-sm text-muted-foreground">
          登録: {participants.length} 名 / 選択: {selected.length} 名
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>参加者設定</DialogTitle>
          </DialogHeader>
          <section className="mb-3 flex flex-wrap gap-2 items-center">
            <input
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-64"
              placeholder="参加者名を入力"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd();
              }}
            />
            <Button onClick={onAdd} disabled={!nameInput.trim()}>
              追加
            </Button>
            <Button
              variant="secondary"
              onClick={toggleAll}
              disabled={participants.length === 0}
            >
              可視のすべてを{allSelected ? "解除" : "選択"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearParticipants()}
              disabled={participants.length === 0}
            >
              すべて削除
            </Button>
            <div className="text-sm text-muted-foreground">
              登録: {participants.length} 名 / 選択: {selected.length} 名
            </div>
          </section>
          <section>
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                参加者を追加してください
              </p>
            ) : (
              <div className="rounded-md border divide-y max-h-[50vh] overflow-auto">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2"
                  >
                    <label className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={Boolean(selection[p.id])}
                        onChange={() => toggleOne(p.id)}
                      />
                      <span className="font-medium">{p.name}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeParticipant(p.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
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
        <div className="flex items-center gap-3 mb-3">
          <Button onClick={spin} disabled={spinning || selected.length === 0}>
            {spinning ? "抽選中..." : "先手を決める"}
          </Button>
        </div>
        <div className="rounded-lg border p-6 min-h-28 flex items-center justify-center bg-accent/20 relative overflow-hidden">
          {result ? (
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">先手</div>
              <div className="text-2xl font-bold">{result.name}</div>
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
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {selected.length === 0
                ? "選択中の参加者がありません"
                : "ボタンを押して抽選"}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
