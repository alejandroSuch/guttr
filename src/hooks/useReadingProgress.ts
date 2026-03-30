import { useCallback } from "react";
import type { ReadingSession, ReadingDirection, ScalingMode } from "../types/comic";

const DB_NAME = "guttr";
const STORE_NAME = "sessions";
const MAX_SESSIONS = 100;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "fileId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function fileId(name: string, size: number): string {
  return `${name}::${size}`;
}

async function evictOldest(db: IDBDatabase): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const all = store.getAll();
    all.onsuccess = () => {
      const sessions = all.result as ReadingSession[];
      if (sessions.length <= MAX_SESSIONS) {
        resolve();
        return;
      }
      sessions.sort(
        (a, b) =>
          new Date(a.lastRead).getTime() - new Date(b.lastRead).getTime(),
      );
      const toDelete = sessions.slice(0, sessions.length - MAX_SESSIONS);
      for (const s of toDelete) {
        store.delete(s.fileId);
      }
      tx.oncomplete = () => resolve();
    };
  });
}

export function useReadingProgress() {
  const load = useCallback(
    async (
      name: string,
      size: number,
    ): Promise<ReadingSession | null> => {
      try {
        const db = await openDb();
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const request = store.get(fileId(name, size));
          request.onsuccess = () =>
            resolve((request.result as ReadingSession) ?? null);
          request.onerror = () => resolve(null);
        });
      } catch {
        return null;
      }
    },
    [],
  );

  const save = useCallback(
    async (
      name: string,
      size: number,
      currentPage: number,
      readingDirection: ReadingDirection,
      scalingMode?: ScalingMode,
    ): Promise<void> => {
      try {
        const db = await openDb();
        const session: ReadingSession = {
          fileId: fileId(name, size),
          currentPage,
          lastRead: new Date().toISOString(),
          readingDirection,
          scalingMode,
        };
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(session);
        await evictOldest(db);
      } catch {
        // Silent failure — progress is best-effort
      }
    },
    [],
  );

  return { load, save };
}
