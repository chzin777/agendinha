"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CloudOff, FilePlus2, FileText, Loader2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Modal } from "@/components/Modal";
import { GoldenButton } from "@/components/GoldenButton";
import { RichEditor } from "@/components/RichEditor";
import { htmlToText } from "@/lib/sanitizeHtml";
import { COVER_STYLES, coverBackground } from "@/lib/notebookStyle";
import type { Notebook, NotebookPage } from "@/types";

type SaveState = "idle" | "saving" | "saved" | "error";

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

function pageParam(): string | null {
  return new URLSearchParams(window.location.search).get("p");
}

function formatUpdated(iso: string): string {
  // Postgres text form: "2026-11-18 17:41:39.24+00" -> ISO 8601
  const d = new Date(iso.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function NotebookView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [pages, setPages] = useState<NotebookPage[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound" | "error">("loading");
  const [openId, setOpenId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [toDelete, setToDelete] = useState<NotebookPage | null>(null);
  const [creating, setCreating] = useState(false);

  const pending = useRef<{ id: string; title?: string; content?: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushedHistory = useRef(false);

  // Load notebook + pages
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch(`/api/notebooks/${id}`), fetch(`/api/notebooks/${id}/pages`)])
      .then(async ([nbRes, pagesRes]) => {
        if (cancelled) return;
        if (nbRes.status === 404) {
          setStatus("notfound");
          return;
        }
        if (!nbRes.ok || !pagesRes.ok) throw new Error("load failed");
        const nb: Notebook = await nbRes.json();
        const pgs: NotebookPage[] = await pagesRes.json();
        if (cancelled) return;
        setNotebook(nb);
        setPages(pgs);
        setStatus("ready");
        const fromUrl = pageParam();
        if (fromUrl && pgs.some((p) => p.id === fromUrl)) setOpenId(fromUrl);
        else if (isDesktop() && pgs.length > 0) setOpenId(pgs[0].id);
      })
      .catch((e) => {
        console.error("[NotebookView] load failed:", e);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Browser back button closes the open page on mobile
  useEffect(() => {
    const onPop = () => {
      const p = pageParam();
      if (!p) pushedHistory.current = false;
      if (!isDesktop()) setOpenId(p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const flush = useCallback(async (keepalive = false) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const job = pending.current;
    if (!job) return;
    pending.current = null;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/pages/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, content: job.content }),
        // keepalive survives tab close but browsers cap its body at 64 KB
        keepalive: keepalive && (job.content?.length ?? 0) < 60_000,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved: NotebookPage = await res.json();
      setPages((prev) => prev.map((p) => (p.id === saved.id ? { ...p, updatedAt: saved.updatedAt } : p)));
      setSaveState(pending.current ? "saving" : "saved");
    } catch (e) {
      console.error("[NotebookView] save failed:", e);
      // Put the job back so the next edit (or page switch) retries it
      pending.current = { ...job, ...(pending.current ?? {}) };
      setSaveState("error");
    }
  }, []);

  // Save on tab close / navigation away
  useEffect(() => {
    const onHide = () => {
      void flush(true);
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      void flush();
    };
  }, [flush]);

  const queueSave = (pageId: string, patch: { title?: string; content?: string }) => {
    if (pending.current && pending.current.id !== pageId) void flush();
    pending.current = { ...(pending.current ?? { id: pageId }), ...patch, id: pageId };
    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, ...patch } : p)));
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 700);
  };

  const openPage = (pageId: string) => {
    void flush();
    setSaveState("idle");
    setOpenId(pageId);
    const url = `${window.location.pathname}?p=${pageId}`;
    if (isDesktop() || openId) {
      window.history.replaceState(null, "", url);
    } else {
      window.history.pushState(null, "", url);
      pushedHistory.current = true;
    }
  };

  const closePage = () => {
    void flush();
    if (pushedHistory.current && !isDesktop()) {
      pushedHistory.current = false;
      window.history.back(); // popstate closes the editor
    } else {
      window.history.replaceState(null, "", window.location.pathname);
      setOpenId(null);
    }
  };

  const createPage = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/notebooks/${id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page: NotebookPage = await res.json();
      setPages((prev) => [...prev, page]);
      setNotebook((nb) => (nb ? { ...nb, pageCount: nb.pageCount + 1 } : nb));
      openPage(page.id);
    } catch (e) {
      console.error("[NotebookView] create page failed:", e);
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    const page = toDelete;
    setToDelete(null);
    if (!page) return;
    if (pending.current?.id === page.id) pending.current = null;
    try {
      const res = await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const remaining = pages.filter((p) => p.id !== page.id);
      setPages(remaining);
      setNotebook((nb) => (nb ? { ...nb, pageCount: Math.max(0, nb.pageCount - 1) } : nb));
      if (openId === page.id) {
        if (isDesktop() && remaining.length > 0) openPage(remaining[0].id);
        else closePage();
      }
    } catch (e) {
      console.error("[NotebookView] delete page failed:", e);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status !== "ready" || !notebook) {
    return (
      <AppShell active="cadernos" back={{ href: "/cadernos", title: "Caderno" }}>
        <div className="mx-auto mt-10 max-w-sm text-center">
          <p className="text-sm text-muted-foreground">
            {status === "notfound" ? "Este caderno não existe mais." : "Não foi possível carregar o caderno."}
          </p>
          <Link href="/cadernos" className="mt-4 inline-block text-sm font-semibold text-primary">
            Voltar aos cadernos
          </Link>
        </div>
      </AppShell>
    );
  }

  const openPageObj = pages.find((p) => p.id === openId) ?? null;
  const openIndex = openPageObj ? pages.indexOf(openPageObj) : -1;
  const cover = COVER_STYLES[notebook.color];

  const saveBadge =
    openPageObj &&
    (saveState === "saving" ? (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 size={13} className="animate-spin" /> Salvando
      </span>
    ) : saveState === "saved" ? (
      <span className="inline-flex items-center gap-1 text-xs text-primary">
        <Check size={13} /> Salvo
      </span>
    ) : saveState === "error" ? (
      <span className="inline-flex items-center gap-1 text-xs text-accent-marsala">
        <CloudOff size={13} /> Erro ao salvar
      </span>
    ) : null);

  const pageList = (
    <div className="space-y-2">
      {pages.map((p, i) => {
        const active = p.id === openId;
        const preview = htmlToText(p.content).slice(0, 90);
        return (
          <div
            key={p.id}
            className={`group flex items-stretch rounded-xl border transition-colors ${
              active ? "border-primary/50 bg-primary/[0.07]" : "border-border bg-card hover:border-accent-gold/50"
            }`}
          >
            <button type="button" onClick={() => openPage(p.id)} className="flex min-w-0 flex-1 items-start gap-3 p-3 text-left">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{p.title.trim() || `Página ${i + 1}`}</span>
                <span className="block truncate text-xs text-muted-foreground">{preview || "Página em branco"}</span>
              </span>
              <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">{formatUpdated(p.updatedAt)}</span>
            </button>
            <button
              type="button"
              onClick={() => setToDelete(p)}
              aria-label={`Excluir ${p.title.trim() || `Página ${i + 1}`}`}
              className="flex w-10 shrink-0 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:bg-accent-marsala/10 hover:text-accent-marsala lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );

  const editor = openPageObj && (
    <div key={openPageObj.id} className="anim-fade">
      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={openPageObj.title}
          onChange={(e) => queueSave(openPageObj.id, { title: e.target.value })}
          placeholder={`Página ${openIndex + 1}`}
          maxLength={200}
          aria-label="Título da página"
          className="min-w-0 flex-1 bg-transparent text-2xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <span className="hidden lg:block">{saveBadge}</span>
      </div>
      <RichEditor
        initialHtml={openPageObj.content}
        onChange={(html) => queueSave(openPageObj.id, { content: html })}
      />
    </div>
  );

  const showEditorOnly = !!openPageObj; // mobile: full-screen editor when a page is open

  return (
    <AppShell
      active="cadernos"
      hideBottomNav={showEditorOnly}
      fab={{ label: "Nova página", onClick: createPage }}
      back={
        showEditorOnly
          ? {
              onClick: () => (isDesktop() ? router.push("/cadernos") : closePage()),
              title: (
                <>
                  <span className="lg:hidden">{openPageObj.title.trim() || `Página ${openIndex + 1}`}</span>
                  <span className="hidden lg:inline">{notebook.name}</span>
                </>
              ),
              subtitle: (
                <>
                  <span className="lg:hidden">{notebook.name}</span>
                  <span className="hidden lg:inline">{`${pages.length} ${pages.length === 1 ? "página" : "páginas"}`}</span>
                </>
              ),
            }
          : { href: "/cadernos", title: notebook.name, subtitle: `${pages.length} ${pages.length === 1 ? "página" : "páginas"}` }
      }
      actions={
        showEditorOnly && (
          <div className="flex items-center gap-1 lg:hidden">
            {saveBadge}
            <button
              type="button"
              onClick={() => setToDelete(openPageObj)}
              aria-label="Excluir página"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent-marsala/10 hover:text-accent-marsala"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )
      }
    >
      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Sidebar / mobile list */}
        <aside className={`${showEditorOnly ? "hidden" : "block"} lg:sticky lg:top-24 lg:block`}>
          <div
            className="mb-4 overflow-hidden rounded-2xl p-4 shadow-sm"
            style={{ background: coverBackground(notebook.color), color: cover.ink }}
          >
            <p className="text-lg font-bold leading-tight">{notebook.name}</p>
            {notebook.description && <p className="mt-1 text-sm opacity-90">{notebook.description}</p>}
            <p className="mt-3 text-xs font-semibold opacity-80">
              {pages.length} {pages.length === 1 ? "página" : "páginas"}
            </p>
          </div>

          {pages.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
              <FileText size={28} className="mb-3 text-accent-gold" />
              <p className="text-sm text-muted-foreground">Este caderno ainda não tem páginas.</p>
              <GoldenButton onClick={createPage} disabled={creating} className="mt-4 !rounded-xl">
                <FilePlus2 size={16} />
                Primeira página
              </GoldenButton>
            </div>
          ) : (
            <>
              {pageList}
              <button
                type="button"
                onClick={createPage}
                disabled={creating}
                className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 lg:flex"
              >
                <FilePlus2 size={16} />
                Nova página
              </button>
            </>
          )}
        </aside>

        {/* Editor */}
        <section className={`${showEditorOnly ? "block" : "hidden"} min-w-0 lg:block`}>
          {editor ?? (
            <div className="hidden h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 text-center lg:flex">
              <FileText size={32} className="mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Selecione uma página ou crie uma nova.</p>
            </div>
          )}
        </section>
      </div>

      <Modal open={toDelete !== null} onClose={() => setToDelete(null)} title="Excluir página">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Excluir <strong className="text-foreground">{toDelete?.title.trim() || "esta página"}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setToDelete(null)}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <GoldenButton onClick={confirmDelete} className="flex-1 !rounded-xl !py-3">
              Excluir
            </GoldenButton>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
