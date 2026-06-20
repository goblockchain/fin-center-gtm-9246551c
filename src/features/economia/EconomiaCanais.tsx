import { Card, CardContent } from "@/components/ui/card";
import { brl, pct } from "@/lib/format";
import { useCanalEconomia } from "./api";

export function EconomiaCanais() {
  const { data: economia } = useCanalEconomia();
  const linhas = economia ?? [];
  const semCusto =
    linhas.length > 0 && linhas.every((e) => Number(e.custo_total ?? 0) === 0);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-fin-dark">
            Economia por canal
          </h3>
          <p className="text-xs text-muted-foreground">
            Derivada dos custos itemizados. CAC = custo total ÷ clientes ·
            Payback = custo ÷ MRR · ARR = MRR × 12.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Canal</th>
                <th className="px-2 py-2 text-right font-medium">Custo total</th>
                <th className="px-2 py-2 text-right font-medium">Horas</th>
                <th className="px-2 py-2 text-right font-medium">CAC</th>
                <th className="px-2 py-2 text-right font-medium">MRR/hora</th>
                <th className="px-2 py-2 text-right font-medium">MRR</th>
                <th className="px-2 py-2 text-right font-medium">ARR</th>
                <th className="px-2 py-2 text-right font-medium">Payback</th>
                <th className="px-4 py-2 text-right font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((e) => {
                const roi = e.roi != null ? Number(e.roi) : null;
                return (
                  <tr key={e.canal_id}>
                    <td className="px-4 py-2 font-medium text-fin-dark">
                      {e.nome}
                    </td>
                    <td className="px-2 py-2 text-right text-fin-dark">
                      {brl(e.custo_total)}
                    </td>
                    <td className="px-2 py-2 text-right text-muted-foreground">
                      {Number(e.horas_total ?? 0) > 0
                        ? `${Number(e.horas_total)}h`
                        : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-muted-foreground">
                      {e.cac != null ? brl(e.cac) : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-muted-foreground">
                      {e.mrr_por_hora != null ? brl(e.mrr_por_hora) : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-fin-dark">
                      {Number(e.mrr_ganho ?? 0) > 0 ? brl(e.mrr_ganho) : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-muted-foreground">
                      {Number(e.arr ?? 0) > 0 ? brl(e.arr) : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-muted-foreground">
                      {e.payback_meses != null
                        ? `${Number(e.payback_meses).toFixed(1)} m`
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {roi != null ? (
                        <span className={roi >= 0 ? "text-fin" : "text-destructive"}>
                          {pct(roi, 0)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {semCusto && (
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            Lance custos acima para ver CAC, MRR/hora, ARR, Payback e ROI por
            canal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
