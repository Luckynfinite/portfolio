import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="glass-panel w-full max-w-xl rounded-[32px] p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Shield className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.24em] text-[var(--content-muted)]">404</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl">Page introuvable</h1>
        <p className="mt-3 text-[var(--content-muted)]">
          Le lien demande n'existe pas ou a ete deplace pendant la refonte du portfolio.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
