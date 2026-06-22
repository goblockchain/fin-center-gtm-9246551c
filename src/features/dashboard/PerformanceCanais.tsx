import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { brl, pct } from "@/lib/format";
import { useCanais, useCanalExecucao, useCanalKpis } from "@/features/canais/api";
import { useCanalEconomia } from "@/features/economia/api";
import { useOportunidadesReceita, linhasPorCanal } from "./receita";

const TIPO_LABEL: Record<string, string> = {
  outbound: "Outbound",
  inbound: "Inbound",
  comunidade: "Comunidade",
  parceria: "Parceria",
  evento: "Evento",
  conteudo: "Conteúdo",
  indicacao: "Indicação",
  midia: "Mídia paga",
  outro: "Outro",
};

export function PerformanceCanais() {
  const { data: ops } = useOportunidadesReceita();
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const { data: canais } = useCanais();
  const { data: economia } = useCanalEconomia();

  const linhas = useMemo(() => {
    const rows = linhasPorCanal(
      ops ?? [],
      execucoes ?? [],
      kpis ?? [],
      canais ?? [],
      economia ?? [],
    );
    // Ordenação padrão do spec: MRR → ROI → Clientes.
    return rows.sort(
      (a, b) =>
        b.mrr - a.mrr ||
        (b.roi ?? -Infinity) - (a.roi ?? -Infinity) ||
        b.clientes - a.clientes,
    );
  }, [ops, execucoes, kpis, canais, economia]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-fin-dark">
            Performance por canal
          </h2>
          <span className="text-xs text-muted-foreground">
            ordenado por MRR · ROI · clientes
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Canal</th>
                <th className="px-2 py-2 text-right font-medium">Leads</th>
                <th className="px-2 py-2 text-right font-medium">Reuniões</th>
                <th className="px-2 py-2 text-right font-medium">Propostas</th>
                <th className="px-2 py-2 text-right font-medium">Clientes</th>
                <th className="px-2 py-2 text-right font-medium">Conv.</th>
                <th className="px-2 py-2 text-right font-medium">MRR</th>
                <th className="px-2 py-2 text-right font-medium">CAC</th>
                <th className="px-2 py-2 text-right font-medium">Payback</th>
                <th className="px-4 py-2 text-right font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((l) => (
                <tr key={l.canal_id}>
                  <td className="px-4 py-2">
                    <div className="font-medium text-fin-dark">{l.nome}</div>
                    <span className="text-[11px] text-muted-foreground">
                      {TIPO_LABEL[l.tipo] ?? l.tipo}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {l.leads}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {l.sql}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {l.propostas}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-fin-dark">
                    {l.clientes}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {l.leads > 0 ? pct(l.conv, 1) : "—"}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-fin-dark">
                    {l.mrr > 0 ? brl(l.mrr) : "—"}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {l.cac != null ? brl(l.cac) : "—"}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {l.payback != null ? `${l.payback.toFixed(1)} m` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {l.roi != null ? (
                      <span
                        className={l.roi >= 0 ? "text-fin" : "text-destructive"}
                      >
                        {pct(l.roi, 0)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Lead = toda oportunidade no funil · Reunião = chegou à reunião ·
          Cliente = fechou. CAC = custo ÷ clientes · Payback = meses para o MRR
          cobrir o custo. Sem custo lançado, aparece “—”.
        </p>
      </CardContent>
    </Card>
  );
}
