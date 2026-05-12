import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { MailOpen, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../../contexts/ToastContext";
import {
  useAdminMessages,
  useDeleteMessageMutation,
  useUpdateMessageStatusMutation,
} from "../../hooks/useAdminData";
import { MESSAGE_STATUS_OPTIONS } from "../../types/resources";
import { formatDate } from "../../utils/formatters";

const PAGE_SIZE = 8;

function MessagesSkeleton() {
  return (
    <div className="glass-panel rounded-[32px] p-6">
      <div className="skeleton h-7 w-40 rounded-2xl" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton h-32 rounded-[28px]" />
        ))}
      </div>
    </div>
  );
}

export function AdminMessagesPage() {
  const { data = [], isLoading } = useAdminMessages();
  const updateStatusMutation = useUpdateMessageStatusMutation();
  const deleteMessageMutation = useDeleteMessageMutation();
  const { pushToast } = useToast();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filteredMessages = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase();

    return data.filter((message) => {
      const matchesStatus = statusFilter === "all" ? true : message.status === statusFilter;
      const haystack = `${message.name} ${message.email} ${message.subject} ${message.message}`.toLowerCase();
      const matchesSearch = !needle ? true : haystack.includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [data, deferredSearch, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
  const paginatedMessages = filteredMessages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadMessages = data.filter((message) => message.status === "new").length;

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  if (isLoading) {
    return <MessagesSkeleton />;
  }

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-[34px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">Inbox</p>
            <h2 className="mt-2 font-[var(--font-display)] text-4xl text-white">Messages entrants</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--content-muted)]">
              Consultez, recherchez, requalifiez et supprimez les messages soumis depuis le formulaire public.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200">
            Non lus: <span className="font-semibold text-white">{unreadMessages}</span>
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
              placeholder="Rechercher par nom, email, sujet ou contenu"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="input-shell rounded-2xl px-3 py-3 text-sm"
          >
            <option value="all">Tous les statuts</option>
            {MESSAGE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-3">
          {paginatedMessages.map((message) => (
            <article key={message.id} className="rounded-[28px] border border-white/8 bg-white/4 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">{message.subject}</h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-200">
                    {message.name} - {message.email}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--content-muted)]">{message.message}</p>
                  {message.company ? <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Company honeypot: {message.company}</p> : null}
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-56">
                  <select
                    value={message.status}
                    onChange={async (event) => {
                      await updateStatusMutation.mutateAsync({
                        id: message.id,
                        status: event.target.value,
                      });
                      pushToast({
                        tone: "success",
                        title: "Statut mis a jour",
                        description: "Le message a change d'etat.",
                      });
                    }}
                    className="input-shell rounded-2xl px-3 py-3 text-sm"
                  >
                    {MESSAGE_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(message.subject)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    <MailOpen className="h-4 w-4" />
                    Repondre
                  </a>

                  <button
                    type="button"
                    onClick={() => setPendingDelete(message)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--content-muted)]">
            {filteredMessages.length} resultat(s) - page {page} / {pageCount}
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Supprimer le message"
        description="Cette action retire definitivement le message de la base de donnees."
        confirmLabel="Supprimer"
        onClose={() => setPendingDelete(null)}
        isLoading={deleteMessageMutation.isPending}
        onConfirm={async () => {
          if (!pendingDelete?.id) {
            return;
          }

          await deleteMessageMutation.mutateAsync(pendingDelete.id);
          pushToast({
            tone: "success",
            title: "Message supprime",
            description: "Le message a ete retire de Supabase.",
          });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
