import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { brl, pct } from "@/lib/format";
import { useCanais } from "@/features/canais/api";
import { useCanalExecucao, useCanalKpis } from "@/features/canais/api";
import {
  useOportunidadesReceita,
  metricasReceita,
  janelaFechamentos,
  paybackMeses,
  diasAtras,
} from "./receita";
import { useMetas, competencia } from "@/features/economia/api";

const PERIODOS = [
  { label: "Semana", dias: 7 },
  { label: "Mês", dias: 30 },
  { label: "Trimestre", dias: 90 },
];

type Dir = "up" | "down" | "flat";

function delta(d: number, fmt: (n: number) => string, upBom = true) {
  const dir: Dir = d > 0 ? "up" : d < 0 ? "down" : "flat";
  const bom = upBom ? d >= 0 : d <= 0;
  const sinal = d > 0 ? "+" : d < 0 ? "−" : "";
  return { texto: `${sinal}${fmt(Math.abs(d))}`, dir, bom };
}

function Delta({
  texto,
  dir,
  bom,
}: {
  texto: string;
  dir: Dir;
  bom: boolean;
}) {
  if (dir === "flat")
    return (
      <span className="mt-1 block text-[11px] text-muted-foreground">
        estável
      </span>
    );
  const Icon = dir === "up" ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "mt-1 inline-flex items-center gap-1 text-xs font-medium",
        bom ? "text-fin" : "text-destructive",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {texto}
    </span>
  );
}

function Stat({
  label,
  valor,
  children,
  hint,
}: {
  label: string;
  valor: React.ReactNode;
  children?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-tight text-fin-dark">
        {valor}
      </p>
      {children}
      {hint && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function VisaoExecutiva() {
  const [dias, setDias] = useState(30);
  const { data: ops } = useOportunidadesReceita();
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const { data: canais } = useCanais();
  const { data: metas } = useMetas();

  const dados = useMemo(() => {
    const lista = ops ?? [];
    const metr = metricasReceita(lista);
    const jan = janelaFechamentos(lista, dias);
    const investidoTotal = (execucoes ?? []).reduce(
      (s, e) => s + Number(e.investimento_executado ?? 0),
      0,
    );
    const clientesTotal = (execucoes ?? []).reduce(
      (s, e) => s + Number(e.ganhos ?? 0),
      0,
    );
    const mrrTotal = (kpis ?? []).reduce(
      (s, k) => s + Number(k.mrr_ganho ?? 0),
      0,
    );
    const cac = clientesTotal > 0 ? investidoTotal / clientesTotal : null;
    const payback = paybackMeses(investidoTotal, mrrTotal);
    const mom =
      jan.anterior.mrr > 0
        ? (jan.atual.mrr - jan.anterior.mrr) / jan.anterior.mrr
        : null;

    // Origem dos clientes fechados no período (objetivo 1).
    const ini = diasAtras(dias - 1);
    const nomePorId = new Map((canais ?? []).map((c) => [c.id, c.nome]));
    const origemMap = new Map<string, { nome: string; n: number; mrr: number }>();
    lista
      .filter(
        (o) => o.estagio === "fechado_ganho" && o.data_entrada_estagio >= ini,
      )
      .forEach((o) => {
        const nome = nomePorId.get(o.canal_id) ?? "—";
        const cur = origemMap.get(o.canal_id) ?? { nome, n: 0, mrr: 0 };
        cur.n += 1;
        cur.mrr += o.valor_mrr;
        origemMap.set(o.canal_id, cur);
      });
    const origem = [...origemMap.values()].sort((a, b) => b.mrr - a.mrr);

    // MRR realizado no mês calendário atual (para a Meta do mês)
    const iniMes = competencia();
    const mrrMesAtual = lista
      .filter(
        (o) =>
          o.estagio === "fechado_ganho" && o.data_entrada_estagio >= iniMes,
      )
      .reduce((s, o) => s + o.valor_mrr, 0);

    return { metr, jan, cac, payback, mom, origem, mrrMesAtual };
  }, [ops, execucoes, kpis, canais, dias]);

  const { metr, jan, cac, payback, mom, origem, mrrMesAtual } = dados;
  const periodoLabel = PERIODOS.find((p) => p.dias === dias)?.label ?? "Mês";
  const metaMes = (metas ?? []).find(
    (m) => m.competencia.slice(0, 7) === competencia().slice(0, 7),
  );
  const metaMrr = Number(metaMes?.meta_mrr ?? 0);
  const pctMeta = metaMrr > 0 ? mrrMesAtual / metaMrr : null;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-fin-dark">
            Visão executiva
          </h2>
          <p className="text-xs text-muted-foreground">
            Receita primeiro. De onde vieram os clientes e onde está o retorno.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              type="button"
              onClick={() => setDias(p.dias)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <Stat label={`MRR novo (${periodoLabel.toLowerCase()})`} valor={brl(jan.atual.mrr)}>
          <Delta
            {...delta(jan.atual.mrr - jan.anterior.mrr, (n) => brl(n))}
          />
        </Stat>
        <Stat label={`Clientes (${periodoLabel.toLowerCase()})`} valor={jan.atual.clientes}>
          <Delta
            {...delta(jan.atual.clientes - jan.anterior.clientes, (n) =>
              String(Math.round(n)),
            )}
          />
        </Stat>
        <Stat
          label="Pipeline ponderado"
          valor={brl(metr.pipelinePonderado)}
          hint="aberto × probabilidade"
        />
        <Stat
          label="CAC médio"
          valor={cac != null ? brl(cac) : "—"}
          hint="investido / clientes"
        />
        <Stat
          label="Payback médio"
          valor={payback != null ? `${payback.toFixed(1)} m` : "—"}
          hint="meses p/ pagar o CAC"
        />
        <Stat label="Crescimento MRR" valor={mom != null ? pct(mom, 0) : "—"}>
          {mom != null ? (
            <Delta {...delta(mom, (n) => pct(n, 0))} />
          ) : (
            <span className="mt-1 block text-[11px] text-muted-foreground">
              vs período anterior
            </span>
          )}
        </Stat>
        <Stat
          label="Meta do mês"
          valor={metaMrr > 0 ? pct(pctMeta, 0) : "—"}
          hint={
            metaMrr > 0
              ? `${brl(mrrMesAtual)} de ${brl(metaMrr)}`
              : "defina em Roadmap › Metas"
          }
        >
          {metaMrr > 0 && (
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-fin"
                style={{
                  width: `${Math.min(100, Math.round((pctMeta ?? 0) * 100))}%`,
                }}
              />
            </div>
          )}
        </Stat>
      </div>

      {/* Origem dos clientes do período (objetivo 1) */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          De onde vieram os clientes ({periodoLabel.toLowerCase()})
        </p>
        {origem.length ? (
          <div className="flex flex-wrap gap-2">
            {origem.map((o) => (
              <span
                key={o.nome}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-xs"
              >
                <span className="font-medium text-fin-dark">{o.nome}</span>
                <span className="text-muted-foreground">
                  {o.n} · {brl(o.mrr)}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nenhum cliente fechado nesse período.
          </p>
        )}
      </div>
    </section>
  );
}
