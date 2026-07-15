import type { Enums } from "@/types/db";

/** Planos da Fin (preço mensal por CNPJ). Padrão: Essencial (R$250). */
export type Plano = { id: string; nome: string; valor: number };

export const PLANOS: Plano[] = [
  { id: "essencial", nome: "Essencial", valor: 250 },
  { id: "completo", nome: "Completo", valor: 850 },
];

/** A maioria dos leads entra no Essencial. */
export const PLANO_PADRAO = PLANOS[0];

/**
 * Plano fixo por tipo de negócio, quando existe:
 * franqueado é sempre Essencial (R$250). Franqueador negocia o MRR conforme o
 * nº de unidades da rede; independente escolhe entre os planos livremente.
 */
export function planoFixo(tipo: Enums<"tipo_negocio"> | null): Plano | null {
  return tipo === "franqueado" ? PLANOS[0] : null;
}

/** Franqueador precisa do nº de unidades — é o que justifica o MRR negociado. */
export function exigeUnidades(tipo: Enums<"tipo_negocio"> | null): boolean {
  return tipo === "franqueador";
}

/** MRR ao trocar o tipo de negócio: franqueado cai no plano fixo; o resto mantém o valor atual. */
export function valorParaTipo(
  tipo: Enums<"tipo_negocio"> | null,
  valorAtual: number,
): number {
  return planoFixo(tipo)?.valor ?? valorAtual;
}

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
