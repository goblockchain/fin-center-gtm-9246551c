/**
 * Detalhe da origem dentro do canal.
 *
 * O canal segue sendo a unidade central (CAC/ROI por canal, §4.1). Isto aqui é
 * o recorte DENTRO do canal: de qual rede veio o inbound, se o outbound foi
 * pesquisa ou presencial, quem indicou. Um campo só (contas.origem_detalhe),
 * com significado dado pelo canal.
 *
 * Chaveado por SLUG, não por nome: o nome é editável no banco, o slug não.
 */
export type DetalheCanal =
  | { modo: "select"; label: string; opcoes: string[] }
  | { modo: "texto"; label: string; placeholder: string };

const POR_SLUG: Record<string, DetalheCanal> = {
  // Meta Ads NÃO entra aqui: é canal próprio, para o CAC da mídia paga não
  // diluir no orgânico. Este detalhe é só do inbound orgânico.
  inbound: {
    modo: "select",
    label: "Origem do inbound",
    opcoes: ["Instagram", "LinkedIn", "Reddit"],
  },
  outbound: {
    modo: "select",
    label: "Tipo de abordagem",
    opcoes: ["Pesquisa", "Presencial"],
  },
  indicacoes: {
    modo: "texto",
    label: "Quem indicou",
    placeholder: "Ex.: João — JCI",
  },
};

/** O detalhe pedido por este canal, ou null se o canal não tem detalhe. */
export function detalheDoCanal(slug: string | undefined): DetalheCanal | null {
  return (slug && POR_SLUG[slug]) || null;
}
