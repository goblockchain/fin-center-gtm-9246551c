/**
 * Baseline de conversão (contato → reunião) do outbound frio histórico.
 * Constante de produto: toda taxa de conversão é comparada a isto.
 * Fonte única no front (a view canal_kpis usa o mesmo 0.02).
 */
export const BASELINE_CONVERSAO = 0.02;

/** Quantas vezes uma taxa supera (ou não) a baseline de 2%. */
export function multiploVsBaseline(taxa: number | null | undefined): number | null {
  if (taxa == null) return null;
  return taxa / BASELINE_CONVERSAO;
}
