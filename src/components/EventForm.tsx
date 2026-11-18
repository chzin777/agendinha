"use client";

import { useState } from "react";
import type { EventType } from "@/types";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { GoldenButton } from "@/components/GoldenButton";
import { EVENT_TYPE_ORDER, TYPE_CONFIG } from "@/lib/eventTypes";

interface EventFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    type: EventType;
  }) => void;
  onCancel: () => void;
  /** Pre-filled date (YYYY-MM-DD), e.g. the day tapped on the calendar */
  initialDate?: string;
}

const EVENT_TYPES = EVENT_TYPE_ORDER.map((value) => ({
  value,
  label: TYPE_CONFIG[value].label,
  icon: TYPE_CONFIG[value].icon,
}));

const STEPS = ["Tipo", "Detalhes", "Revisão"];

const INPUT_CLASS =
  "w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

export function EventForm({ onSubmit, onCancel, initialDate }: EventFormProps) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(initialDate ?? "");
  const [time, setTime] = useState("");
  const [type, setType] = useState<EventType | null>(null);

  const canNext = () => {
    if (step === 0) return type !== null;
    if (step === 1) return title.trim() !== "" && date !== "";
    return true;
  };

  const handleNext = () => {
    if (canNext() && step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !title.trim() || !date) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      type,
    });
  };

  const selectedTypeLabel = EVENT_TYPES.find((t) => t.value === type)?.label ?? "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stepper indicator */}
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`text-xs font-medium transition-colors ${
                i <= step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-0.5 h-px w-4 sm:mx-1 sm:w-6 transition-colors ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[180px]">
        {step === 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground">
              Qual é o tipo do evento?
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
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-4 text-xs font-medium transition-all active:scale-[0.97] ${
                      selected
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "border-border bg-card text-muted-foreground hover:border-accent-gold hover:text-foreground"
                    }`}
                  >
                    <Icon size={20} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Entrega Projeto Urbanismo"
                autoFocus
                enterKeyHint="next"
                className={INPUT_CLASS}
              />
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
                  className={INPUT_CLASS}
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
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detalhes adicionais..."
                autoFocus
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">Resumo</p>
              <p className="text-foreground font-medium">{title}</p>
              <div className="flex gap-3 text-muted-foreground text-xs">
                <span>{selectedTypeLabel}</span>
                <span>•</span>
                <span>{date.split("-").reverse().join("/")}{time ? ` às ${time}` : ""}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-1">
        {step === 0 ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center gap-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            Voltar
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <GoldenButton
            type="button"
            onClick={handleNext}
            disabled={!canNext()}
            className="flex-1"
          >
            Próximo
            <ChevronRight size={16} className="ml-1" />
          </GoldenButton>
        ) : (
          <GoldenButton
            type="submit"
            disabled={!canNext()}
            className="flex-1"
          >
            Salvar evento
          </GoldenButton>
        )}
      </div>
    </form>
  );
}