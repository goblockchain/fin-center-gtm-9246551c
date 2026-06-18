const DIA = 86_400_000;

/** Dias de hoje até a data (negativo = passado). null se sem data. */
export function diasAte(dateISO: string | null | undefined): number | null {
  if (!dateISO) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = new Date(`${dateISO}T00:00:00`);
  return Math.round((d.getTime() - hoje.getTime()) / DIA);
}

/** Tempo humano relativo: "hoje", "em 2 dias", "há 1 dia". */
export function relativo(dateISO: string | null | undefined): string {
  const n = diasAte(dateISO);
  if (n == null) return "—";
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  if (n === -1) return "ontem";
  return n > 0 ? `em ${n} dias` : `há ${Math.abs(n)} dias`;
}

/** Prazo: "em 2 dias" (futuro) ou "atrasado há 1 dia" (vencido). */
export function prazoHumano(dateISO: string | null | undefined): string {
  const n = diasAte(dateISO);
  if (n == null) return "sem prazo";
  if (n < 0) return `atrasado ${relativo(dateISO)}`;
  return relativo(dateISO);
}

export type Urgencia = "ok" | "perto" | "vencido";

/** Verde (folga) · âmbar (≤2 dias) · vermelho (vencido). */
export function urgencia(dateISO: string | null | undefined): Urgencia {
  const n = diasAte(dateISO);
  if (n == null) return "ok";
  if (n < 0) return "vencido";
  if (n <= 2) return "perto";
  return "ok";
}

export const URGENCIA_TEXT: Record<Urgencia, string> = {
  ok: "text-fin",
  perto: "text-warning",
  vencido: "text-destructive",
};

export const URGENCIA_BG: Record<Urgencia, string> = {
  ok: "bg-fin-light/40 text-fin-dark",
  perto: "bg-warning/15 text-warning",
  vencido: "bg-destructive/15 text-destructive",
};

/** Data crua dd/mm/aaaa (secundária ao texto relativo). */
export function dataCurta(dateISO: string | null | undefined): string {
  if (!dateISO) return "—";
  const [y, m, d] = dateISO.split("-");
  return `${d}/${m}/${y}`;
}
