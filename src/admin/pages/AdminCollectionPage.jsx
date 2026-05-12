import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ResourceEditorModal } from "../components/ResourceEditorModal";
import { useToast } from "../../contexts/ToastContext";
import { useAdminCollection, useDeleteCollectionMutation, useSaveCollectionMutation } from "../../hooks/useAdminData";
import { COLLECTION_SECTIONS, createCollectionDraft } from "../../types/resources";
import { formatDate, formatListLabel, truncate } from "../../utils/formatters";

const PAGE_SIZE = 8;

function normalizeForSearch(value) {
  if (Array.isArray(value)) {
    return value.join(" ").toLowerCase();
  }

  return String(value || "").toLowerCase();
}

function renderCell(value) {
  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  if (Array.isArray(value)) {
    return formatListLabel(value);
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return formatDate(value);
  }

  return value || "-";
}

function TableSkeleton() {
  return (
    <div className="glass-panel rounded-[32px] p-6">
      <div className="skeleton h-7 w-52 rounded-2xl" />
      <div className="mt-4 skeleton h-4 w-96 rounded-2xl" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton h-16 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}

export function AdminCollectionPage({ resourceKey }) {
  const config = COLLECTION_SECTIONS[resourceKey];
  const { data = [], isLoading } = useAdminCollection(resourceKey);
  const saveMutation = useSaveCollectionMutation(resourceKey);
  const deleteMutation = useDeleteCollectionMutation(resourceKey);
  const { pushToast } = useToast();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);
  const [editorState, setEditorState] = useState({
    open: false,
    draft: createCollectionDraft(resourceKey),
    files: {},
  });
  const [pendingDelete, setPendingDelete] = useState(null);

  const filterOptions = useMemo(
    () => ["all", ...new Set(data.map((item) => item[config.filterKey]).filter(Boolean))],
    [config.filterKey, data],
  );

  const filteredItems = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase();

    return data.filter((item) => {
      const matchesSearch = !needle
        ? true
        : config.searchKeys.some((key) => normalizeForSearch(item[key]).includes(needle));
      const matchesFilter = filterValue === "all" ? true : item[config.filterKey] === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [config.filterKey, config.searchKeys, data, deferredSearch, filterValue]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const visibleCount = data.filter((item) => item.is_visible).length;
  const featuredCount = data.filter((item) => item.featured).length;

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-[34px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">{config.label}</p>
            <h2 className="mt-2 font-[var(--font-display)] text-4xl text-white">{config.label}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--content-muted)]">{config.description}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditorState({
                open: true,
                draft: createCollectionDraft(resourceKey),
                files: {},
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Ajouter un {config.singularLabel}
          </button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-white/8 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Total</p>
            <p className="mt-2 text-3xl font-semibold text-white">{data.length}</p>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Visible publiquement</p>
            <p className="mt-2 text-3xl font-semibold text-white">{visibleCount}</p>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Featured</p>
            <p className="mt-2 text-3xl font-semibold text-white">{featuredCount}</p>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[34px] p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--content-muted)]" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="input-shell w-full rounded-2xl py-3 pr-3 pl-10 text-sm"
              placeholder={`Rechercher dans ${config.label.toLowerCase()}`}
            />
          </div>

          <select
            value={filterValue}
            onChange={(event) => {
              setFilterValue(event.target.value);
              setPage(1);
            }}
            className="input-shell rounded-2xl px-3 py-3 text-sm"
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Tous les filtres" : option}
              </option>
            ))}
          </select>
        </div>

        {paginatedItems.length ? (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/8">
            <div className="scroll-slim overflow-x-auto">
              <table className="min-w-full divide-y divide-white/8 text-left">
                <thead className="bg-white/4">
                  <tr>
                    {config.columns.map((column) => (
                      <th key={column.key} className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Resume</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {paginatedItems.map((item, index) => (
                    <motion.tr
                      key={item.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.03 }}
                      className="bg-white/[0.02]"
                    >
                      {config.columns.map((column) => (
                        <td key={column.key} className="px-4 py-4 text-sm text-slate-100">
                          {renderCell(item[column.key])}
                        </td>
                      ))}
                      <td className="max-w-xs px-4 py-4 text-sm text-[var(--content-muted)]">
                        {truncate(item.summary || item.description || item.name || item.title || item.role_title, 120)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditorState({
                                open: true,
                                draft: {
                                  ...createCollectionDraft(resourceKey),
                                  ...item,
                                },
                                files: {},
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" />
                            Editer
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(item)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-400/15"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-white/4 px-5 py-10 text-center">
            <h3 className="text-xl font-semibold text-white">{config.emptyTitle}</h3>
            <p className="mt-3 text-sm text-[var(--content-muted)]">{config.emptyDescription}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--content-muted)]">
            {filteredItems.length} resultat(s) - page {page} / {pageCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Precedent
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </section>

      <ResourceEditorModal
        open={editorState.open}
        title={editorState.draft.id ? `Modifier ${config.singularLabel}` : `Ajouter ${config.singularLabel}`}
        description={config.description}
        fields={config.fields}
        draft={editorState.draft}
        files={editorState.files}
        isSaving={saveMutation.isPending}
        onClose={() =>
          setEditorState({
            open: false,
            draft: createCollectionDraft(resourceKey),
            files: {},
          })
        }
        onChange={(name, value) =>
          setEditorState((current) => ({
            ...current,
            draft: {
              ...current.draft,
              [name]: value,
            },
          }))
        }
        onFileChange={(name, file) =>
          setEditorState((current) => ({
            ...current,
            files: {
              ...current.files,
              [name]: file,
            },
          }))
        }
        onSave={async () => {
          await saveMutation.mutateAsync({
            draft: editorState.draft,
            files: editorState.files,
          });
          pushToast({
            tone: "success",
            title: `${config.label} sauvegardees`,
            description: `Le ${config.singularLabel} a ete enregistre avec succes.`,
          });
          setEditorState({
            open: false,
            draft: createCollectionDraft(resourceKey),
            files: {},
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Supprimer ${config.singularLabel}`}
        description={`Cette action supprimera definitivement cet element dans ${config.label.toLowerCase()}.`}
        confirmLabel="Supprimer"
        onClose={() => setPendingDelete(null)}
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!pendingDelete?.id) {
            return;
          }

          await deleteMutation.mutateAsync(pendingDelete.id);
          pushToast({
            tone: "success",
            title: `${config.singularLabel} supprime`,
            description: "L'element a ete retire de la base Supabase.",
          });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
