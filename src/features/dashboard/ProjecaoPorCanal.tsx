import { useMemo } from "react";
import { Telescope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { pct } from "@/lib/format";
import { relativo } from "@/lib/datas";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { useCanalExecucao, useCanalKpis } from "@/features/canais/api";

export function ProjecaoPorCanal() {
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();

  const linhas = useMemo(() => {
    const kpiPorId = new Map((kpis ?? []).map((k) => [k.canal_id, k]));
    return (execucoes ?? []).map((e) => {
      const kpi = e.canal_id ? kpiPorId.get(e.canal_id) : undefined;
      const total = Number(e.total_oport ?? 0);
      const ganhos = Number(e.ganhos ?? 0);
      const perdidos = Number(kpi?.perdidos ?? 0);
      const ativos = Math.max(0, total - ganhos - perdidos);
      const taxaPropria =
        kpi?.taxa_conversao != null ? Number(kpi.taxa_conversao) : null;
      // Usa a conversão do próprio canal quando ele já gera dado real;
      // caso contrário, projeta pela baseline de 2% (transparente).
      const usaPropria =
        e.estado === "Gerando dados" &&
        taxaPropria != null &&
        taxaPropria > 0;
      const taxa = usaPropria ? taxaPropria! : BASELINE_CONVERSAO;
      const proj = Math.round(ativos * taxa);
      return {
        id: e.canal_id,
        nome: e.nome,
        ativos,
        taxa,
        usaPropria,
        proj,
        gate: e.gate_data,
      };
    });
  }, [execucoes, kpis]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Telescope className="h-4 w-4 text-fin" />
          <h3 className="text-sm font-semibold text-fin-dark">
            Projeção por canal
          </h3>
          <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
            projeção, não fato
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Canal</th>
                <th className="px-2 py-2 text-right font-medium">Ativos</th>
                <th className="px-2 py-2 text-right font-medium">Taxa</th>
                <th className="px-2 py-2 text-right font-medium">
                  Proj. reuniões
                </th>
                <th className="px-4 py-2 text-right font-medium">Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 font-medium text-fin-dark">
                    {l.nome}
                  </td>
                  <td className="px-2 py-2 text-right text-fin-dark">
                    {l.ativos}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span className="text-fin-dark">{pct(l.taxa, 1)}</span>
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {l.usaPropria ? "própria" : "baseline"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right font-semibold text-fin">
                    ~{l.proj}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground">
                    {relativo(l.gate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
