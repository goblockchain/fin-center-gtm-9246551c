/** Planos da Fin (preço mensal por CNPJ). Padrão: Essencial (R$250). */
export type Plano = { id: string; nome: string; valor: number };

export const PLANOS: Plano[] = [
  { id: "essencial", nome: "Essencial", valor: 250 },
  { id: "completo", nome: "Completo", valor: 850 },
];

/** A maioria dos leads entra no Essencial. */
export const PLANO_PADRAO = PLANOS[0];

export function planoDeValor(valor: number | string | null | undefined): Plano | null {
  const v = Number(valor ?? 0);
  return PLANOS.find((p) => p.valor === v) ?? null;
}

/** Nome do plano para um valor; valores fora dos planos (ex.: rede multi-unidade) caem no rótulo cru. */
export function rotuloPlano(valor: number | string | null | undefined): string {
  const p = planoDeValor(valor);
  if (p) return p.nome;
  const v = Number(valor ?? 0);
  return v > 0 ? `Personalizado` : "—";
}
