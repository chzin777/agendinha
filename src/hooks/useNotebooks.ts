"use client";

import { useCallback, useEffect, useState } from "react";
import type { Notebook } from "@/types";
import type { NotebookFormData } from "@/components/NotebookForm";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/notebooks")
      .then((r) => json<Notebook[]>(r))
      .then(setNotebooks)
      .catch((e) => {
        console.error("[useNotebooks] load failed:", e);
        setError(true);
      })
      .finally(() => setLoaded(true));
  }, []);

  const createNotebook = useCallback(async (data: NotebookFormData) => {
    const nb = await json<Notebook>(
      await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    );
    setNotebooks((prev) => [nb, ...prev]);
    return nb;
  }, []);

  const updateNotebook = useCallback(async (id: string, data: NotebookFormData) => {
    const nb = await json<Notebook>(
      await fetch(`/api/notebooks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    );
    setNotebooks((prev) => prev.map((n) => (n.id === id ? nb : n)));
    return nb;
  }, []);

  const deleteNotebook = useCallback(async (id: string) => {
    await json(await fetch(`/api/notebooks/${id}`, { method: "DELETE" }));
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notebooks, loaded, error, createNotebook, updateNotebook, deleteNotebook };
}
