import type { Notebook, NotebookColor, NotebookPage } from "@/types";

export const NOTEBOOK_COLORS: NotebookColor[] = ["primary", "gold", "marsala", "slate", "teal", "plum"];

export interface NotebookRow {
  id: string;
  name: string;
  description: string | null;
  color: string;
  page_count: number | string;
  created_at: string;
  updated_at: string;
}

export interface PageRow {
  id: string;
  notebook_id: string;
  title: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export function rowToNotebook(row: NotebookRow): Notebook {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    color: (NOTEBOOK_COLORS as string[]).includes(row.color) ? (row.color as NotebookColor) : "primary",
    pageCount: Number(row.page_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToPage(row: PageRow): NotebookPage {
  return {
    id: row.id,
    notebookId: row.notebook_id,
    title: row.title,
    content: row.content,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Hard cap on stored page HTML (~1 MB) */
export const MAX_CONTENT_LENGTH = 1_000_000;
