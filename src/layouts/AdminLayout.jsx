import { motion } from "framer-motion";
import { LogOut, Menu, MoonStar, PanelLeftClose, SunMedium } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { adminNavigation } from "../admin/config/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";

function SidebarLink({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition",
          isActive
            ? "border border-white/10 bg-white/10 text-white shadow-lg shadow-black/10"
            : "text-slate-300 hover:bg-white/6 hover:text-white",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const { signOut, session } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pushToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = useMemo(
    () => adminNavigation.find((item) => location.pathname.startsWith(item.to)) || adminNavigation[0],
    [location.pathname],
  );

  const handleLogout = async () => {
    try {
      await signOut();
      pushToast({
        tone: "info",
        title: "Session fermee",
        description: "Le compte admin a ete deconnecte proprement.",
      });
    } catch (error) {
      pushToast({
        tone: "danger",
        title: "Deconnexion impossible",
        description: error.message || "La session n'a pas pu etre fermee.",
      });
    }
  };

  return (
    <div className="admin-shell min-h-screen bg-[var(--surface-0)] text-[var(--content-strong)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 py-3 sm:px-4">
        <motion.aside
          initial={false}
          animate={sidebarOpen ? { x: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          className={[
            "glass-panel-strong fixed inset-y-3 left-3 z-40 flex w-[288px] flex-col rounded-[32px] p-4 shadow-2xl shadow-black/20 transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0",
          ].join(" ")}
        >
          <div className="mb-6 flex items-center justify-between gap-3 px-2 pt-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-900/30">
                TK
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Portfolio Admin</p>
                <p className="text-xs text-slate-400">Secure content workspace</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 lg:hidden"
              aria-label="Fermer la sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <nav className="scroll-slim flex-1 space-y-1 overflow-y-auto pr-1">
            {adminNavigation.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="mt-6 rounded-3xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admin session</p>
            <p className="mt-2 truncate text-sm font-semibold text-white">{session?.user?.email}</p>
            <p className="mt-1 text-sm text-slate-400">Les formulaires ne sont jamais rendus hors de cette zone protege.</p>
          </div>
        </motion.aside>

        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="glass-panel sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 lg:hidden"
                aria-label="Ouvrir la sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Administration</p>
                <h1 className="font-[var(--font-display)] text-2xl text-white">{activeItem.label}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <main className="relative z-10 py-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
