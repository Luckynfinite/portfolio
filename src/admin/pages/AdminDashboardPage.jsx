import { motion } from "framer-motion";
import { ArrowRight, Award, BriefcaseBusiness, FolderKanban, MailWarning, Settings, Sparkles, UserRound, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardSnapshot } from "../../hooks/useAdminData";
import { formatDate, truncate } from "../../utils/formatters";

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-[32px] p-6">
        <div className="skeleton h-6 w-48 rounded-2xl" />
        <div className="mt-4 skeleton h-4 w-80 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-[30px] p-5">
            <div className="skeleton h-10 w-10 rounded-2xl" />
            <div className="mt-6 skeleton h-8 w-16 rounded-2xl" />
            <div className="mt-3 skeleton h-4 w-24 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="glass-panel rounded-[30px] p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5" style={accent ? { color: accent } : undefined}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-6 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-[var(--content-muted)]">{label}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading } = useDashboardSnapshot();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { label: "Projets", value: data?.stats?.projects || 0, icon: FolderKanban, accent: "#7dd3fc" },
    { label: "Competences", value: data?.stats?.skills || 0, icon: Sparkles, accent: "#a5b4fc" },
    { label: "Experiences", value: data?.stats?.experiences || 0, icon: BriefcaseBusiness, accent: "#f0abfc" },
    { label: "Certifications", value: data?.stats?.certifications || 0, icon: Award, accent: "#fdba74" },
    { label: "Services", value: data?.stats?.services || 0, icon: Wrench, accent: "#86efac" },
    { label: "Messages non lus", value: data?.stats?.unreadMessages || 0, icon: MailWarning, accent: "#fda4af" },
  ];

  const quickLinks = [
    { to: "/admin/profile", label: "Mettre a jour le profil", icon: UserRound },
    { to: "/admin/projects", label: "Ajouter un projet", icon: FolderKanban },
    { to: "/admin/messages", label: "Traiter les messages", icon: MailWarning },
    { to: "/admin/settings", label: "Ajuster les parametres", icon: Settings },
  ];

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-[34px] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">Overview</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-[var(--font-display)] text-4xl text-white">Un back-office propre, route par route.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--content-muted)]">
              Tout le contenu du portfolio passe desormais par Supabase et des routes protegees. Aucun formulaire d'edition n'est rendu publiquement.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            Site: <span className="font-semibold text-white">{data?.settings?.site_name || "Portfolio"}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">Quick actions</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Raccourcis utiles</h3>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between rounded-[26px] border border-white/8 bg-white/4 px-4 py-4 transition hover:bg-white/8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-slate-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">Recent messages</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Inbox</h3>
            </div>
            <Link to="/admin/messages" className="text-sm font-medium text-sky-300 transition hover:text-sky-200">
              Voir tout
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {(data?.messages || []).slice(0, 5).map((message) => (
              <div key={message.id} className="rounded-[26px] border border-white/8 bg-white/4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{message.name}</p>
                    <p className="text-sm text-[var(--content-muted)]">{message.email}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">
                    {message.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--content-soft)]">{message.subject}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--content-muted)]">{truncate(message.message, 160)}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">{formatDate(message.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">Profile</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{data?.profile?.full_name || "Nom a renseigner"}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--content-muted)]">{data?.profile?.headline || "Ajoutez un titre principal pour le hero public."}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Email</p>
              <p className="mt-2 text-sm text-white">{data?.profile?.email || "A renseigner"}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">Disponibilite</p>
              <p className="mt-2 text-sm text-white">{data?.profile?.availability || "A renseigner"}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">Recently updated projects</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Dernieres cartes</h3>
          <div className="mt-5 space-y-3">
            {(data?.projects || []).slice(0, 4).map((project) => (
              <div key={project.id} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-white">{project.title}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">
                    {project.project_date ? formatDate(project.project_date) : "sans date"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--content-muted)]">{truncate(project.summary, 120)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
