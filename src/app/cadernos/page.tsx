"use client";

import { useEffect, useState } from "react";
import { BookMarked, LayoutGrid, List } from "lucide-react";
import { AppShell, Segmented } from "@/components/AppShell";
import { Modal } from "@/components/Modal";
import { GoldenButton } from "@/components/GoldenButton";
import { NotebookForm, type NotebookFormData } from "@/components/NotebookForm";
import { NotebookCoverCard, NotebookRowItem } from "@/components/NotebookCover";
import { SearchField } from "@/components/SearchField";
import { useNotebooks } from "@/hooks/useNotebooks";
import { matchesSearch, normalizeSearch } from "@/lib/search";
import type { Notebook } from "@/types";

type ViewMode = "grid" | "list";
const VIEW_KEY = "agendinha:notebooks-view";

export default function NotebooksPage() {
  const { notebooks, loaded, error, createNotebook, updateNotebook, deleteNotebook } = useNotebooks();
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Notebook | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [toDelete, setToDelete] = useState<Notebook | null>(null);
  const [actionError, setActionError] = useState("");

  // Remember the preferred view (grid is the default)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "list" || saved === "grid") setView(saved);
    } catch {}
  }, []);

  const changeView = (v: ViewMode) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  const openCreate = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setActionError("");
    setFormOpen(true);
  };

  const openEdit = (nb: Notebook) => {
    setEditing(nb);
    setFormKey((k) => k + 1);
    setActionError("");
    setFormOpen(true);
  };

  const handleSubmit = async (data: NotebookFormData) => {
    try {
      if (editing) await updateNotebook(editing.id, data);
      else await createNotebook(data);
      setFormOpen(false);
    } catch {
      setActionError("Não foi possível salvar. Tente novamente.");
    }
  };

  const q = normalizeSearch(query);
  const filtered = q
    ? notebooks.filter((n) => matchesSearch(q, n.name, n.description))
    : notebooks;

  return (
    <AppShell active="cadernos" fab={{ label: "Novo caderno", onClick: openCreate }}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cadernos</h1>
          <p className="text-sm text-muted-foreground">
            {loaded ? `${notebooks.length} ${notebooks.length === 1 ? "caderno" : "cadernos"}` : "Carregando..."}
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <SearchField label="Buscar cadernos" value={query} onChange={setQuery} className="flex-1 sm:w-64 sm:flex-none" />
          <Segmented
            className="shrink-0"
            value={view}
            onChange={changeView}
            options={[
              { value: "grid", label: "Grade", icon: LayoutGrid, iconOnly: true },
              { value: "list", label: "Lista", icon: List, iconOnly: true },
            ]}
          />
        </div>
      </div>

      {loaded && !error && q && notebooks.length > 0 && (
        <p role="status" className="mb-3 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "caderno encontrado" : "cadernos encontrados"}
        </p>
      )}

      {!loaded ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-l-md rounded-r-2xl bg-muted" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl border border-accent-marsala/30 bg-accent-marsala/10 p-4 text-sm text-accent-marsala">
          Não foi possível carregar os cadernos. Recarregue a página.
        </p>
      ) : notebooks.length === 0 ? (
        <div className="anim-rise mx-auto mt-6 flex max-w-sm flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookMarked size={30} />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Nenhum caderno ainda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie cadernos para cada matéria e escreva quantas páginas quiser.
          </p>
          <GoldenButton onClick={openCreate} className="mt-5 !rounded-xl">
            Criar caderno
          </GoldenButton>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Nenhum caderno encontrado para “{query}”.</p>
      ) : view === "grid" ? (
        <div className="anim-fade grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((nb) => (
            <NotebookCoverCard key={nb.id} notebook={nb} onEdit={openEdit} onDelete={setToDelete} />
          ))}
        </div>
      ) : (
        <div className="anim-fade grid gap-2.5 lg:grid-cols-2">
          {filtered.map((nb) => (
            <NotebookRowItem key={nb.id} notebook={nb} onEdit={openEdit} onDelete={setToDelete} />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar caderno" : "Novo caderno"}>
        <NotebookForm
          key={formKey}
          initial={editing ?? undefined}
          submitLabel={editing ? "Salvar" : "Criar caderno"}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
        {actionError && <p className="mt-3 text-center text-sm text-accent-marsala">{actionError}</p>}
      </Modal>

      <Modal open={toDelete !== null} onClose={() => setToDelete(null)} title="Excluir caderno">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Excluir <strong className="text-foreground">{toDelete?.name}</strong> e todas as suas{" "}
            {toDelete?.pageCount ?? 0} página(s)? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setToDelete(null)}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <GoldenButton
              onClick={async () => {
                if (!toDelete) return;
                try {
                  await deleteNotebook(toDelete.id);
                } catch (e) {
                  console.error(e);
                }
                setToDelete(null);
              }}
              className="flex-1 !rounded-xl !py-3"
            >
              Excluir
            </GoldenButton>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
