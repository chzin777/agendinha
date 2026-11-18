import { BookOpen, PenTool, Ruler, Presentation, GraduationCap, Tag } from "lucide-react";
import type { EventType } from "@/types";

export interface TypeConfig {
  label: string;
  icon: typeof BookOpen;
  /** Chip/badge: text + background + border */
  color: string;
  /** Solid fill used for dots and the left accent bar */
  dot: string;
}

export const TYPE_CONFIG: Record<EventType, TypeConfig> = {
  project: { label: "Projeto", icon: PenTool, color: "text-[#8b6914] bg-accent-gold/15 border-accent-gold/40", dot: "bg-accent-gold" },
  studio: { label: "Ateliê", icon: Ruler, color: "text-primary bg-primary/10 border-primary/30", dot: "bg-primary" },
  critique: { label: "Banca", icon: Presentation, color: "text-accent-marsala bg-accent-marsala/10 border-accent-marsala/30", dot: "bg-accent-marsala" },
  exam: { label: "Prova", icon: BookOpen, color: "text-accent-marsala bg-accent-marsala/10 border-accent-marsala/30", dot: "bg-accent-marsala" },
  lecture: { label: "Aula", icon: GraduationCap, color: "text-muted-foreground bg-muted border-border", dot: "bg-muted-foreground" },
  other: { label: "Outro", icon: Tag, color: "text-muted-foreground bg-muted border-border", dot: "bg-muted-foreground/60" },
};

export const EVENT_TYPE_ORDER: EventType[] = ["project", "studio", "critique", "exam", "lecture", "other"];

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];
export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_LONG = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** Local YYYY-MM-DD (avoids the UTC shift of toISOString in the evening in Brazil). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "Quarta, 18 de novembro" */
export function formatLongDate(key: string): string {
  const date = parseDateKey(key);
  return `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()].toLowerCase()}`;
}

/** "Hoje", "Amanhã" or null */
export function relativeDayLabel(key: string, todayKey: string): string | null {
  if (key === todayKey) return "Hoje";
  const tomorrow = parseDateKey(todayKey);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (key === toDateKey(tomorrow)) return "Amanhã";
  return null;
}
