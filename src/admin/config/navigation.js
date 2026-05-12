import {
  Award,
  BriefcaseBusiness,
  FolderKanban,
  Home,
  Mail,
  MessageSquareMore,
  Settings,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";

export const adminNavigation = [
  { to: "/admin/dashboard", label: "Dashboard", icon: Home },
  { to: "/admin/profile", label: "Profil", icon: UserRound },
  { to: "/admin/skills", label: "Competences", icon: Sparkles },
  { to: "/admin/projects", label: "Projets", icon: FolderKanban },
  { to: "/admin/experiences", label: "Experiences", icon: BriefcaseBusiness },
  { to: "/admin/certifications", label: "Certifications", icon: Award },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/contact", label: "Contact", icon: Mail },
  { to: "/admin/messages", label: "Messages", icon: MessageSquareMore },
  { to: "/admin/settings", label: "Parametres", icon: Settings },
];
