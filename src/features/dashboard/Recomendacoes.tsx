import { useMemo } from "react";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { brl, pct } from "@/lib/format";
import { useCanais, useCanalExecucao, useCanalKpis } from "@/features/canais/api";
import { useCanalEconomia } from "@/features/economia/api";
import {
  useOportunidadesReceita,
  linhasPorCanal,
  type LinhaCanal,
} from "./receita";

type Insight = { tipo: "positivo" | "alerta" | "info"; texto: string };

function gerar(linhas: LinhaCanal[]): Insight[] {
  const out: Insight[] = [];
  const totalMrr = linhas.reduce((s, l) => s + l.mrr, 0);
  const comMrr = linhas.filter((l) => l.mrr > 0);

  // Líder de MRR (+ destaque se for sem custo registrado)
  if (comMrr.length) {
    const lider = [...comMrr].sort((a, b) => b.mrr - a.mrr)[0];
    const share = totalMrr > 0 ? lider.mrr / totalMrr : 0;
    out.push({
      tipo: "positivo",
      texto:
        lider.investido === 0
          ? `${lider.nome} lidera o MRR (${brl(lider.mrr)}, ${pct(share, 0)} do total) e sem custo registrado — crescimento liderado por comunidade/indicação.`
          : `${lider.nome} lidera o MRR novo (${brl(lider.mrr)}, ${pct(share, 0)} do total).`,
    });
  }

  // Gargalo de volume: muitos leads, nenhuma reunião
  const gargalo = linhas
    .filter((l) => l.leads >= 20 && l.sql === 0)
    .sort((a, b) => b.leads - a.leads)[0];
  if (gargalo)
    out.push({
      tipo: "alerta",
      texto: `${gargalo.nome} tem ${gargalo.leads} leads mas 0 reuniões — o gargalo está no contato→reunião.`,
    });

  // Melhor taxa lead → reunião
  const comConv = linhas
    .filter((l) => l.leads > 0 && l.sql > 0)
    .map((l) => ({ nome: l.nome, taxa: l.sql / l.leads }));
  if (comConv.length) {
    const best = comConv.sort((a, b) => b.taxa - a.taxa)[0];
    out.push({
      tipo: "info",
      texto: `${best.nome} tem a melhor taxa lead→reunião (${pct(best.taxa, 1)}).`,
    });
  }

  // CAC acima da média (entre os que têm CAC)
  const comCac = linhas.filter((l) => l.cac != null) as (LinhaCanal & {
    cac: number;
  })[];
  if (comCac.length >= 2) {
    const media = comCac.reduce((s, l) => s + l.cac, 0) / comCac.length;
    const acima = comCac.filter((l) => l.cac > media);
    if (acima.length)
      out.push({
        tipo: "alerta",
        texto: `${acima.map((l) => l.nome).join(", ")} com CAC acima da média (${brl(media)}).`,
      });
  }

  // Investiram sem retorno ainda (ROI negativo)
  const roiNeg = linhas.filter((l) => l.roi != null && l.roi < 0);
  if (roiNeg.length)
    out.push({
      tipo: "alerta",
      texto: `${roiNeg.length} canal(is) investiram sem retorno ainda (ROI negativo): ${roiNeg
        .map((l) => l.nome)
        .join(", ")}.`,
    });

  return out.slice(0, 6);
}

const META: Record<
  Insight["tipo"],
  { Icon: typeof Lightbulb; cor: string }
> = {
  positivo: { Icon: TrendingUp, cor: "text-fin" },
  alerta: { Icon: AlertTriangle, cor: "text-warning" },
  info: { Icon: Lightbulb, cor: "text-sky-500" },
};

export function Recomendacoes() {
  const { data: ops } = useOportunidadesReceita();
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const { data: canais } = useCanais();
  const { data: economia } = useCanalEconomia();

  const insights = useMemo(
    () =>
      gerar(
        linhasPorCanal(
          ops ?? [],
          execucoes ?? [],
          kpis ?? [],
          canais ?? [],
          economia ?? [],
        ),
      ),
    [ops, execucoes, kpis, canais, economia],
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-fin" />
          <h2 className="text-sm font-semibold text-fin-dark">
            Recomendações automáticas
          </h2>
        </div>
        {insights.length ? (
          <ul className="space-y-2">
            {insights.map((ins, i) => {
              const { Icon, cor } = META[ins.tipo];
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", cor)} />
                  <span className="text-fin-dark">{ins.texto}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem dado suficiente para recomendar ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
