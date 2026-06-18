/** Formata em Real (sem centavos por padrão). Coage strings (numeric do PostgREST). */
export function brl(v: number | string | null | undefined, comCentavos = false): string {
  return Number(v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: comCentavos ? 2 : 0,
    maximumFractionDigits: comCentavos ? 2 : 0,
  });
}

/** Percentual a partir de uma fração (0.04 → "4%"). */
export function pct(frac: number | null | undefined, casas = 0): string {
  if (frac == null) return "—";
  return `${(frac * 100).toFixed(casas)}%`;
}
