import { useMemo, useState } from "react";
import {
  Flame,
  TrendingUp,
  Target,
  Wallet,
  Users2,
  Building2,
  Trophy,
  DollarSign,
  FileDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { useContas } from "@/features/crm/api";
import {
  useCanais,
  useCanalKpis,
  useCanalExecucao,
  canalNomePorId,
} from "@/features/canais/api";
import { brl } from "@/lib/format";
import { EvolucaoSemanal } from "@/features/dashboard/EvolucaoSemanal";
import type { Temperatura } from "@/types/db";

/* Ticket médio default (R$ 4.800 por cliente). Editável para simular cenários. */
const TICKET_DEFAULT = 4800;

const TEMP_LABEL: Record<Temperatura, string> = {
  sem_contato: "Sem contato",
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

export function ExecutivoPage() {
  const { data: contas = [] } = useContas({
    temperatura: "all",
    canalId: "all",
    busca: "",
  });
  const { data: kpis = [] } = useCanalKpis();
  const { data: execucao = [] } = useCanalExecucao();
  const { data: canais = [] } = useCanais();
  const nomeCanal = useMemo(() => canalNomePorId(canais), [canais]);

  const [ticket, setTicket] = useState(TICKET_DEFAULT);

  const m = useMemo(() => {
    const quentes = contas.filter((c) => c.temperatura === "quente");
    const mornos = contas.filter((c) => c.temperatura === "morno");
    const frios = contas.filter((c) => c.temperatura === "frio");
    const semContato = contas.filter((c) => c.temperatura === "sem_contato");
    const contatadas = contas.filter((c) => c.temperatura !== "sem_contato");

    // Dados reais das views calculadas do Supabase.
    const totalInvestExec = execucao.reduce(
      (a, e) => a + Number(e.investimento_executado ?? 0),
      0,
    );
    const totalFechados = kpis.reduce((a, k) => a + Number(k.ganhos ?? 0), 0);
    const totalMrr = kpis.reduce((a, k) => a + Number(k.mrr_ganho ?? 0), 0);
    const totalReunioes = kpis.reduce((a, k) => a + Number(k.reunioes ?? 0), 0);
    const cac = totalFechados > 0 ? totalInvestExec / totalFechados : null;

    const ativos = contas.length;
    const receitaMax = ativos * ticket;
    // Projeção esperada ponderada por temperatura.
    const receitaEsperada =
      quentes.length * ticket * 0.7 +
      mornos.length * ticket * 0.35 +
      frios.length * ticket * 0.1 +
      semContato.length * ticket * 0.03;

    return {
      totalPipeline: ativos,
      contatadas: contatadas.length,
      fechados: totalFechados,
      mrrGanho: totalMrr,
      quentes,
      mornos: mornos.length,
      frios: frios.length,
      reunioes: totalReunioes,
      cac,
      receitaMax,
      receitaEsperada,
    };
  }, [contas, kpis, execucao, ticket]);

  const cenarios = [
    { label: "100%", pct: 1, tone: "primary" as const, sub: "todo o pipeline convertido" },
    { label: "50%", pct: 0.5, tone: "accent" as const, sub: "cenário realista alto" },
    { label: "25%", pct: 0.25, tone: "warn" as const, sub: "benchmark de mercado" },
    { label: "10%", pct: 0.1, tone: "muted" as const, sub: "cenário conservador" },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader
        title="Visão executiva"
        description="Uma leitura de 5 minutos: quanto tem no funil, quanto já fechou, quais são os leads quentes e quanto de receita esse pipeline pode gerar."
        actions={
          <div className="flex items-end gap-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Ticket médio
              </Label>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">R$</span>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={ticket}
                  onChange={(e) =>
                    setTicket(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="h-9 w-28 tabular-nums"
                />
                <span className="text-xs text-muted-foreground">/ cliente</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-fin-dark transition-colors hover:bg-secondary print:hidden"
            >
              <FileDown className="h-4 w-4" /> Exportar PDF
            </button>
          </div>
        }
      />

      {/* Linha 1: números-chave */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStat
          icon={Building2}
          label="No pipeline"
          value={m.totalPipeline}
          hint={`${m.contatadas} já contatadas`}
        />
        <BigStat
          icon={Trophy}
          label="Fechados"
          value={m.fechados}
          hint={brl(m.mrrGanho) + " em MRR ganho"}
          tone="ok"
        />
        <BigStat
          icon={Flame}
          label="Leads quentes"
          value={m.quentes.length}
          hint={`${m.mornos} mornos · ${m.frios} frios`}
          tone="hot"
        />
        <BigStat
          icon={DollarSign}
          label="Potencial do funil"
          value={brl(m.receitaMax)}
          hint={`${m.totalPipeline} contas × ${brl(ticket)}`}
          isMoney
        />
      </div>

      {/* Evolução semana a semana — foco do relatório para o investidor.
          Alimentada pelos snapshots (captura automática sexta 18h + manual). */}
      <EvolucaoSemanal />

      {/* Projeção de receita */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-fin" />
              <h2 className="text-base font-semibold text-fin-dark">
                Projeção de receita
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Se convertermos {m.totalPipeline} contas do pipeline a{" "}
              <span className="font-medium text-foreground">{brl(ticket)}</span>{" "}
              cada.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Cenário esperado
            </p>
            <p className="text-lg font-semibold tabular-nums text-fin">
              {brl(m.receitaEsperada)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              ponderado por temperatura
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cenarios.map((c) => (
            <CenarioCard
              key={c.label}
              label={c.label}
              sub={c.sub}
              tone={c.tone}
              value={m.receitaMax * c.pct}
              contas={Math.round(m.totalPipeline * c.pct)}
            />
          ))}
        </div>
      </section>

      {/* Linha: quentes + saúde */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quentes */}
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-danger" />
              <h2 className="text-base font-semibold text-fin-dark">
                Leads mais quentes
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {m.quentes.length} contas
            </span>
          </div>
          {m.quentes.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum lead marcado como quente ainda. Priorize identificar
                decisores e agendar reuniões.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {m.quentes.slice(0, 8).map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.nome}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.bairro ? `${c.bairro} · ` : ""}
                      {nomeCanal.get(c.canal_origem_id) ?? "Canal"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">
                    <Flame className="h-3 w-3" /> {TEMP_LABEL[c.temperatura]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Saúde: CAC + reuniões + payback */}
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-fin" />
              <h2 className="text-base font-semibold text-fin-dark">
                Saúde do funil
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Eficiência do que já foi investido.
            </p>
          </div>
          <MiniStat
            icon={Wallet}
            label="CAC atual"
            value={m.cac === null ? "—" : brl(m.cac)}
            hint={
              m.cac === null
                ? "sem fechamentos ainda"
                : "investimento executado / fechamentos"
            }
          />
          <MiniStat
            icon={Users2}
            label="Reuniões realizadas"
            value={m.reunioes}
            hint="oportunidades que chegaram a reunião"
          />
          <MiniStat
            icon={Trophy}
            label="Payback estimado"
            value={
              m.cac === null
                ? "—"
                : `${(m.cac / Math.max(ticket, 1)).toFixed(2)}× ticket`
            }
            hint="quanto do ticket paga o custo de aquisição"
          />
        </section>
      </div>
    </div>
  );
}

/* -------------------- componentes -------------------- */

function BigStat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  isMoney,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "ok" | "hot";
  isMoney?: boolean;
}) {
  const accent =
    tone === "ok" ? "text-fin" : tone === "hot" ? "text-danger" : "text-fin-dark";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p
        className={`mt-3 font-semibold tabular-nums ${accent} ${
          isMoney ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CenarioCard({
  label,
  sub,
  value,
  contas,
  tone,
}: {
  label: string;
  sub: string;
  value: number;
  contas: number;
  tone: "primary" | "accent" | "warn" | "muted";
}) {
  const map = {
    primary: "border-primary/40 bg-primary/5",
    accent: "border-accent/40 bg-accent/10",
    warn: "border-warning/40 bg-warning/10",
    muted: "border-border bg-muted/40",
  } as const;
  const valueColor = {
    primary: "text-fin",
    accent: "text-foreground",
    warn: "text-foreground",
    muted: "text-muted-foreground",
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${map[tone]}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold tabular-nums text-foreground">
          {label}
        </span>
        <span className="text-[11px] text-muted-foreground">de conversão</span>
      </div>
      <p className={`mt-2 text-xl font-semibold tabular-nums sm:text-2xl ${valueColor[tone]}`}>
        {brl(value)}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        ≈ {contas} cliente{contas === 1 ? "" : "s"} · {sub}
      </p>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-muted p-2">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {value}
        </p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
