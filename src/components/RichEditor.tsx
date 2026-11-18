"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, AArrowDown, AArrowUp, Palette, Check, Eraser } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { DEFAULT_FONT_SIZE, FONT_STEPS, TEXT_COLORS } from "@/lib/notebookStyle";

interface RichEditorProps {
  /** Initial HTML. The editor is uncontrolled: remount it (key) to load another page. */
  initialHtml: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  size: number;
  color: string;
}

const EMPTY_STATE: FormatState = { bold: false, italic: false, underline: false, size: DEFAULT_FONT_SIZE, color: "" };

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return rgb.toLowerCase();
  return `#${m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

export function RichEditor({ initialHtml, onChange, placeholder = "Comece a escrever..." }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [fmt, setFmt] = useState<FormatState>(EMPTY_STATE);
  const [isEmpty, setIsEmpty] = useState(true);
  const [colorOpen, setColorOpen] = useState(false);

  const checkEmpty = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    setIsEmpty((el.textContent ?? "").replace(/​/g, "").trim() === "" && !el.querySelector("li"));
  }, []);

  // Load initial content once
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = sanitizeHtml(initialHtml);
    checkEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    checkEmpty();
    onChange(el.innerHTML);
  }, [onChange, checkEmpty]);

  const selectionInEditor = (): Range | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    return editorRef.current?.contains(range.commonAncestorContainer) ? range : null;
  };

  const refreshFormat = useCallback(() => {
    const range = selectionInEditor();
    if (!range) return;
    savedRange.current = range.cloneRange();
    let node: Node | null = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    const el = node instanceof HTMLElement ? node : editorRef.current!;
    const cs = window.getComputedStyle(el);
    setFmt({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      size: Math.round(parseFloat(cs.fontSize)) || DEFAULT_FONT_SIZE,
      color: rgbToHex(cs.color),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshFormat);
    return () => document.removeEventListener("selectionchange", refreshFormat);
  }, [refreshFormat]);

  /** Put focus + the last known selection back into the editor before running a command */
  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement !== el) el.focus({ preventScroll: true });
    const sel = window.getSelection();
    if (savedRange.current && sel && !selectionInEditor()) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
    emitChange();
    refreshFormat();
  };

  const applyFontSize = (px: number) => {
    restoreSelection();
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      // No selection: open a sized span at the caret so the next typed text uses it
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      span.textContent = "​";
      range.insertNode(span);
      const caret = document.createRange();
      caret.setStart(span.firstChild!, 1);
      caret.collapse(true);
      sel.removeAllRanges();
      sel.addRange(caret);
    } else {
      // Mark the selection with <font size=7>, then swap the markers for px-sized spans
      document.execCommand("styleWithCSS", false, "false");
      document.execCommand("fontSize", false, "7");
      document.execCommand("styleWithCSS", false, "true");
      const markers = Array.from(el.querySelectorAll('font[size="7"]'));
      let first: Node | null = null;
      let last: Node | null = null;
      for (const font of markers) {
        const span = document.createElement("span");
        span.style.fontSize = `${px}px`;
        const color = font.getAttribute("color");
        if (color) span.style.color = color;
        while (font.firstChild) span.appendChild(font.firstChild);
        span.querySelectorAll<HTMLElement>("[style]").forEach((child) => child.style.removeProperty("font-size"));
        font.replaceWith(span);
        first ??= span;
        last = span;
      }
      if (first && last) {
        const r = document.createRange();
        r.setStartBefore(first);
        r.setEndAfter(last);
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }
    emitChange();
    refreshFormat();
  };

  const stepSize = (dir: 1 | -1) => {
    const current = fmt.size;
    const next =
      dir > 0
        ? FONT_STEPS.find((s) => s > current) ?? FONT_STEPS[FONT_STEPS.length - 1]
        : [...FONT_STEPS].reverse().find((s) => s < current) ?? FONT_STEPS[0];
    applyFontSize(next);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    if (html) {
      document.execCommand("insertHTML", false, sanitizeHtml(html));
    } else {
      document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    }
    emitChange();
  };

  const keepFocus = (e: React.MouseEvent | React.PointerEvent) => e.preventDefault();

  const toolBtn = (active: boolean) =>
    `flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg px-2 transition-colors ${
      active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted active:bg-muted"
    }`;

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-3 border-y border-border bg-card/95 px-2 py-1.5 backdrop-blur-md sm:top-[calc(4rem+env(safe-area-inset-top))] sm:mx-0 sm:rounded-xl sm:border sm:shadow-sm">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto" role="toolbar" aria-label="Formatação">
          <button type="button" onMouseDown={keepFocus} onClick={() => exec("bold")} aria-label="Negrito" aria-pressed={fmt.bold} className={toolBtn(fmt.bold)}>
            <Bold size={18} />
          </button>
          <button type="button" onMouseDown={keepFocus} onClick={() => exec("italic")} aria-label="Itálico" aria-pressed={fmt.italic} className={toolBtn(fmt.italic)}>
            <Italic size={18} />
          </button>
          <button type="button" onMouseDown={keepFocus} onClick={() => exec("underline")} aria-label="Sublinhado" aria-pressed={fmt.underline} className={toolBtn(fmt.underline)}>
            <Underline size={18} />
          </button>

          <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />

          <button type="button" onMouseDown={keepFocus} onClick={() => stepSize(-1)} aria-label="Diminuir fonte" className={toolBtn(false)}>
            <AArrowDown size={19} />
          </button>
          <span className="w-9 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground" aria-live="polite" title="Tamanho da fonte">
            {fmt.size}
          </span>
          <button type="button" onMouseDown={keepFocus} onClick={() => stepSize(1)} aria-label="Aumentar fonte" className={toolBtn(false)}>
            <AArrowUp size={19} />
          </button>

          <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />

          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={() => setColorOpen((o) => !o)}
            aria-label="Cor do texto"
            aria-expanded={colorOpen}
            className={toolBtn(colorOpen)}
          >
            <span className="relative flex flex-col items-center">
              <Palette size={18} />
              <span className="mt-0.5 h-1 w-5 rounded-full" style={{ background: fmt.color || TEXT_COLORS[0].value }} />
            </span>
          </button>

          <button type="button" onMouseDown={keepFocus} onClick={() => exec("removeFormat")} aria-label="Limpar formatação" className={toolBtn(false)}>
            <Eraser size={18} />
          </button>
        </div>

        {colorOpen && (
          <div className="anim-rise flex flex-wrap gap-2 px-1 pb-1 pt-2" role="listbox" aria-label="Cores">
            {TEXT_COLORS.map((c) => {
              const selected = fmt.color === c.value.toLowerCase();
              return (
                <button
                  key={c.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={c.label}
                  title={c.label}
                  onMouseDown={keepFocus}
                  onClick={() => {
                    exec("foreColor", c.value);
                    setColorOpen(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card shadow-sm ring-1 ring-border transition-transform active:scale-90"
                  style={{ background: c.value }}
                >
                  {selected && <Check size={16} className="text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Writing area */}
      <div className="relative mt-3">
        {isEmpty && (
          <p className="pointer-events-none absolute left-5 top-4 select-none text-base text-muted-foreground/70 sm:left-7 sm:top-6">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Conteúdo da página"
          onInput={emitChange}
          onPaste={handlePaste}
          onFocus={() => setColorOpen(false)}
          className="min-h-[55dvh] break-words rounded-2xl border border-border bg-card px-5 py-4 text-base leading-relaxed text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/30 sm:px-7 sm:py-6 [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
        />
      </div>
    </div>
  );
}
