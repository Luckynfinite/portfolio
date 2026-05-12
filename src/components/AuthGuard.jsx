import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

function AuthSplash({ title, description, icon: Icon, children }) {
  return (
    <div className="min-h-screen bg-[var(--surface-0)] text-[var(--content-strong)]">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
        <div className="glass-panel w-full rounded-[32px] p-8 text-center shadow-2xl shadow-black/20 sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-7 w-7" />
          </div>
          <h1 className="font-[var(--font-display)] text-3xl">{title}</h1>
          <p className="mt-3 text-sm text-[var(--content-muted)] sm:text-base">{description}</p>
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function AuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { configured, session, isAdmin, isLoading, isRoleLoading, signOut } = useAuth();
  const { pushToast } = useToast();

  if (!configured) {
    return (
      <AuthSplash
        icon={ShieldAlert}
        title="Supabase non configure"
        description="Ajoutez les variables d'environnement Supabase avant d'activer le dashboard admin."
      />
    );
  }

  if (isLoading || (session && isRoleLoading)) {
    return (
      <AuthSplash
        icon={ShieldCheck}
        title="Verification de la session"
        description="Le systeme controle l'authentification et le role admin avant de rendre l'interface."
      />
    );
  }

  if (!session) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (!isAdmin) {
    const handleSignOut = async () => {
      try {
        await signOut();
        pushToast({
          tone: "info",
          title: "Session fermee",
          description: "Reconnecte-toi maintenant avec le compte admin.",
        });
        navigate("/admin/login", { replace: true });
      } catch (error) {
        pushToast({
          tone: "danger",
          title: "Deconnexion impossible",
          description: error.message || "La session Supabase n'a pas pu etre fermee.",
        });
      }
    };

    return (
      <AuthSplash
        icon={ShieldAlert}
        title="Acces refuse"
        description="Cette interface est reservee aux comptes disposant du role admin dans Supabase."
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--content-muted)]">
          Session detectee: <span className="font-medium text-[var(--content-strong)]">{session?.user?.email || "utilisateur connecte"}</span>
        </div>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Se deconnecter
          </button>
          <Link
            to="/admin/login"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Aller au login admin
          </Link>
        </div>
      </AuthSplash>
    );
  }

  return <Outlet />;
}
