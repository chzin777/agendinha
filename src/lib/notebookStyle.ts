import type { NotebookColor } from "@/types";

/** Cover colors for notebooks — built from the app palette (sage, gold, marsala) plus 3 muted companions. */
export const COVER_STYLES: Record<NotebookColor, { label: string; base: string; dark: string; ink: string }> = {
  primary: { label: "Sálvia", base: "#6d855a", dark: "#55693f", ink: "#ffffff" },
  gold: { label: "Dourado", base: "#c9a84c", dark: "#a8862f", ink: "#3b2a05" },
  marsala: { label: "Marsala", base: "#8b3a3a", dark: "#6e2a2a", ink: "#fafaf5" },
  slate: { label: "Musgo", base: "#4a5f4a", dark: "#354635", ink: "#f2f6f2" },
  teal: { label: "Petróleo", base: "#3f7a74", dark: "#2c5c57", ink: "#f2fbfa" },
  plum: { label: "Ameixa", base: "#6b4a6e", dark: "#4f3452", ink: "#fbf6fb" },
};

export function coverBackground(color: NotebookColor): string {
  const c = COVER_STYLES[color] ?? COVER_STYLES.primary;
  return `linear-gradient(145deg, ${c.base} 0%, ${c.dark} 100%)`;
}

/** Text colors offered by the editor toolbar */
export const TEXT_COLORS: { label: string; value: string }[] = [
  { label: "Padrão", value: "#1a2e1a" },
  { label: "Sálvia", value: "#6d855a" },
  { label: "Dourado", value: "#a8862f" },
  { label: "Marsala", value: "#8b3a3a" },
  { label: "Azul", value: "#2f5d8a" },
  { label: "Roxo", value: "#6b4a6e" },
  { label: "Laranja", value: "#c2621f" },
  { label: "Cinza", value: "#6b7280" },
];

/** Font-size steps (px) used by the A- / A+ buttons */
export const FONT_STEPS = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];
export const DEFAULT_FONT_SIZE = 16;
