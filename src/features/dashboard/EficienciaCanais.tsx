import { useMemo } from "react";
import { Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import { useCanalExecucao } from "@/features/canais/api";

export function EficienciaCanais() {
  const { data: execucoes } = useCanalExecucao();

  const linhas = useMemo(
    () =>
      (execucoes ?? []).map((e) => {
        const investido = Number(e.investimento_executado ?? 0);
        const reunioes = Number(e.reunioes_ou_mais ?? 0);
        const ganhos = Number(e.ganhos ?? 0);
        const custoReuniao =
          reunioes > 0 && investido > 0 ? investido / reunioes : null;
        const reunioesPorMil =
          investido > 0 ? reunioes / (investido / 1000) : null;
        const cac = ganhos > 0 && investido > 0 ? investido / ganhos : null;
        return {
          id: e.canal_id,
          nome: e.nome,
          investido,
          reunioes,
          custoReuniao,
          reunioesPorMil,
          cac,
        };
      }),
    [execucoes],
  );

  const maxRpm = Math.max(1, ...linhas.map((l) => l.reunioesPorMil ?? 0));

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Gauge className="h-4 w-4 text-fin" />
          <h3 className="text-sm font-semibold text-fin-dark">
            Eficiência — reuniões por R$ 1.000
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Canal</th>
                <th className="px-2 py-2 text-right font-medium">Investido</th>
                <th className="px-2 py-2 text-left font-medium">por R$ 1.000</th>
                <th className="px-2 py-2 text-right font-medium">R$/reunião</th>
                <th className="px-4 py-2 text-right font-medium">CAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 font-medium text-fin-dark">
                    {l.nome}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {brl(l.investido)}
                  </td>
                  <td className="px-2 py-2">
                    {l.reunioesPorMil != null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-fin"
                            style={{
                              width: `${(l.reunioesPorMil / maxRpm) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-fin-dark">
                          {l.reunioesPorMil.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        sem investimento
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right text-fin-dark">
                    {l.custoReuniao != null ? brl(l.custoReuniao) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-fin-dark">
                    {l.cac != null ? brl(l.cac) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Mais reuniões por R$ 1.000 = canal mais eficiente. CAC aparece só com
          fechamento.
        </p>
      </CardContent>
    </Card>
  );
}
