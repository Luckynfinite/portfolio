import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Download,
  ExternalLink,
  FolderKanban,
  Mail,
  MapPin,
  MessageSquareText,
  MoonStar,
  Phone,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ParticleBackground } from "../components/ParticleBackground";
import { RevealOnScroll } from "../components/RevealOnScroll";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useInView } from "../hooks/useInView";
import { usePortfolioData } from "../hooks/usePortfolioData";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useTilt } from "../hooks/useTilt";
import { useTypingText } from "../hooks/useTypingText";
import { submitPublicMessage } from "../services/portfolioApi";
import { formatDate, formatMonthRange } from "../utils/formatters";
import { renderMarkdown } from "../utils/markdown";

function splitName(value = "") {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return [parts[0] || "Portfolio", ""];
  }

  return [parts.slice(0, -1).join(" "), parts.at(-1)];
}

function initials(value = "") {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isExternal(value = "") {
  return /^https?:\/\//.test(value);
}

function ActionLink({ href, children, variant = "primary", icon: Icon, download = false }) {
  if (!href) {
    return null;
  }

  const classes = variant === "primary" ? "action-link-primary" : "action-link-secondary";

  return (
    <a
      href={href}
      download={download}
      target={isExternal(href) && !download ? "_blank" : undefined}
      rel={isExternal(href) && !download ? "noreferrer" : undefined}
      className={`action-link inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-300 ${classes}`}
    >
      {children}
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </a>
  );
}

function ContactInfoCard({ icon: Icon, label, value, className = "" }) {
  if (!value) {
    return null;
  }

  return (
    <div className={`rounded-[28px] border border-[var(--line-soft)] bg-[color:var(--surface-1)]/58 p-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-[var(--content-soft)]">
        <Icon className="h-4 w-4 text-[var(--accent)]" />
        {label}
      </div>
      <p className="mt-3 break-all font-medium text-[var(--content-strong)]">{value}</p>
    </div>
  );
}

function MarqueeRail({ items = [] }) {
  if (!items.length) {
    return null;
  }

  const loop = [...items, ...items];

  return (
    <div className="marquee-rail glass-panel-strong mx-auto mt-2 max-w-7xl overflow-hidden rounded-[32px] px-0 py-0">
      <div className="marquee-track">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="marquee-item">
            <Sparkles className="h-3.5 w-3.5" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionShell({ eyebrow, title, description, children, id, index }) {
  return (
    <section id={id} className="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-16">
      <div className="section-shell-deco" aria-hidden="true">
        {index ? <span className="section-watermark">{index}</span> : null}
      </div>
      <RevealOnScroll className="mb-8 max-w-3xl">
        <div className="flex items-center gap-3">
          {index ? <span className="section-index-chip">{index}</span> : null}
          {eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-[var(--content-muted)]">{eyebrow}</p> : null}
        </div>
        <h2 className="section-title mt-3 font-[var(--font-display)] text-4xl sm:text-5xl">{title}</h2>
        {description ? <p className="mt-4 text-base leading-7 text-[var(--content-muted)]">{description}</p> : null}
      </RevealOnScroll>
      {children}
    </section>
  );
}

function PublicSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <div className="glass-panel rounded-[36px] p-8">
        <div className="skeleton h-4 w-32 rounded-full" />
        <div className="mt-6 skeleton h-16 w-2/3 rounded-[28px]" />
        <div className="mt-4 skeleton h-5 w-1/2 rounded-2xl" />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-40 rounded-[28px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillCard({ skill, index, reducedMotion }) {
  const [ref, isInView] = useInView({
    threshold: 0.22,
    rootMargin: "0px 0px -10% 0px",
  });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return undefined;
    }

    if (reducedMotion) {
      setValue(skill.level || 0);
      return undefined;
    }

    const duration = 900;
    const target = Math.max(0, Math.min(100, skill.level || 0));
    const start = performance.now();
    let frameId = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [isInView, reducedMotion, skill.level]);

  return (
    <article
      ref={ref}
      data-visible={isInView ? "true" : "false"}
      className="reveal-block skill-card-premium glass-panel rounded-[32px] p-5"
      style={{ "--reveal-delay": `${index * 70}ms`, "--skill-accent": skill.color || "var(--accent)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--content-muted)]">{skill.category || "Categorie"}</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--content-strong)]">{skill.name}</h3>
        </div>
        <span className="rounded-full border border-[var(--line-strong)] bg-[color:var(--surface-1)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--content-strong)]">
          {value}%
        </span>
      </div>
      {skill.description ? <p className="mt-4 text-sm leading-7 text-[var(--content-muted)]">{skill.description}</p> : null}
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[color:var(--surface-3)]/55">
        <div
          className="skill-bar-fill h-full rounded-full"
          style={{
            width: `${isInView ? Math.max(0, Math.min(100, skill.level || 0)) : 0}%`,
            background: `linear-gradient(90deg, color-mix(in srgb, ${skill.color || "var(--accent)"} 65%, white 15%), ${skill.color || "var(--accent)"})`,
          }}
        />
      </div>
      {skill.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skill.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--line-soft)] bg-[color:var(--surface-1)]/65 px-3 py-1 text-xs text-[var(--content-muted)]">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function ProjectCard({ project, index, reducedMotion, isSpotlight = false }) {
  const { tiltStyle, tiltHandlers } = useTilt({
    maxRotate: 9,
    scale: 1.018,
    disabled: reducedMotion,
  });

  return (
    <RevealOnScroll delay={index * 80} className={isSpotlight ? "lg:col-span-2" : ""}>
      <article
        className={`project-tilt-card glass-panel-strong overflow-hidden rounded-[34px] ${isSpotlight ? "project-spotlight" : ""}`}
        style={tiltStyle}
        {...tiltHandlers}
      >
        <div className="project-tilt-card-inner">
          {project.image_url ? (
            <div className="relative overflow-hidden">
              <img
                src={project.image_url}
                alt={project.title}
                className={`${isSpotlight ? "h-72 lg:h-80" : "h-56"} w-full object-cover transition duration-700 group-hover:scale-[1.04]`}
              />
              <div className="project-image-overlay pointer-events-none absolute inset-0" />
            </div>
          ) : (
            <div className={`mesh-bg relative flex ${isSpotlight ? "h-72 lg:h-80" : "h-56"} items-end overflow-hidden bg-gradient-to-br from-sky-500/16 via-blue-900/30 to-[color:var(--surface-0)] p-6`}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,177,255,0.2),transparent_38%)]" />
              <span className="chip-contrast rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
                {project.category || "Projet"}
              </span>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  {project.category ? (
                    <span className="rounded-full border border-[var(--line-soft)] bg-[color:var(--surface-1)]/65 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">
                      {project.category}
                    </span>
                  ) : null}
                  <span className="chip-success rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
                    {project.status || "Publie"}
                  </span>
                  {project.featured ? (
                    <span className="chip-featured rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
                      A la une
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-[var(--content-strong)]">{project.title}</h3>
              </div>
              {project.project_date ? <span className="text-sm text-[var(--content-muted)]">{formatDate(project.project_date)}</span> : null}
            </div>

            {project.summary ? <p className="mt-4 text-sm leading-7 text-[var(--content-muted)]">{project.summary}</p> : null}

            {project.technologies?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-[var(--line-soft)] bg-[color:var(--surface-1)]/60 px-3 py-1 text-xs text-[var(--content-muted)]">
                    {tech}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {project.github_url ? (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line-strong)] bg-[color:var(--surface-1)]/70 px-3.5 py-2.5 text-sm font-medium text-[var(--content-strong)] transition hover:bg-[color:var(--surface-2)]/90"
                >
                  <Code2 className="h-4 w-4" />
                  GitHub
                </a>
              ) : null}
              {project.demo_url ? (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line-strong)] bg-[color:var(--surface-1)]/70 px-3.5 py-2.5 text-sm font-medium text-[var(--content-strong)] transition hover:bg-[color:var(--surface-2)]/90"
                >
                  <ExternalLink className="h-4 w-4" />
                  Demo
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </RevealOnScroll>
  );
}

export function HomePage() {
  const { data, isPending, isError, error, refetch } = usePortfolioData();
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pushToast } = useToast();
  const reducedMotion = usePrefersReducedMotion();
  const [contactValues, setContactValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });
  const [sending, setSending] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("hero");
  const [indicatorStyle, setIndicatorStyle] = useState({
    opacity: 0,
    width: 0,
    transform: "translateX(0px)",
  });
  const navRef = useRef(null);
  const navItemRefs = useRef({});

  const profile = data?.profile || {};
  const settings = data?.settings || {};
  const skills = data?.skills || [];
  const projects = data?.projects || [];
  const experiences = data?.experiences || [];
  const certifications = data?.certifications || [];
  const services = data?.services || [];

  useDocumentMeta({
    title: profile.seo_title || settings.seo_title || `${profile.full_name || settings.site_name || "Portfolio"} | Portfolio`,
    description:
      profile.seo_description ||
      settings.seo_description ||
      settings.hero_intro ||
      profile.short_bio ||
      "Portfolio professionnel.",
  });

  const [firstName, lastName] = splitName(profile.full_name);

  const heroRoles = useMemo(
    () =>
      Array.from(
        new Set(
          [
            profile.headline,
            settings.site_tagline,
            profile.availability,
            "Conception et livraison d'experiences web sur mesure",
          ].filter(Boolean),
        ),
      ),
    [profile.availability, profile.headline, settings.site_tagline],
  );

  const typedRole = useTypingText(heroRoles, {
    reducedMotion,
    typingSpeed: 72,
    deletingSpeed: 38,
    holdDelay: 1500,
  });

  const projectCategories = useMemo(
    () => ["all", ...new Set(projects.map((project) => project.category).filter(Boolean))],
    [projects],
  );

  const signalItems = useMemo(
    () =>
      [
        profile.location && `Base a ${profile.location}`,
        profile.availability,
        profile.email && `Contact direct: ${profile.email}`,
      ].filter(Boolean),
    [profile.availability, profile.email, profile.location],
  );

  const marqueeItems = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...skills.slice(0, 6).map((skill) => skill.name),
            ...services.slice(0, 4).map((service) => service.title),
            ...projects.slice(0, 4).map((project) => project.category || project.title),
          ].filter(Boolean),
        ),
      ),
    [projects, services, skills],
  );

  const visibleProjects = useMemo(() => {
    const sorted = [...projects].sort((left, right) => {
      if (left.featured === right.featured) {
        return String(right.project_date || "").localeCompare(String(left.project_date || ""));
      }

      return left.featured ? -1 : 1;
    });

    if (projectFilter === "all") {
      return sorted;
    }

    return sorted.filter((project) => project.category === projectFilter);
  }, [projectFilter, projects]);

  const navItems = useMemo(
    () => [
      { href: "#hero", label: "Profil", sectionId: "hero" },
      { href: "#skills", label: "Competences", sectionId: "skills" },
      { href: "#projects", label: "Projets", sectionId: "projects" },
      { href: "#experience", label: "Experiences", sectionId: "experience" },
      { href: "#services", label: "Services", sectionId: "services" },
      { href: "#contact", label: "Contact", sectionId: "contact" },
    ],
    [],
  );

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.sectionId))
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.18, 0.35, 0.55, 0.72],
        rootMargin: "-18% 0px -48% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [navItems]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeLink = navItemRefs.current[activeSection];
      const navElement = navRef.current;

      if (!activeLink || !navElement) {
        setIndicatorStyle((current) => ({ ...current, opacity: 0 }));
        return;
      }

      setIndicatorStyle({
        opacity: 1,
        width: activeLink.offsetWidth,
        transform: `translateX(${activeLink.offsetLeft}px)`,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection]);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactValues((current) => ({ ...current, [name]: value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    if (contactValues.company) {
      return;
    }

    if (contactValues.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(contactValues.email) || contactValues.message.trim().length < 20) {
      pushToast({
        tone: "warning",
        title: "Formulaire incomplet",
        description: "Verifiez le nom, l'email et un message d'au moins 20 caracteres.",
      });
      return;
    }

    try {
      setSending(true);
      await submitPublicMessage({
        name: contactValues.name,
        email: contactValues.email,
        subject: contactValues.subject || settings.contact_email_subject || "Prise de contact portfolio",
        message: contactValues.message,
        company: contactValues.company,
      });
      pushToast({
        tone: "success",
        title: "Message envoye",
        description: "Votre message a bien ete envoye.",
      });
      setContactValues({
        name: "",
        email: "",
        subject: settings.contact_email_subject || "",
        message: "",
        company: "",
      });
    } catch (submitError) {
      pushToast({
        tone: "danger",
        title: "Envoi impossible",
        description: submitError.message || "Le message n'a pas pu etre envoye pour le moment.",
      });
    } finally {
      setSending(false);
    }
  };

  if (isPending) {
    return <PublicSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
        <div className="glass-panel w-full rounded-[32px] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--content-muted)]">Portfolio</p>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl text-[var(--content-strong)]">Chargement impossible</h1>
          <p className="mt-4 text-[var(--content-muted)]">{error?.message || "Le contenu du portfolio n'a pas pu etre charge."}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-8 rounded-2xl bg-[var(--content-strong)] px-5 py-3 text-sm font-semibold text-[var(--surface-0)] transition hover:translate-y-[-2px]"
          >
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-shell relative isolate overflow-hidden" style={settings.theme_accent ? { "--accent": settings.theme_accent } : undefined}>
      <ParticleBackground />
      <div className="hero-grid-lines pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(86,177,255,0.16),transparent_56%)]" aria-hidden="true" />

      <header className="sticky top-0 z-30 border-b border-[var(--line-soft)] bg-[color:var(--surface-0)]/74 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <a href="#hero" className="group flex items-center gap-3">
            <div className="brand-badge flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-lg">
              {initials(profile.full_name || settings.site_name || "TK")}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--content-strong)]">{settings.site_name || profile.full_name || "Portfolio"}</p>
              {settings.site_tagline || profile.headline ? (
                <p className="text-xs text-[var(--content-soft)]">{settings.site_tagline || profile.headline}</p>
              ) : null}
            </div>
          </a>

          <nav ref={navRef} className="public-nav relative hidden items-center gap-1 rounded-full border border-[var(--line-soft)] bg-[color:var(--surface-1)]/64 p-1 lg:flex">
            <span className="nav-active-pill" style={indicatorStyle} aria-hidden="true" />
            {navItems.map((item) => (
              <a
                key={item.href}
                ref={(node) => {
                  navItemRefs.current[item.sectionId] = node;
                }}
                href={item.href}
                className={`relative z-[1] rounded-full px-3.5 py-2 text-sm transition ${
                  activeSection === item.sectionId ? "text-[var(--content-strong)]" : "text-[var(--content-soft)] hover:text-[var(--content-strong)]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line-strong)] bg-[color:var(--surface-1)]/70 px-3 py-2.5 text-sm font-medium text-[var(--content-strong)] transition hover:bg-[color:var(--surface-2)]/88"
            >
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              {theme === "dark" ? "Clair" : "Sombre"}
            </button>
            {!isAuthLoading && isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line-strong)] bg-[color:var(--surface-1)]/70 px-3 py-2.5 text-sm font-medium text-[var(--content-strong)] transition hover:bg-[color:var(--surface-2)]/88"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <main id="hero" className="relative z-10 pb-16">
        <section className="mx-auto grid max-w-7xl gap-6 px-6 pt-10 pb-12 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
          <RevealOnScroll className="hero-panel glass-panel rounded-[40px] p-7 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-[color:var(--surface-1)]/72 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[var(--content-soft)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              {settings.hero_eyebrow || profile.hero_badge || "Portfolio premium"}
            </div>

            <div className="mt-6">
              <h1 className="font-[var(--font-display)] text-5xl leading-[0.9] sm:text-6xl lg:text-7xl">
                <span className="block text-[var(--content-soft)]">{firstName || "Votre"}</span>
                <span className="glitch-stack mt-2 block text-[var(--content-strong)]" data-text={lastName || "Portfolio"}>
                  <span className="glitch-base">{lastName || "Portfolio"}</span>
                  <span className="glitch-layer glitch-layer-a" aria-hidden="true">
                    {lastName || "Portfolio"}
                  </span>
                  <span className="glitch-layer glitch-layer-b" aria-hidden="true">
                    {lastName || "Portfolio"}
                  </span>
                </span>
              </h1>
            </div>

            {heroRoles.length ? (
              <div className="typing-shell mt-6">
                <span className="typing-text">{typedRole || heroRoles[0]}</span>
                <span className="typing-cursor" aria-hidden="true" />
              </div>
            ) : null}

            {profile.short_bio ? <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--content-soft)]">{profile.short_bio}</p> : null}

            {signalItems.length ? (
              <div className="hero-signal-grid mt-6">
                {signalItems.map((item) => (
                  <div key={item} className="hero-signal-chip">
                    <span className="hero-signal-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink href={settings.primary_cta_url || "#projects"} icon={ArrowRight}>
                {settings.primary_cta_label || "Voir les projets"}
              </ActionLink>
              {profile.resume_url ? (
                <ActionLink href={profile.resume_url} variant="secondary" icon={Download} download>
                  {settings.secondary_cta_label || "Telecharger le CV"}
                </ActionLink>
              ) : settings.secondary_cta_url ? (
                <ActionLink href={settings.secondary_cta_url} variant="secondary" icon={ArrowRight}>
                  {settings.secondary_cta_label || "Continuer"}
                </ActionLink>
              ) : null}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Projets", value: projects.length },
                { label: "Competences", value: skills.length },
                { label: "Services", value: services.length },
              ].map((item, index) => (
                <div key={item.label} className="stat-card rounded-[28px] border border-[var(--line-soft)] bg-[color:var(--surface-1)]/62 p-4" style={{ "--reveal-delay": `${index * 90}ms` }}>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--content-strong)]">{item.value}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120} className="glass-panel-strong rounded-[40px] p-6">
            <div className="hero-side-card rounded-[32px] border border-[var(--line-soft)] bg-[color:var(--surface-1)]/58 p-5">
              <div className="hero-avatar-ring mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-[var(--line-strong)] bg-[color:var(--surface-1)]/76">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || "Profile"} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-[var(--font-display)] text-4xl text-[var(--content-strong)]">{initials(profile.full_name || "TK")}</span>
                )}
              </div>
              <div className="mt-6 text-center">
                <p className="text-2xl font-semibold text-[var(--content-strong)]">{profile.full_name || settings.site_name || "Portfolio"}</p>
                <p className="mt-2 text-sm text-[var(--content-soft)]">{profile.availability || settings.site_tagline || "Disponible pour de nouvelles opportunites."}</p>
              </div>
            </div>

            {profile.email || profile.phone || profile.location ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ContactInfoCard icon={Mail} label="Email" value={profile.email} />
                <ContactInfoCard icon={Phone} label="Telephone" value={profile.phone} />
                <ContactInfoCard
                  icon={MapPin}
                  label="Localisation"
                  value={profile.location}
                  className={profile.email && profile.phone ? "sm:col-span-2" : ""}
                />
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {profile.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line-strong)] bg-[color:var(--surface-1)]/70 px-3 py-2.5 text-sm font-medium text-[var(--content-strong)] transition hover:bg-[color:var(--surface-2)]/88"
                >
                  <Code2 className="h-4 w-4" />
                  GitHub
                </a>
              ) : null}
              {profile.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line-strong)] bg-[color:var(--surface-1)]/70 px-3 py-2.5 text-sm font-medium text-[var(--content-strong)] transition hover:bg-[color:var(--surface-2)]/88"
                >
                  <ExternalLink className="h-4 w-4" />
                  LinkedIn
                </a>
              ) : null}
            </div>

                {profile.bio_markdown ? (
              <div
                className="markdown-content mt-5 rounded-[28px] border border-[var(--line-soft)] bg-[color:var(--surface-1)]/5 p-5 text-sm leading-7"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(profile.bio_markdown) }}
              />
            ) : null}
          </RevealOnScroll>
        </section>

        <RevealOnScroll delay={120}>
          <MarqueeRail items={marqueeItems} />
        </RevealOnScroll>

        <SectionShell
          id="skills"
          index="01"
          eyebrow="Competences"
          title="Competences"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill, index) => (
              <SkillCard key={skill.id || `${skill.name}-${index}`} skill={skill} index={index} reducedMotion={reducedMotion} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          index="02"
          eyebrow="Projets"
          title="Realisations"
        >
          <RevealOnScroll className="mb-6 flex flex-wrap gap-2">
            {projectCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setProjectFilter(category)}
                className={[
                  "rounded-full border px-4 py-2 text-sm transition duration-300",
                  projectFilter === category
                    ? "border-transparent bg-[var(--content-strong)] text-[var(--surface-0)] shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                    : "border-[var(--line-strong)] bg-[color:var(--surface-1)]/64 text-[var(--content-soft)] hover:bg-[color:var(--surface-2)]/85 hover:text-[var(--content-strong)]",
                ].join(" ")}
              >
                {category === "all" ? "Tous" : category}
              </button>
            ))}
          </RevealOnScroll>

          <div className="grid gap-4 lg:grid-cols-2">
            {visibleProjects.map((project, index) => (
              <ProjectCard
                key={project.id || `${project.title}-${index}`}
                project={project}
                index={index}
                reducedMotion={reducedMotion}
                isSpotlight={index === 0 && (project.featured || visibleProjects.length > 2)}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="experience"
          index="03"
          eyebrow="Parcours"
          title="Parcours professionnel"
        >
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="timeline-stack space-y-4">
              {experiences.map((item, index) => (
                <RevealOnScroll key={item.id || `${item.role_title}-${index}`} delay={index * 70}>
                  <article className="timeline-card-premium glass-panel rounded-[32px] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">
                          {formatMonthRange(item.start_date, item.end_date, item.is_current)}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-[var(--content-strong)]">{item.role_title}</h3>
                        <p className="mt-2 text-sm font-medium text-[var(--content-soft)]">
                          {item.company}
                          {item.location ? ` - ${item.location}` : ""}
                        </p>
                      </div>
                    {item.is_current ? (
                        <span className="chip-success rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
                          En cours
                        </span>
                      ) : null}
                    </div>
                    {item.summary ? <p className="mt-4 text-sm leading-7 text-[var(--content-muted)]">{item.summary}</p> : null}
                    {item.technologies?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.technologies.map((tech) => (
                          <span key={tech} className="rounded-full border border-[var(--line-soft)] bg-[color:var(--surface-1)]/62 px-3 py-1 text-xs text-[var(--content-muted)]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                </RevealOnScroll>
              ))}
            </div>

            <div className="space-y-4">
              {certifications.map((item, index) => (
                <RevealOnScroll key={item.id || `${item.name}-${index}`} delay={index * 70}>
                  <article className="cert-card-premium glass-panel rounded-[32px] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--content-muted)]">{item.issuer}</p>
                        <h3 className="mt-3 text-xl font-semibold text-[var(--content-strong)]">{item.name}</h3>
                      </div>
                      <span className="rounded-full border border-[var(--line-strong)] bg-[color:var(--surface-1)]/65 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--content-soft)]">
                        {item.status || "Active"}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-[var(--content-muted)]">
                      {item.issue_date ? formatDate(item.issue_date) : "Date a definir"}
                      {item.expiry_date ? ` - expire ${formatDate(item.expiry_date)}` : ""}
                    </p>
                    {item.description ? <p className="mt-4 text-sm leading-7 text-[var(--content-muted)]">{item.description}</p> : null}
                    {item.credential_url ? (
                      <a
                        href={item.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] transition hover:translate-x-[2px]"
                      >
                        Voir la preuve
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="services"
          index="04"
          eyebrow="Services"
          title="Services"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <RevealOnScroll key={service.id || `${service.title}-${index}`} delay={index * 70}>
                <article className="service-card-premium glass-panel rounded-[32px] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[color:var(--surface-1)]/64 text-[var(--accent)]">
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>
                    {service.featured ? (
                      <span className="chip-featured rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
                        A la une
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[var(--content-strong)]">{service.title}</h3>
                  {service.summary ? <p className="mt-3 text-sm leading-7 text-[var(--content-muted)]">{service.summary}</p> : null}
                  {service.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-[var(--line-soft)] bg-[color:var(--surface-1)]/62 px-3 py-1 text-xs text-[var(--content-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="contact"
          index="05"
          eyebrow="Contact"
          title={settings.contact_title || "Contact"}
        >
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <RevealOnScroll>
              <div className="contact-info-panel glass-panel rounded-[34px] p-6">
                {profile.email || profile.phone || profile.location || profile.availability ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ContactInfoCard icon={Mail} label="Email" value={profile.email} />
                    <ContactInfoCard icon={Phone} label="Telephone" value={profile.phone} />
                    <ContactInfoCard icon={MapPin} label="Localisation" value={profile.location} />
                    <ContactInfoCard icon={MessageSquareText} label="Disponibilite" value={profile.availability} />
                  </div>
                ) : null}

                {settings.contact_message ? (
                  <div
                    className="markdown-content mt-5 rounded-[28px] border border-[var(--line-soft)] bg-[color:var(--surface-1)]/5 p-5 text-sm leading-7"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(settings.contact_message) }}
                  />
                ) : null}
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={80}>
              <form onSubmit={handleContactSubmit} className="contact-form-panel glass-panel rounded-[34px] p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-1">
                    <span className="mb-2 block text-sm font-medium text-[var(--content-strong)]">Nom</span>
                    <input
                      name="name"
                      value={contactValues.name}
                      onChange={handleContactChange}
                      className="input-shell w-full rounded-2xl px-3 py-2.5 text-sm"
                      placeholder="Votre nom"
                    />
                  </label>
                  <label className="sm:col-span-1">
                    <span className="mb-2 block text-sm font-medium text-[var(--content-strong)]">Email</span>
                    <input
                      name="email"
                      value={contactValues.email}
                      onChange={handleContactChange}
                      className="input-shell w-full rounded-2xl px-3 py-2.5 text-sm"
                      placeholder="vous@entreprise.com"
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[var(--content-strong)]">Sujet</span>
                    <input
                      name="subject"
                      value={contactValues.subject}
                      onChange={handleContactChange}
                      className="input-shell w-full rounded-2xl px-3 py-2.5 text-sm"
                      placeholder={settings.contact_email_subject || "Sujet de votre demande"}
                    />
                  </label>
                  <label className="hidden">
                    <span>Company</span>
                    <input name="company" value={contactValues.company} onChange={handleContactChange} tabIndex="-1" autoComplete="off" />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[var(--content-strong)]">Message</span>
                    <textarea
                      name="message"
                      value={contactValues.message}
                      onChange={handleContactChange}
                      rows="7"
                      className="input-shell w-full rounded-[28px] px-3 py-3 text-sm"
                      placeholder="Decrivez votre besoin, le contexte et l'objectif."
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--content-strong)] px-4 py-3 text-sm font-semibold text-[var(--surface-0)] transition hover:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Envoi..." : "Envoyer le message"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </RevealOnScroll>
          </div>
        </SectionShell>
      </main>

      <footer className="relative z-10 border-t border-[var(--line-soft)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-[var(--content-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span>{settings.footer_note || settings.site_name || profile.full_name || "Portfolio"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[var(--accent)]" />
              {projects.length} projets
            </span>
            <span className="inline-flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-[var(--accent)]" />
              {experiences.length} experiences
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
