"use client";

import Link from "next/link";
import { ChevronRight, FileText, Pencil, Trash2 } from "lucide-react";
import { COVER_STYLES, coverBackground } from "@/lib/notebookStyle";
import type { Notebook } from "@/types";

interface Props {
  notebook: Notebook;
  onEdit: (nb: Notebook) => void;
  onDelete: (nb: Notebook) => void;
}

function pagesLabel(n: number) {
  return n === 1 ? "1 página" : `${n} páginas`;
}

const ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-full transition-colors";

/** Grid view: looks like a physical notebook cover */
export function NotebookCoverCard({ notebook, onEdit, onDelete }: Props) {
  const style = COVER_STYLES[notebook.color];
  return (
    <div className="group relative">
      <Link
        href={`/cadernos/${notebook.id}`}
        className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-l-md rounded-r-2xl shadow-[0_8px_20px_-8px_rgba(26,46,26,0.45)] transition-transform duration-200 active:scale-[0.98] lg:hover:-translate-y-1"
        style={{ background: coverBackground(notebook.color), color: style.ink }}
      >
        {/* spine + elastic band */}
        <span className="absolute inset-y-0 left-0 w-3 bg-black/15" aria-hidden />
        <span className="absolute inset-y-0 left-3 w-px bg-white/20" aria-hidden />
        <span className="absolute inset-y-0 right-5 w-1.5 bg-black/20" aria-hidden />
        {/* label */}
        <div className="relative mx-5 mt-6 rounded-md bg-card/95 px-2.5 py-2 text-foreground shadow-sm sm:mx-6">
          <p className="line-clamp-2 break-words text-sm font-bold leading-snug">{notebook.name}</p>
        </div>
        {notebook.description && (
          <p className="relative mx-5 mt-2 line-clamp-3 break-words text-xs leading-snug opacity-85 sm:mx-6">{notebook.description}</p>
        )}
        <div className="relative mt-auto flex h-11 items-center gap-1.5 px-5 pb-1 text-[11px] font-semibold opacity-90 sm:px-6">
          <FileText size={13} />
          {pagesLabel(notebook.pageCount)}
        </div>
      </Link>

      <div className="absolute bottom-1.5 right-8 flex gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(notebook)}
          aria-label={`Editar ${notebook.name}`}
          className={`${ICON_BTN} h-8 w-8 bg-black/15 text-white backdrop-blur-sm hover:bg-black/30`}
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(notebook)}
          aria-label={`Excluir ${notebook.name}`}
          className={`${ICON_BTN} h-8 w-8 bg-black/15 text-white backdrop-blur-sm hover:bg-accent-marsala`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/** List view: compact row */
export function NotebookRowItem({ notebook, onEdit, onDelete }: Props) {
  const style = COVER_STYLES[notebook.color];
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 pr-1.5 shadow-sm transition-colors hover:border-accent-gold/50">
      <Link href={`/cadernos/${notebook.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="relative flex h-14 w-11 shrink-0 items-end justify-center overflow-hidden rounded-l-sm rounded-r-lg pb-1 shadow-sm"
          style={{ background: coverBackground(notebook.color), color: style.ink }}
          aria-hidden
        >
          <span className="absolute inset-y-0 left-0 w-1.5 bg-black/15" />
          <span className="text-[10px] font-bold">{notebook.pageCount}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-foreground">{notebook.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {notebook.description || pagesLabel(notebook.pageCount)}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => onEdit(notebook)}
        aria-label={`Editar ${notebook.name}`}
        className={`${ICON_BTN} h-10 w-10 text-muted-foreground hover:bg-muted hover:text-foreground`}
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(notebook)}
        aria-label={`Excluir ${notebook.name}`}
        className={`${ICON_BTN} h-10 w-10 text-muted-foreground hover:bg-accent-marsala/10 hover:text-accent-marsala`}
      >
        <Trash2 size={16} />
      </button>
      <ChevronRight size={18} className="hidden shrink-0 text-muted-foreground sm:block" />
    </div>
  );
}
