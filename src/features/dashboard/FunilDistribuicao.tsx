import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useFunil } from "./api";
import type { EstagioOport } from "@/types/db";

// Rótulos alinhados ao vocabulário canônico do funil (ESTAGIO_META / Pipeline)
// — a rosca agrupa as etapas finais, mas usa os mesmos nomes de etapa.
const SEGMENTOS: {
  nome: string;
  cor: string;
  estagios: EstagioOport[];
}[] = [
  { nome: "Cadastrado", cor: "#94a3b8", estagios: ["cadastrado"] },
  { nome: "Contatado", cor: "#38bdf8", estagios: ["contatado"] },
  { nome: "Qualificado", cor: "#818cf8", estagios: ["qualificado"] },
  {
    nome: "Reunião+",
    cor: "#f59e0b",
    estagios: ["reuniao", "proposta", "negociacao"],
  },
  {
    nome: "Fechado",
    cor: "#1A7A3A",
    estagios: ["fechado_ganho", "fechado_perdido"],
  },
];

export function FunilDistribuicao() {
  const { data: funil } = useFunil("all");

  const { dados, total } = useMemo(() => {
    const por = (e: EstagioOport) =>
      funil?.find((f) => f.estagio === e)?.n ?? 0;
    const dados = SEGMENTOS.map((s) => ({
      nome: s.nome,
      cor: s.cor,
      n: s.estagios.reduce((acc, e) => acc + por(e), 0),
    }));
    return { dados, total: dados.reduce((a, b) => a + b.n, 0) };
  }, [funil]);

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-fin-dark">
          Distribuição de contatos
        </h2>
        <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
          {/* Pizza (donut) com total no centro */}
          <div className="relative mx-auto h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados}
                  dataKey="n"
                  nameKey="nome"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={1}
                  stroke="none"
                >
                  {dados.map((d) => (
                    <Cell key={d.nome} fill={d.cor} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, n) => [`${v} contas`, n as string]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-fin-dark">{total}</span>
              <span className="text-[11px] text-muted-foreground">
                cadastradas
              </span>
            </div>
          </div>

          {/* Números por segmento */}
          <div className="grid grid-cols-2 gap-2">
            {dados.map((d) => (
              <div
                key={d.nome}
                className="rounded-md bg-secondary/50 p-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: d.cor }}
                  />
                  <span className="truncate text-xs text-muted-foreground">
                    {d.nome}
                  </span>
                </div>
                <p className="mt-0.5 text-xl font-bold text-fin-dark">
                  {d.n}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {total > 0 ? `${Math.round((d.n / total) * 100)}%` : ""}
                  </span>
                </p>
              </div>
            ))}
            <div className="rounded-md bg-fin-dark p-2.5 text-white">
              <span className="text-xs text-fin-light">Total cadastradas</span>
              <p className="mt-0.5 text-xl font-bold">{total}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
