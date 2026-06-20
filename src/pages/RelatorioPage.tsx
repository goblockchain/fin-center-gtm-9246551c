import { useMemo } from "react";
import { FileBarChart2, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { brl, pct } from "@/lib/format";
import { dataCurta } from "@/lib/datas";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { SPRINT_INICIO, SPRINT_FIM } from "@/features/roadmap/api";
import { useCanalExecucao, useCanalKpis } from "@/features/canais/api";
import { useSnapshots } from "@/features/dashboard/snapshots";
import { PerformanceCanais } from "@/features/dashboard/PerformanceCanais";
import { Recomendacoes } from "@/features/dashboard/Recomendacoes";
import { HeatmapCanais } from "@/features/dashboard/HeatmapCanais";
import { FunilPorCanal } from "@/features/dashboard/FunilPorCanal";
import { ProjecaoPorCanal } from "@/features/dashboard/ProjecaoPorCanal";
import { EconomiaCanais } from "@/features/economia/EconomiaCanais";

function sumBy<T>(arr: T[], f: (x: T) => number) {
  return arr.reduce((s, x) => s + f(x), 0);
}

function Tile({
  label,
  valor,
  sub,
}: {
  label: string;
  valor: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-secondary/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-fin-dark">{valor}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function RelatorioPage() {
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const { data: snaps } = useSnapshots();

  const tot = useMemo(() => {
    const ex = execucoes ?? [];
    const k = kpis ?? [];
    const contatados = sumBy(ex, (e) => Number(e.contatados ?? 0));
    const reunioes = sumBy(ex, (e) => Number(e.reunioes_ou_mais ?? 0));
    return {
      oport: sumBy(ex, (e) => Number(e.total_oport ?? 0)),
      contatados,
      reunioes,
      ganhos: sumBy(ex, (e) => Number(e.ganhos ?? 0)),
      investido: sumBy(ex, (e) => Number(e.investimento_executado ?? 0)),
      planejado: sumBy(ex, (e) => Number(e.investimento_planejado ?? 0)),
      mrr: sumBy(k, (x) => Number(x.mrr_ganho ?? 0)),
      conv: contatados > 0 ? reunioes / contatados : 0,
    };
  }, [execucoes, kpis]);

  const mult = tot.conv / BASELINE_CONVERSAO;
  const geradoEm = new Date().toLocaleString("pt-BR");

  return (
    <div className="space-y-4">
      {/* Cabeçalho do relatório */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between break-inside-avoid">
        <div className="flex items-start gap-3">
          <FileBarChart2 className="mt-0.5 h-7 w-7 shrink-0 text-fin" />
          <div>
            <h1 className="text-xl font-bold text-fin-dark">
              UseFin — Relatório GTM
            </h1>
            <p className="text-sm text-muted-foreground">
              Sprint de Validação de Canais · {dataCurta(SPRINT_INICIO)} →{" "}
              {dataCurta(SPRINT_FIM)}
            </p>
            <p className="text-xs text-muted-foreground">Gerado em {geradoEm}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 self-start rounded-md bg-fin px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-fin-dark print:hidden"
        >
          <Printer className="h-4 w-4" /> Exportar PDF
        </button>
      </div>

      {/* Resumo executivo */}
      <Card className="break-inside-avoid">
        <CardContent className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-fin-dark">
            Resumo executivo
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            <Tile label="Oportunidades" valor={tot.oport} />
            <Tile label="Contatados" valor={tot.contatados} />
            <Tile label="Reuniões" valor={tot.reunioes} />
            <Tile label="Ganhos" valor={tot.ganhos} />
            <Tile
              label="Conversão"
              valor={pct(tot.conv, 1)}
              sub={`${mult.toFixed(1)}× a baseline 2%`}
            />
            <Tile label="MRR ganho" valor={brl(tot.mrr)} />
            <Tile
              label="Investido"
              valor={brl(tot.investido)}
              sub={`de ${brl(tot.planejado)} planejado`}
            />
          </div>
        </CardContent>
      </Card>

      <section className="break-inside-avoid">
        <PerformanceCanais />
      </section>
      <section className="break-inside-avoid">
        <Recomendacoes />
      </section>
      <section className="break-inside-avoid">
        <HeatmapCanais />
      </section>
      <section className="break-inside-avoid">
        <FunilPorCanal />
      </section>
      <section className="break-inside-avoid">
        <ProjecaoPorCanal />
      </section>
      <section className="break-inside-avoid">
        <EconomiaCanais />
      </section>

      {/* Evolução semanal — histórico de snapshots */}
      <Card className="break-inside-avoid">
        <CardContent className="p-0">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-fin-dark">
              Evolução semanal (snapshots)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Data</th>
                  <th className="px-2 py-2 text-right font-medium">Oport.</th>
                  <th className="px-2 py-2 text-right font-medium">Contat.</th>
                  <th className="px-2 py-2 text-right font-medium">Reuniões</th>
                  <th className="px-2 py-2 text-right font-medium">Ganhos</th>
                  <th className="px-2 py-2 text-right font-medium">Conversão</th>
                  <th className="px-2 py-2 text-right font-medium">MRR</th>
                  <th className="px-4 py-2 text-right font-medium">Investido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(snaps ?? []).map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 text-fin-dark">
                      {dataCurta(s.ref_date)}
                    </td>
                    <td className="px-2 py-2 text-right">{s.total_oport}</td>
                    <td className="px-2 py-2 text-right">{s.contatados}</td>
                    <td className="px-2 py-2 text-right">{s.reunioes}</td>
                    <td className="px-2 py-2 text-right">{s.ganhos}</td>
                    <td className="px-2 py-2 text-right">
                      {pct(s.conversao != null ? Number(s.conversao) : 0, 1)}
                    </td>
                    <td className="px-2 py-2 text-right">{brl(s.mrr_ganho)}</td>
                    <td className="px-4 py-2 text-right">{brl(s.investido)}</td>
                  </tr>
                ))}
                {!snaps?.length && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Sem snapshots ainda. O primeiro é gravado na sexta (ou via
                      “Capturar agora” no Dashboard).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="pt-2 text-center text-xs text-muted-foreground">
        UseFin · relatório gerado a partir do dado ao vivo. Conversões sempre
        comparadas à baseline de 2%.
      </p>
    </div>
  );
}
