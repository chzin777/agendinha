"use client";

import { useState } from "react";
import type { EventType } from "@/types";
import { BookOpen, PenTool, Ruler, Presentation, GraduationCap, Tag } from "lucide-react";
import { GoldenButton } from "@/components/GoldenButton";

interface EventFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    type: EventType;
  }) => void;
  onCancel: () => void;
}

const EVENT_TYPES: { value: EventType; label: string; icon: typeof BookOpen }[] = [
  { value: "project", label: "Projeto", icon: PenTool },
  { value: "studio", label: "Ateliê", icon: Ruler },
  { value: "critique", label: "Banca", icon: Presentation },
  { value: "exam", label: "Prova", icon: BookOpen },
  { value: "lecture", label: "Aula", icon: GraduationCap },
  { value: "other", label: "Outro", icon: Tag },
];

export function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<EventType>("exam");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      type,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ex: Entrega Projeto Urbanismo"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Tipo
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EVENT_TYPES.map((t) => {
            const Icon = t.icon;
            const selected = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-accent-gold hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Hora (opcional)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Descrição (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Detalhes adicionais..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
        <GoldenButton
          type="submit"
          disabled={!title.trim() || !date}
          className="flex-1"
        >
          Salvar evento
        </GoldenButton>
      </div>
    </form>
  );
}