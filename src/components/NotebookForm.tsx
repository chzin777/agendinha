"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { GoldenButton } from "@/components/GoldenButton";
import { COVER_STYLES, coverBackground } from "@/lib/notebookStyle";
import { NOTEBOOK_COLORS } from "@/lib/notebookRows";
import type { NotebookColor } from "@/types";

export interface NotebookFormData {
  name: string;
  description?: string;
  color: NotebookColor;
}

interface NotebookFormProps {
  initial?: Partial<NotebookFormData>;
  submitLabel: string;
  onSubmit: (data: NotebookFormData) => void | Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASS =
  "w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

export function NotebookForm({ initial, submitLabel, onSubmit, onCancel }: NotebookFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState<NotebookColor>(initial?.color ?? "primary");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, color });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Live cover preview */}
      <div className="flex justify-center">
        <div
          className="relative flex h-28 w-24 flex-col justify-end overflow-hidden rounded-r-xl rounded-l-md p-2.5 shadow-md transition-all"
          style={{ background: coverBackground(color), color: COVER_STYLES[color].ink }}
          aria-hidden
        >
          <span className="absolute inset-y-0 left-2 w-px bg-black/15" />
          <span className="line-clamp-3 break-words pl-2 text-xs font-bold leading-tight">{name.trim() || "Meu caderno"}</span>
        </div>
      </div>

      <div>
        <label htmlFor="nb-name" className="mb-1 block text-sm font-medium text-muted-foreground">
          Nome
        </label>
        <input
          id="nb-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Teoria da Arquitetura"
          maxLength={120}
          autoFocus
          required
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="nb-desc" className="mb-1 block text-sm font-medium text-muted-foreground">
          Descrição <span className="font-normal">(opcional)</span>
        </label>
        <textarea
          id="nb-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Sobre o que é este caderno?"
          maxLength={500}
          rows={2}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Cor da capa</p>
        <div className="flex flex-wrap gap-3">
          {NOTEBOOK_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={COVER_STYLES[c].label}
              aria-pressed={color === c}
              title={COVER_STYLES[c].label}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-transform active:scale-90 ${
                color === c ? "ring-2 ring-foreground/70 ring-offset-2 ring-offset-card" : ""
              }`}
              style={{ background: coverBackground(c), color: COVER_STYLES[c].ink }}
            >
              {color === c && <Check size={18} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Cancelar
        </button>
        <GoldenButton type="submit" disabled={!name.trim() || saving} className="flex-1 !rounded-xl !py-3">
          {submitLabel}
        </GoldenButton>
      </div>
    </form>
  );
}
