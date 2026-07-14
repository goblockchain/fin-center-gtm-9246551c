import type { EstagioOport } from "@/types/db";

/** Ordem das raias (kanban): funil de vendas + esteira pós-fechamento. */
export const ESTAGIOS: EstagioOport[] = [
  "cadastrado",
  "contatado",
  "qualificado",
  "reuniao",
  "proposta",
  "piloto",
  "envio_contrato",
  "setup_onboarding",
  "negociacao",
  "fechado_ganho",
  "ticket_aberto",
  "nps_recolhido",
  "indicacao",
  "up_cross_sell",
  "retencao",
  "fechado_perdido",
];

export const ESTAGIO_META: Record<EstagioOport, { label: string; dot: string }> =
  {
    cadastrado: { label: "Cadastrado", dot: "bg-muted-foreground" },
    contatado: { label: "Contatado", dot: "bg-sky-400" },
    qualificado: { label: "Qualificado", dot: "bg-indigo-400" },
    reuniao: { label: "Reunião", dot: "bg-violet-500" },
    proposta: { label: "Proposta", dot: "bg-amber-500" },
    piloto: { label: "Piloto", dot: "bg-cyan-500" },
    envio_contrato: { label: "Envio de Contrato", dot: "bg-teal-500" },
    setup_onboarding: { label: "Setup / Onboarding", dot: "bg-emerald-500" },
    negociacao: { label: "Negociação", dot: "bg-orange-500" },
    fechado_ganho: { label: "Fechado · ganho", dot: "bg-fin" },
    ticket_aberto: { label: "Ticket aberto", dot: "bg-yellow-500" },
    nps_recolhido: { label: "NPS recolhido", dot: "bg-lime-500" },
    indicacao: { label: "Indicação", dot: "bg-fuchsia-500" },
    up_cross_sell: { label: "Up / Cross Sell", dot: "bg-pink-500" },
    retencao: { label: "Retenção", dot: "bg-green-600" },
    fechado_perdido: { label: "Fechado · perdido", dot: "bg-destructive" },
  };
