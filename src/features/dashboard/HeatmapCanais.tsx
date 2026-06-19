import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { brl, pct } from "@/lib/format";
import { useCanais, useCanalExecucao, useCanalKpis } from "@/features/canais/api";
import {
  useOportunidadesReceita,
  linhasPorCanal,
  type LinhaCanal,
} from "./receita";

type Cls = "bom" | "atencao" | "critico" | "neutro";

const CLS_BG: Record<Cls, string> = {
  bom: "bg-fin/15 text-fin-dark",
  atencao: "bg-amber-100 text-amber-800",
  critico: "bg-destructive/10 text-destructive",
  neutro: "bg-secondary/50 text-muted-foreground",
};

// Quanto maior, melhor (relativo ao melhor canal da coluna).
function clsAlto(v: number, max: number): Cls {
  if (v <= 0) return "critico";
  if (max > 0 && v >= 0.6 * max) return "bom";
  return "atencao";
}
function clsRoi(v: number | null): Cls {
  if (v == null) return "neutro";
  if (v > 0) return "bom";
  if (v >= -0.5) return "atencao";
  return "critico";
}
function clsCac(v: number | null, valores: number[]): Cls {
  if (v == null) return "neutro";
  if (!valores.length) return "neutro";
  const min = Math.min(...valores);
  if (v <= 1.2 * min) return "bom";
  if (v <= 2 * min) return "atencao";
  return "critico";
}

const COLS: { key: string; label: string }[] = [
  { key: "sql", label: "SQL" },
  { key: "clientes", label: "Clientes" },
  { key: "mrr", label: "MRR" },
  { key: "cac", label: "CAC" },
  { key: "roi", label: "ROI" },
];

export function HeatmapCanais() {
  const { data: ops } = useOportunidadesReceita();
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const { data: canais } = useCanais();

  const { linhas, maxSql, maxClientes, maxMrr, cacs } = useMemo(() => {
    const linhas = linhasPorCanal(
      ops ?? [],
      execucoes ?? [],
      kpis ?? [],
      canais ?? [],
    ).sort((a, b) => b.mrr - a.mrr);
    return {
      linhas,
      maxSql: Math.max(0, ...linhas.map((l) => l.sql)),
      maxClientes: Math.max(0, ...linhas.map((l) => l.clientes)),
      maxMrr: Math.max(0, ...linhas.map((l) => l.mrr)),
      cacs: linhas.map((l) => l.cac).filter((c): c is number => c != null),
    };
  }, [ops, execucoes, kpis, canais]);

  function celula(l: LinhaCanal, key: string): { cls: Cls; txt: string } {
    switch (key) {
      case "sql":
        return { cls: clsAlto(l.sql, maxSql), txt: String(l.sql) };
      case "clientes":
        return {
          cls: clsAlto(l.clientes, maxClientes),
          txt: String(l.clientes),
        };
      case "mrr":
        return { cls: clsAlto(l.mrr, maxMrr), txt: l.mrr > 0 ? brl(l.mrr) : "0" };
      case "cac":
        return {
          cls: clsCac(l.cac, cacs),
          txt: l.cac != null ? brl(l.cac) : "—",
        };
      case "roi":
        return { cls: clsRoi(l.roi), txt: l.roi != null ? pct(l.roi, 0) : "—" };
      default:
        return { cls: "neutro", txt: "—" };
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-fin-dark">
            Heatmap de performance
          </h2>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-fin/40" /> bom
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" /> atenção
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-destructive/40" />{" "}
              crítico
            </span>
          </span>
        </div>
        <div className="overflow-x-auto p-3">
          <table className="w-full border-separate border-spacing-1 text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-1 text-left font-medium">Canal</th>
                {COLS.map((c) => (
                  <th key={c.key} className="px-2 py-1 text-center font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.canal_id}>
                  <td className="px-2 py-1 font-medium text-fin-dark">
                    {l.nome}
                  </td>
                  {COLS.map((c) => {
                    const { cls, txt } = celula(l, c.key);
                    return (
                      <td
                        key={c.key}
                        className={cn(
                          "rounded-md px-2 py-2 text-center text-xs font-medium",
                          CLS_BG[cls],
                        )}
                      >
                        {txt}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
