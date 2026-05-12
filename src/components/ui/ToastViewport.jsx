import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";

const toneMap = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-400/25",
    iconColor: "text-emerald-300",
  },
  warning: {
    icon: TriangleAlert,
    border: "border-amber-400/25",
    iconColor: "text-amber-300",
  },
  danger: {
    icon: XCircle,
    border: "border-rose-400/25",
    iconColor: "text-rose-300",
  },
  info: {
    icon: Info,
    border: "border-sky-400/25",
    iconColor: "text-sky-300",
  },
};

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[90] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {toasts.map((toast) => {
          const tone = toneMap[toast.tone] || toneMap.info;
          const Icon = tone.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto rounded-3xl border bg-slate-950/88 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl",
                tone.border,
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl border border-white/8 bg-white/5 p-2">
                  <Icon className={cn("h-4 w-4", tone.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm text-slate-300">{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="rounded-xl border border-white/8 bg-white/5 p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
