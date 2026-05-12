import { useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { configured, isAdmin, isLoading, signIn, authError } = useAuth();
  const { pushToast } = useToast();
  const [values, setValues] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";

  useEffect(() => {
    if (isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAdmin, navigate, redirectTo]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="glass-panel w-full max-w-xl rounded-[34px] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-[var(--font-display)] text-4xl text-white">Supabase manquant</h1>
          <p className="mt-3 text-[var(--content-muted)]">
            Ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` avant d'ouvrir l'administration.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="glass-panel w-full max-w-xl rounded-[34px] p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl border border-white/10 bg-white/5" />
          <div className="mx-auto mt-6 h-10 w-56 rounded-2xl bg-white/6" />
          <div className="mx-auto mt-4 h-4 w-72 rounded-2xl bg-white/6" />
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await signIn(values);
      pushToast({
        tone: "success",
        title: "Connexion acceptee",
        description: "Verification du role admin en cours.",
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      pushToast({
        tone: "danger",
        title: "Connexion refusee",
        description: error.message || authError || "Verifiez les identifiants Supabase.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="glass-panel-strong grid w-full max-w-5xl overflow-hidden rounded-[40px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-white/6 bg-gradient-to-br from-sky-500/12 via-blue-500/6 to-transparent p-8 lg:border-r lg:border-b-0 lg:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ShieldCheck className="h-7 w-7 text-sky-300" />
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.24em] text-[var(--content-muted)]">Secure admin</p>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl text-white">Connexion admin</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--content-muted)]">
            Cette interface n'est rendue qu'apres verification de la session Supabase et du role admin.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              "Routes React protegees sur /admin",
              "Session Supabase persistante",
              "Rendu des formulaires bloque hors authentification",
              "CRUD complet branche aux tables PostgreSQL",
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <LockKeyhole className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Authentification</p>
              <p className="text-sm text-[var(--content-muted)]">Utilisez votre compte admin Supabase.</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Email</span>
              <input
                type="email"
                value={values.email}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                className="input-shell w-full rounded-2xl px-3 py-3 text-sm"
                placeholder="admin@domaine.com"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Mot de passe</span>
              <input
                type="password"
                value={values.password}
                onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                className="input-shell w-full rounded-2xl px-3 py-3 text-sm"
                placeholder="Votre mot de passe"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
