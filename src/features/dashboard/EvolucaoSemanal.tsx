import { useMemo } from "react";
import { Camera, History } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { brl, pct } from "@/lib/format";
import { dataCurta } from "@/lib/datas";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { useSnapshots, useCapturarSnapshot } from "./snapshots";

const delta = (a?: number | null, b?: number | null) =>
  a != null && b != null ? Number(a) - Number(b) : null;

function Delta({
  d,
  fmt,
  sentido = "up",
}: {
  d: number | null;
  fmt: (n: number) => string;
  sentido?: "up" | "neutral";
}) {
  if (d == null) return null;
  if (d === 0)
    return (
      <span className="text-[11px] text-muted-foreground">sem mudança</span>
    );
  const pos = d > 0;
  const cls =
    sentido === "neutral"
      ? "text-muted-foreground"
      : pos
        ? "text-fin"
        : "text-destructive";
  return (
    <span className={cn("text-[11px] font-medium", cls)}>
      {pos ? "▲" : "▼"} {fmt(Math.abs(d))}
    </span>
  );
}

function Tile({
  label,
  valor,
  children,
}: {
  label: string;
  valor: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-secondary/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-fin-dark">{valor}</p>
      <div className="mt-0.5 h-4">{children}</div>
    </div>
  );
}

const inteiro = (n: number) => String(Math.round(n));

export function EvolucaoSemanal() {
  const { data: snaps, isLoading } = useSnapshots();
  const capturar = useCapturarSnapshot();

  const atual = snaps?.[0];
  const anterior = snaps?.[1];

  const serie = useMemo(
    () =>
      [...(snaps ?? [])].reverse().map((s) => ({
        label: dataCurta(s.ref_date).slice(0, 5), // dd/mm
        conversao: s.conversao != null ? Number(s.conversao) : 0,
        reunioes: s.reunioes,
      })),
    [snaps],
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-fin" />
            <h2 className="text-sm font-semibold text-fin-dark">
              Evolução semana a semana
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {atual && (
              <span className="text-xs text-muted-foreground">
                Última: {dataCurta(atual.ref_date)}
                {atual.origem === "manual" ? " (manual)" : " (automática)"} ·
                próxima sexta 18h
              </span>
            )}
            <button
              type="button"
              onClick={() => capturar.mutate()}
              disabled={capturar.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-fin-dark hover:bg-secondary disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
              {capturar.isPending ? "Capturando…" : "Capturar agora"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Carregando histórico…
          </p>
        ) : !atual ? (
          <p className="rounded-md bg-secondary/40 px-3 py-4 text-center text-sm text-muted-foreground">
            Nenhum snapshot ainda. O sistema grava sozinho toda sexta às 18h —
            ou use “Capturar agora” para registrar o primeiro.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              <Tile label="Oportunidades" valor={atual.total_oport}>
                <Delta
                  d={delta(atual.total_oport, anterior?.total_oport)}
                  fmt={inteiro}
                />
              </Tile>
              <Tile label="Contatados" valor={atual.contatados}>
                <Delta
                  d={delta(atual.contatados, anterior?.contatados)}
                  fmt={inteiro}
                />
              </Tile>
              <Tile label="Reuniões" valor={atual.reunioes}>
                <Delta
                  d={delta(atual.reunioes, anterior?.reunioes)}
                  fmt={inteiro}
                />
              </Tile>
              <Tile label="Ganhos" valor={atual.ganhos}>
                <Delta d={delta(atual.ganhos, anterior?.ganhos)} fmt={inteiro} />
              </Tile>
              <Tile
                label="Conversão"
                valor={pct(atual.conversao != null ? Number(atual.conversao) : 0, 1)}
              >
                <Delta
                  d={delta(atual.conversao, anterior?.conversao)}
                  fmt={(n) => pct(n, 1)}
                />
              </Tile>
              <Tile label="MRR ganho" valor={brl(atual.mrr_ganho)}>
                <Delta
                  d={delta(atual.mrr_ganho, anterior?.mrr_ganho)}
                  fmt={(n) => brl(n)}
                />
              </Tile>
              <Tile label="Investido" valor={brl(atual.investido)}>
                <Delta
                  d={delta(atual.investido, anterior?.investido)}
                  fmt={(n) => brl(n)}
                  sentido="neutral"
                />
              </Tile>
            </div>

            {serie.length >= 2 ? (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  Conversão contato→reunião por semana (linha tracejada = baseline
                  2%)
                </p>
                <ResponsiveContainer width="100%" height={160}>
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
                      tickFormatter={(v) => pct(v, 0)}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      formatter={(v: number) => [pct(v, 1), "Conversão"]}
                    />
                    <ReferenceLine
                      y={BASELINE_CONVERSAO}
                      stroke="#C0392B"
                      strokeDasharray="4 4"
                    />
                    <Line
                      type="monotone"
                      dataKey="conversao"
                      stroke="#1A7A3A"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="rounded-md bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                Primeira captura registrada. A comparação ▲▼ e o gráfico de
                tendência aparecem a partir do próximo snapshot (sexta, ou outra
                captura manual).
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
