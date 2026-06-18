import type { EstagioOport } from "@/types/db";

/** Ordem do funil (kanban). */
export const ESTAGIOS: EstagioOport[] = [
  "cadastrado",
  "contatado",
  "qualificado",
  "reuniao",
  "proposta",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

export const ESTAGIO_META: Record<EstagioOport, { label: string; dot: string }> =
  {
    cadastrado: { label: "Cadastrado", dot: "bg-muted-foreground" },
    contatado: { label: "Contatado", dot: "bg-sky-400" },
    qualificado: { label: "Qualificado", dot: "bg-indigo-400" },
    reuniao: { label: "Reunião", dot: "bg-violet-500" },
    proposta: { label: "Proposta", dot: "bg-amber-500" },
    negociacao: { label: "Negociação", dot: "bg-orange-500" },
    fechado_ganho: { label: "Fechado · ganho", dot: "bg-fin" },
    fechado_perdido: { label: "Fechado · perdido", dot: "bg-destructive" },
  };
