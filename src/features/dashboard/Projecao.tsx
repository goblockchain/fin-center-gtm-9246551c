import { useMemo } from "react";
import { Telescope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { pct, brl } from "@/lib/format";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { diasAte, dataCurta } from "@/lib/datas";
import { useFunil, resumoFunil } from "./api";
import { useOportunidadesReceita } from "./receita";
import { useGates, SPRINT_FIM } from "@/features/roadmap/api";

export function Projecao() {
  const { data: funil } = useFunil("all");
  const { data: gates } = useGates();
  const { data: ops } = useOportunidadesReceita();
  const r = useMemo(() => resumoFunil(funil ?? []), [funil]);

  // Ticket médio: dos fechados (se houver), senão das oportunidades com valor,
  // senão o plano essencial (R$250) como referência.
  const ticket = useMemo(() => {
    const arr = ops ?? [];
    const ganhos = arr.filter((o) => o.estagio === "fechado_ganho");
    const base = ganhos.length ? ganhos : arr.filter((o) => o.valor_mrr > 0);
    if (!base.length) return 250;
    return base.reduce((s, o) => s + o.valor_mrr, 0) / base.length;
  }, [ops]);

  // Horizonte = último gate cadastrado (decisão final); sem gates, cai no padrão.
  const horizonte = useMemo(() => {
    const datas = (gates ?? []).map((g) => g.data).filter(Boolean);
    return datas.length ? datas.reduce((a, b) => (a > b ? a : b)) : SPRINT_FIM;
  }, [gates]);

  const usandoBaseline = r.taxaContatoReuniao <= 0;
  const taxa = usandoBaseline ? BASELINE_CONVERSAO : r.taxaContatoReuniao;
  const projReunioes = Math.round(r.ativos * taxa);
  const projBaseline = Math.round(r.ativos * BASELINE_CONVERSAO);

  // Reunião → fechamento: usa o histórico; sem dado, assume 1 em 4 (transparente).
  const taxaGanho = r.reunioes > 0 ? r.ganhos / r.reunioes : 0;
  const usandoGanhoPadrao = taxaGanho <= 0;
  const taxaGanhoUsada = usandoGanhoPadrao ? 0.25 : taxaGanho;
  const projGanhos = Math.round(projReunioes * taxaGanhoUsada);
  const projMRR = projGanhos * ticket;
  const semanas = Math.max(0, Math.ceil((diasAte(horizonte) ?? 0) / 7));

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <Telescope className="h-4 w-4 text-fin" />
          <h2 className="text-sm font-semibold text-fin-dark">
            Receita previsível
          </h2>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
            projeção, não fato
          </span>
        </div>

        <p className="text-sm text-fin-dark">
          Até {dataCurta(horizonte)} ({semanas} semanas):{" "}
          <strong className="text-fin">~{brl(projMRR)} de MRR novo</strong>{" "}
          <span className="text-muted-foreground">
            (~{brl(projMRR * 12)}/ano)
          </span>{" "}
          — ~{projGanhos} fechamentos e ~{projReunioes} reuniões.
        </p>
        <p className="text-xs text-muted-foreground">
          Cálculo: {r.ativos} oportunidades ativas × {pct(taxa, 1)} contato→reunião{" "}
          {usandoBaseline ? "(baseline 2%)" : "(sua conversão)"} ×{" "}
          {pct(taxaGanhoUsada, 0)} reunião→fechamento{" "}
          {usandoGanhoPadrao ? "(assumido)" : "(seu histórico)"} ×{" "}
          {brl(ticket)}/mês de ticket médio.
        </p>
        <p className="text-xs text-muted-foreground">
          Para comparar: na baseline de 2%, seriam ~{projBaseline} reuniões.
        </p>
      </CardContent>
    </Card>
  );
}
