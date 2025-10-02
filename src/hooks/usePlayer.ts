import { useEffect, useState } from "react";

export type Participant = {
  id: string;
  name: string;
};

const STORAGE_KEY = "startPlayer.participants.v1";

export function usePlayers() {
  const [participants, setParticipants] = useState<Participant[]>([]);

  // 初回ロード
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      let loaded: Participant[] = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === "string") {
          loaded = (data as string[])
            .map((name) => ({ id: `${name}-${crypto.randomUUID()}`, name }))
            .filter((p) => p.name);
        } else if (
          data.length > 0 &&
          typeof data[0] === "object" &&
          data[0] !== null
        ) {
          loaded = (data as any[])
            .map((item) => ({
              id:
                item.id ?? `${String(item.name ?? "")}-${crypto.randomUUID()}`,
              name: String(item.name ?? ""),
            }))
            .filter((p) => p.name);
        }
      }
      if (loaded.length > 0) setParticipants(loaded);
    } catch {}
  }, []);

  // 永続化
  useEffect(() => {
    try {
      if (participants.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [participants]);

  const addParticipant = (nameRaw: string) => {
    const name = nameRaw.trim();
    if (!name) return;
    setParticipants((prev) => {
      if (prev.some((p) => p.name === name)) return prev;
      return [
        ...prev,
        {
          id: `${name}-${crypto.randomUUID()}`,
          name,
        },
      ];
    });
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const clearParticipants = () => {
    setParticipants([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return {
    participants,
    addParticipant,
    removeParticipant,
    clearParticipants,
  } as const;
}
