import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Radio,
  CalendarRange,
  ListChecks,
  MessageSquareText,
  Quote,
  Sprout,
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
    to: "/pipeline",
    label: "Pipeline",
    icon: KanbanSquare,
    description: "Kanban de oportunidades por estágio e canal.",
  },
  {
    to: "/crm",
    label: "CRM",
    icon: Users,
    description: "Contas, contatos, interações e importação da base.",
  },
  {
    to: "/canais",
    label: "Canais",
    icon: Radio,
    description: "Execução, investimento e KPIs por canal.",
  },
  {
    to: "/roadmap",
    label: "Roadmap",
    icon: CalendarRange,
    description: "Gantt da sprint e gates de decisão.",
  },
  {
    to: "/tarefas",
    label: "Tarefas",
    icon: ListChecks,
    description: "Tarefas por canal, dependências e prazos.",
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
    to: "/crescimento",
    label: "Crescimento",
    icon: Sprout,
    description: "Comunidade, parcerias e eventos.",
  },
];
