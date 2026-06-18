/** Estado derivado do canal (vindo da view canal_execucao). */
export type EstadoCanal =
  | "Em preparação"
  | "Pronto"
  | "Em execução"
  | "Gerando dados";

export const ESTADO_META: Record<string, { chip: string; ring: string }> = {
  "Em preparação": {
    chip: "bg-muted text-muted-foreground",
    ring: "text-muted-foreground",
  },
  Pronto: { chip: "bg-sky-100 text-sky-700", ring: "text-sky-500" },
  "Em execução": { chip: "bg-amber-100 text-amber-800", ring: "text-amber-500" },
  "Gerando dados": { chip: "bg-fin-light text-fin-dark", ring: "text-fin" },
};

export function estadoMeta(estado: string | null | undefined) {
  return ESTADO_META[estado ?? ""] ?? ESTADO_META["Em preparação"];
}

/** Só neste estado o card mostra o bloco de KPIs (nunca zeros). */
export function geraDados(estado: string | null | undefined) {
  return estado === "Gerando dados";
}
