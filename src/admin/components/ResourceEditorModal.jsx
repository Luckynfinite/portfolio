import { AnimatePresence, motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { AdminField } from "./AdminField";

export function ResourceEditorModal({
  open,
  title,
  description,
  fields,
  draft,
  files,
  isSaving,
  onChange,
  onFileChange,
  onClose,
  onSave,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="glass-panel-strong scroll-slim max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[36px] p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">CRUD editor</p>
                <h3 className="mt-2 font-[var(--font-display)] text-3xl text-white">{title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--content-muted)]">{description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <AdminField
                  key={field.name}
                  field={field}
                  value={draft[field.name]}
                  file={files[field.name]}
                  onChange={onChange}
                  onFileChange={onFileChange}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
