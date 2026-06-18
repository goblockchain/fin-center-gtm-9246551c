export const VARIAVEIS = ["nome", "cafe", "dor"] as const;
export type Variavel = (typeof VARIAVEIS)[number];

export const VARIAVEL_LABEL: Record<Variavel, string> = {
  nome: "Nome do contato",
  cafe: "Nome da cafeteria",
  dor: "Dor principal",
};

/** Troca {nome}/{cafe}/{dor} pelos valores; mantém o placeholder se vazio. */
export function preencher(
  corpo: string,
  vars: Partial<Record<Variavel, string>>,
): string {
  return corpo.replace(/\{(nome|cafe|dor)\}/g, (_m, k: Variavel) => {
    const v = vars[k]?.trim();
    return v ? v : `{${k}}`;
  });
}

/** Quais variáveis o corpo usa (para montar só os campos necessários). */
export function variaveisUsadas(corpo: string): Variavel[] {
  return VARIAVEIS.filter((v) => corpo.includes(`{${v}}`));
}
