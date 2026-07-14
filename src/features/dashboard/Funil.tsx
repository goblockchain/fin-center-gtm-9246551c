import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { pct } from "@/lib/format";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { ESTAGIO_META } from "@/features/pipeline/estagios";
import { useFunil, resumoFunil } from "./api";
import type { EstagioOport } from "@/types/db";

const COR: Record<EstagioOport, string> = {
  cadastrado: "#94a3b8",
  contatado: "#38bdf8",
  qualificado: "#818cf8",
  reuniao: "#8b5cf6",
  proposta: "#f59e0b",
  piloto: "#06b6d4",
  envio_contrato: "#14b8a6",
  setup_onboarding: "#10b981",
  negociacao: "#f97316",
  fechado_ganho: "#1A7A3A",
  ticket_aberto: "#eab308",
  nps_recolhido: "#84cc16",
  indicacao: "#d946ef",
  up_cross_sell: "#ec4899",
  retencao: "#16a34a",
  fechado_perdido: "#C0392B",
};

const FLUXO: EstagioOport[] = [
  "cadastrado",
  "contatado",
  "qualificado",
  "reuniao",
  "proposta",
  "negociacao",
  "fechado_ganho",
];

export function Funil() {
  const { data: funil } = useFunil("all");

  const { dados, resumo, perdidos } = useMemo(() => {
    const f = funil ?? [];
    const dados = FLUXO.map((e) => ({
      estagio: e,
      label: ESTAGIO_META[e].label,
      n: f.find((x) => x.estagio === e)?.n ?? 0,
      cor: COR[e],
    }));
    return {
      dados,
      resumo: resumoFunil(f),
      perdidos: f.find((x) => x.estagio === "fechado_perdido")?.n ?? 0,
    };
  }, [funil]);

  const mult = resumo.taxaContatoReuniao / BASELINE_CONVERSAO;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fin-dark">Funil ao vivo</h2>
          <span className="text-xs text-muted-foreground">
            {resumo.total} oportunidades · {perdidos} perdidas
          </span>
        </div>

        {resumo.total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem oportunidades. Importe a base no CRM.
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={dados}
                layout="vertical"
                margin={{ left: 8, right: 28, top: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={92}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="n" radius={[0, 4, 4, 0]}>
                  {dados.map((d) => (
                    <Cell key={d.estagio} fill={d.cor} />
                  ))}
                  <LabelList
                    dataKey="n"
                    position="right"
                    style={{ fontSize: 11, fill: "#0f172a" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Conversão geral vs baseline */}
            <div className="flex items-center gap-2 rounded-md bg-secondary/50 p-3 text-sm">
              <ArrowUpRight className="h-4 w-4 shrink-0 text-fin" />
              <span className="text-fin-dark">
                Contato → reunião:{" "}
                <strong>{pct(resumo.taxaContatoReuniao, 1)}</strong> —{" "}
                {mult.toFixed(1)}× a baseline de 2%.
              </span>
            </div>

            {/* Gargalo */}
            {resumo.gargalo && (
              <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm">
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span className="text-fin-dark">
                  <strong>Gargalo:</strong>{" "}
                  {resumo.por(resumo.gargalo.de)} {ESTAGIO_META[resumo.gargalo.de].label.toLowerCase()} →{" "}
                  {resumo.por(resumo.gargalo.para)} {ESTAGIO_META[resumo.gargalo.para].label.toLowerCase()} (
                  {pct(resumo.gargalo.taxa, 0)} passam).{" "}
                  {pct(1 - resumo.gargalo.taxa, 0)} travam aí.
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
