import { useMemo, type ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import { useCanais, useCanalExecucao, useCanalKpis } from "./api";
import { useCanalEconomia } from "@/features/economia/api";
import { useOportunidadesReceita, linhasPorCanal } from "@/features/dashboard/receita";

const CORES = [
  "#2D6A4F",
  "#40916C",
  "#74C69D",
  "#95D5B2",
  "#D9920A",
  "#0ea5e9",
  "#8b5cf6",
];

function Tile({
  label,
  valor,
  hint,
}: {
  label: string;
  valor: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-md bg-secondary/50 p-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-bold leading-tight text-fin-dark tabular-nums">
        {valor}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Cabeçalho da aba Canais: visão geral + gráfico de leads por canal + CAC. */
export function CanaisResumo() {
  const { data: ops } = useOportunidadesReceita();
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const { data: canais } = useCanais();
  const { data: economia } = useCanalEconomia();

  const { linhas, tot, cacMedio } = useMemo(() => {
    const linhas = linhasPorCanal(
      ops ?? [],
      execucoes ?? [],
      kpis ?? [],
      canais ?? [],
      economia ?? [],
    ).sort((a, b) => b.leads - a.leads);
    const tot = linhas.reduce(
      (a, l) => ({
        leads: a.leads + l.leads,
        clientes: a.clientes + l.clientes,
        mrr: a.mrr + l.mrr,
        investido: a.investido + l.investido,
      }),
      { leads: 0, clientes: 0, mrr: 0, investido: 0 },
    );
    const cacMedio = tot.clientes > 0 ? tot.investido / tot.clientes : null;
    return { linhas, tot, cacMedio };
  }, [ops, execucoes, kpis, canais, economia]);

  const dados = linhas.map((l, i) => ({
    nome: l.nome,
    leads: l.leads,
    cor: CORES[i % CORES.length],
  }));

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-fin" />
          <h2 className="text-sm font-semibold text-fin-dark">
            Visão geral dos canais
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tile label="Leads" valor={tot.leads} />
          <Tile label="Clientes" valor={tot.clientes} />
          <Tile label="MRR" valor={brl(tot.mrr)} />
          <Tile
            label="CAC médio"
            valor={cacMedio != null ? brl(cacMedio) : "—"}
            hint="custo ÷ clientes"
          />
        </div>

        {dados.length > 0 && (
          <div className="mt-4">
            <p className="mb-1 text-xs text-muted-foreground">Leads por canal</p>
            <ResponsiveContainer
              width="100%"
              height={Math.max(110, dados.length * 34)}
            >
              <BarChart
                data={dados}
                layout="vertical"
                margin={{ left: 8, right: 36, top: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={132}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="leads" radius={[0, 4, 4, 0]}>
                  {dados.map((d) => (
                    <Cell key={d.nome} fill={d.cor} />
                  ))}
                  <LabelList
                    dataKey="leads"
                    position="right"
                    style={{ fontSize: 11, fill: "#0f172a" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-xs text-muted-foreground">
            Custo de aquisição (CAC) por canal
          </p>
          <div className="flex flex-wrap gap-2">
            {linhas.map((l) => (
              <span
                key={l.canal_id}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-xs"
              >
                <span className="font-medium text-fin-dark">{l.nome}</span>
                <span className="text-muted-foreground">
                  {l.cac != null ? brl(l.cac) : "—"}
                </span>
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
