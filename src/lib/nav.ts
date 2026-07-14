import {
  LayoutDashboard,
  Presentation,
  Users,
  CalendarRange,
  MessageSquareText,
  Quote,
  Sparkles,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

/** As rotas do UseFin. O canal é a unidade central. */
export const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Foco de hoje, saúde dos canais e funil ao vivo.",
  },
  {
    to: "/executivo",
    label: "Visão Executiva",
    icon: Presentation,
    description: "Snapshot de 5 minutos: funil, fechamentos e projeção.",
  },
  {
    to: "/leads",
    label: "Leads",
    icon: Users,
    description: "Pipeline e base de contas — kanban e tabela.",
  },
  {
    to: "/roadmap",
    label: "Roadmap",
    icon: CalendarRange,
    description: "Timeline, tarefas da sprint, gates e economia.",
  },
  {
    to: "/mensagens",
    label: "Mensagens",
    icon: MessageSquareText,
    description: "Modelos por canal/estágio e log manual.",
  },
  {
    to: "/voz",
    label: "Voz do Cliente",
    icon: Quote,
    description: "Depoimentos, provas e narrativas.",
  },
  {
    to: "/marca",
    label: "Marca & Iniciativas",
    icon: Sparkles,
    description: "Esteira de ideias e testes de marca e comercial.",
  },
  {
    to: "/agenda",
    label: "Agenda",
    icon: CalendarDays,
    description: "Calendário sincronizado com Google e bot WhatsApp.",
  },
];
