import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { brl, pct } from "@/lib/format";
import { dataCurta } from "@/lib/datas";
import { useCanais } from "@/features/canais/api";
import { useSnapshots, type SnapshotCanal } from "./snapshots";
import { diasAtras } from "./receita";

const CORES = ["#1A7A3A", "#38bdf8", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5e9"];

const METRICAS = [
  { key: "mrr", label: "MRR", fmt: (n: number) => brl(n) },
  { key: "clientes", label: "Clientes", fmt: (n: number) => String(n) },
  { key: "cac", label: "CAC", fmt: (n: number) => brl(n) },
  { key: "roi", label: "ROI", fmt: (n: number) => pct(n, 0) },
] as const;

const PERIODOS = [
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
  { label: "12 meses", dias: 365 },
];

function valor(pc: SnapshotCanal, metrica: string): number | null {
  switch (metrica) {
    case "mrr":
      return Number(pc.mrr_ganho ?? 0);
    case "clientes":
      return Number(pc.ganhos ?? 0);
    case "cac":
      return pc.cac != null ? Number(pc.cac) : null;
    case "roi":
      return pc.roi != null ? Number(pc.roi) : null;
    default:
      return null;
  }
}

export function TendenciasCanais() {
  const { data: snaps } = useSnapshots();
  const { data: canais } = useCanais();
  const [metrica, setMetrica] = useState<string>("mrr");
  const [dias, setDias] = useState(90);

  const meta = METRICAS.find((m) => m.key === metrica) ?? METRICAS[0];

  const serie = useMemo(() => {
    const corte = diasAtras(dias);
    return [...(snaps ?? [])]
      .reverse() // cronológico
      .filter((s) => s.ref_date >= corte)
      .map((s) => {
        const ponto: Record<string, number | string | null> = {
          label: dataCurta(s.ref_date).slice(0, 5),
        };
        s.por_canal.forEach((pc) => {
          if (pc.nome) ponto[pc.nome] = valor(pc, metrica);
        });
        return ponto;
      });
  }, [snaps, metrica, dias]);

  const poucos = serie.length < 2;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-fin-dark">
            Tendências por canal
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              {METRICAS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetrica(m.key)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    metrica === m.key
                      ? "bg-fin text-white"
                      : "text-muted-foreground hover:text-fin-dark",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              {PERIODOS.map((p) => (
                <button
                  key={p.dias}
                  type="button"
                  onClick={() => setDias(p.dias)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    dias === p.dias
                      ? "bg-fin text-white"
                      : "text-muted-foreground hover:text-fin-dark",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {poucos ? (
          <p className="rounded-md bg-secondary/40 px-3 py-6 text-center text-sm text-muted-foreground">
            As tendências aparecem conforme os registros semanais se acumulam
            (gravados toda sexta).{" "}
            {serie.length === 0
              ? "Nenhuma captura no período."
              : "Há 1 captura — a partir da próxima já há linha."}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={serie}
              margin={{ left: 0, right: 12, top: 6, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => meta.fmt(v)}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(v: number, n) => [meta.fmt(v), n as string]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {(canais ?? []).map((c, i) => (
                <Line
                  key={c.id}
                  type="monotone"
                  dataKey={c.nome}
                  stroke={CORES[i % CORES.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
