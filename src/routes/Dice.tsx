import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Dice3D from "@/components/Dice3D";

export default function Dice() {
  const [numDice, setNumDice] = useState(2);
  const [values, setValues] = useState<number[] | null>(null);
  const [spinX, setSpinX] = useState<number[]>([]);
  const [spinY, setSpinY] = useState<number[]>([]);

  const canRoll = useMemo(() => numDice > 0, [numDice]);
  const total = useMemo(
    () => (values ? values.reduce((a, b) => a + b, 0) : 0),
    [values]
  );

  // ダイス数変更時に表示を即時反映（結果が存在している場合も配列長を合わせる）
  useEffect(() => {
    setValues((prev) => {
      if (!prev) return prev;
      if (prev.length === numDice) return prev;
      if (prev.length < numDice) {
        return [
          ...prev,
          ...Array.from({ length: numDice - prev.length }, () => 1),
        ];
      }
      return prev.slice(0, numDice);
    });
    setSpinX((prev) => {
      if (prev.length === numDice) return prev;
      if (prev.length < numDice) {
        return [
          ...prev,
          ...Array.from({ length: numDice - prev.length }, () => 0),
        ];
      }
      return prev.slice(0, numDice);
    });
    setSpinY((prev) => {
      if (prev.length === numDice) return prev;
      if (prev.length < numDice) {
        return [
          ...prev,
          ...Array.from({ length: numDice - prev.length }, () => 0),
        ];
      }
      return prev.slice(0, numDice);
    });
  }, [numDice]);

  const roll = () => {
    if (!canRoll) return;
    const nextValues = Array.from(
      { length: numDice },
      () => 1 + Math.floor(Math.random() * 6)
    );
    const pad = (arr: number[], len: number) =>
      Array.from({ length: len }, (_, i) => arr[i] ?? 0);
    const prevX = pad(spinX, numDice);
    const prevY = pad(spinY, numDice);
    const inc = () => 2 + Math.floor(Math.random() * 4); // 2..5 回転
    const nextX = prevX.map((v) => v + inc());
    const nextY = prevY.map((v) => v + inc());
    setSpinX(nextX);
    setSpinY(nextY);
    setValues(nextValues);
  };

  const reset = () => {
    setValues(null);
    setSpinX([]);
    setSpinY([]);
  };

  return (
    <main className="pt-16 pb-8 container mx-auto px-4">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">サイコロ (3D)</h1>
        <p className="text-muted-foreground text-sm">
          d6 固定・複数個を3Dで表示
        </p>
      </header>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            サイコロの個数
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={numDice}
            onChange={(e) =>
              setNumDice(Math.max(1, Math.min(30, Number(e.target.value) || 0)))
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={roll} disabled={!canRoll}>
            振る
          </Button>
          <Button variant="secondary" onClick={reset} disabled={!values}>
            リセット
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {canRoll ? `${numDice}d6` : "入力が正しくありません"}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-lg border p-4 bg-accent/20">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 place-items-center">
            {(values ?? Array.from({ length: numDice }, () => 1)).map(
              (v, i) => (
                <Dice3D
                  key={i}
                  value={v as 1 | 2 | 3 | 4 | 5 | 6}
                  size={56}
                  spinX={spinX[i] ?? 0}
                  spinY={spinY[i] ?? 0}
                  durationMs={900}
                />
              )
            )}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          {!values ? (
            <div className="text-muted-foreground text-sm">
              「振る」を押して結果を表示
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-3">
              <div className="text-2xl font-bold">合計: {total}</div>
              <div className="text-sm">({values.join(", ")})</div>
              <div className="text-xs text-muted-foreground">
                {values.length} 個 / d6
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
