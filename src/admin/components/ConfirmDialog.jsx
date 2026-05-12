import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "danger",
  onConfirm,
  onClose,
  isLoading = false,
}) {
  const toneClasses =
    tone === "danger"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15"
      : "border-sky-400/20 bg-sky-400/10 text-sky-100 hover:bg-sky-400/15";

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
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="glass-panel-strong w-full max-w-md rounded-[32px] p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-[var(--font-display)] text-2xl text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--content-muted)]">{description}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${toneClasses}`}
              >
                {isLoading ? "Traitement..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
