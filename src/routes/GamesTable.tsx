import { useEffect, useMemo, useState } from "react";
import { useGames, type Game } from "../hooks/useGames";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type Draft = {
  name: string;
  genre: string;
  weight: Game["weight"];
};

const DEFAULT_DRAFT: Draft = { name: "", genre: "", weight: "軽量" };

export default function GamesManager() {
  const { games, addGame, updateGame, removeGame, clearAll } = useGames();

  // 新規追加フォーム
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);

  // 編集対象のローカル状態: id -> Draft
  const [editing, setEditing] = useState<Record<string, Draft>>({});

  // 簡易フィルタ
  const [query, setQuery] = useState("");
  const [weightFilter, setWeightFilter] = useState<"" | Game["weight"]>("");

  // JSONインポート用
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [replaceAll, setReplaceAll] = useState(false);

  useEffect(() => {
    // ゲーム一覧が変わったら、存在しない id の編集状態は削除
    setEditing((prev) => {
      const setIds = new Set(games.map((g) => g.id));
      const next: Record<string, Draft> = {};
      for (const [id, value] of Object.entries(prev)) {
        if (setIds.has(id)) next[id] = value;
      }
      return next;
    });
  }, [games]);

  const canAdd = useMemo(() => draft.name.trim().length > 0, [draft.name]);

  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      const byWeight = weightFilter ? g.weight === weightFilter : true;
      const byText = q
        ? g.name.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q)
        : true;
      return byWeight && byText;
    });
  }, [games, query, weightFilter]);

  const onAdd = () => {
    if (!canAdd) return;
    addGame(draft.name, draft.genre, draft.weight);
    setDraft(DEFAULT_DRAFT);
  };

  const startEdit = (g: Game) => {
    setEditing((prev) => ({
      ...prev,
      [g.id]: { name: g.name, genre: g.genre, weight: g.weight },
    }));
  };

  const cancelEdit = (id: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const commitEdit = (id: string) => {
    const draftValue = editing[id];
    if (!draftValue) return;
    if (!draftValue.name.trim()) return;
    updateGame(id, draftValue);
    cancelEdit(id);
  };

  const setEditField = (
    id: string,
    field: keyof Draft,
    value: string | Game["weight"]
  ) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value } as Draft,
    }));
  };

  return (
    <main className="pt-16 pb-6 container mx-auto px-4">
      <header className="mb-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            登録ゲームを管理
          </h1>
          <p className="text-muted-foreground text-sm">
            ローカルに保存して簡単管理
          </p>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="font-semibold mb-3">新規追加</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="タイトル"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <input
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="ジャンル"
            value={draft.genre}
            onChange={(e) => setDraft((d) => ({ ...d, genre: e.target.value }))}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={draft.weight}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                weight: e.target.value as Game["weight"],
              }))
            }
          >
            <option value="軽量">軽量</option>
            <option value="中量">中量</option>
            <option value="重量">重量</option>
          </select>
          <Button onClick={onAdd} disabled={!canAdd}>
            追加
          </Button>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
          <h2 className="font-semibold">登録一覧</h2>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="flex items-center gap-2">
              <input
                className="h-10 w-56 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="タイトル/ジャンルで検索"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={weightFilter}
                onChange={(e) =>
                  setWeightFilter((e.target.value || "") as "" | Game["weight"])
                }
              >
                <option value="">すべて</option>
                <option value="軽量">軽量</option>
                <option value="中量">中量</option>
                <option value="重量">重量</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {filteredGames.length} 件
            </div>
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  JSONインポート
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>JSON文字列からインポート</DialogTitle>
                  <DialogDescription>
                    <span className="font-mono">
                      [{"{"}"id","name","genre","weight"{"}"}]
                    </span>{" "}
                    形式の配列を貼り付けてください。idは省略可、weightは「軽量/中量/重量」。
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <textarea
                    className="min-h-40 h-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder='例: [{"name":"カタン","genre":"Euro","weight":"中量"}]'
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setImportError(null);
                    }}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={replaceAll}
                      onChange={(e) => setReplaceAll(e.target.checked)}
                    />
                    既存データを全置換する
                  </label>
                  {importError && (
                    <p className="text-sm text-red-500">{importError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setImportOpen(false);
                      setImportText("");
                      setImportError(null);
                      setReplaceAll(false);
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={() => {
                      try {
                        const data = JSON.parse(importText);
                        if (!Array.isArray(data))
                          throw new Error("配列ではありません");
                        const parsed: Game[] = (data as unknown[])
                          .map((g) => {
                            const item = (g ?? {}) as Record<string, unknown>;
                            const weightRaw = item.weight;
                            const weight: Game["weight"] =
                              typeof weightRaw === "string" &&
                              (weightRaw === "軽量" ||
                                weightRaw === "中量" ||
                                weightRaw === "重量")
                                ? (weightRaw as Game["weight"])
                                : "軽量";
                            return {
                              id: String(
                                (item.id as string | undefined) ??
                                  crypto.randomUUID()
                              ),
                              name: String(
                                (item.name as string | undefined) ?? ""
                              ).trim(),
                              genre: String(
                                (item.genre as string | undefined) ?? ""
                              ).trim(),
                              weight,
                            } as Game;
                          })
                          .filter((g) => g.name);
                        if (parsed.length === 0)
                          throw new Error("有効な項目がありません");

                        if (replaceAll) {
                          // 既存全置換: クリア後、一括追加
                          clearAll();
                          // addGameは重複名を防ぐロジックを持つため安全
                          for (const g of parsed)
                            addGame(g.name, g.genre, g.weight);
                        } else {
                          // 追記/更新: 名前一致は更新、なければ追加
                          const nameToId = new Map(
                            games.map((x) => [x.name, x.id] as const)
                          );
                          for (const g of parsed) {
                            const existingId = nameToId.get(g.name);
                            if (existingId) {
                              updateGame(existingId, {
                                name: g.name,
                                genre: g.genre,
                                weight: g.weight,
                              });
                            } else {
                              addGame(g.name, g.genre, g.weight);
                            }
                          }
                        }

                        setImportOpen(false);
                        setImportText("");
                        setImportError(null);
                        setReplaceAll(false);
                      } catch (e: unknown) {
                        const message =
                          e instanceof Error ? e.message : "不正なJSONです";
                        setImportError(message);
                      }
                    }}
                  >
                    取り込み
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" onClick={() => clearAll()}>
              すべて削除
            </Button>
          </div>
        </div>
        {games.length === 0 ? (
          <p className="text-gray-500 text-sm">まだ登録がありません</p>
        ) : (
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>ジャンル</TableHead>
                <TableHead>重量</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGames.map((g) => {
                const ed = editing[g.id];
                const isEditing = Boolean(ed);
                return (
                  <TableRow key={g.id}>
                    {!isEditing ? (
                      <>
                        <TableCell>
                          <div className="font-medium">{g.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {g.genre || "(ジャンル未設定)"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{g.weight}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(g)}
                            >
                              編集
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeGame(g.id)}
                            >
                              削除
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <input
                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={ed.name}
                            onChange={(e) =>
                              setEditField(g.id, "name", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={ed.genre}
                            onChange={(e) =>
                              setEditField(g.id, "genre", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={ed.weight}
                            onChange={(e) =>
                              setEditField(
                                g.id,
                                "weight",
                                e.target.value as Game["weight"]
                              )
                            }
                          >
                            <option value="軽量">軽量</option>
                            <option value="中量">中量</option>
                            <option value="重量">重量</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={() => commitEdit(g.id)}>
                              保存
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => cancelEdit(g.id)}
                            >
                              キャンセル
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </main>
  );
}
