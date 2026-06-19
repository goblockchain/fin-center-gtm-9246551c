import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { pct } from "@/lib/format";
import { useCanalExecucao } from "@/features/canais/api";

const SEG = [
  { nome: "Sem contato", cor: "#94a3b8" },
  { nome: "Contatados", cor: "#38bdf8" },
  { nome: "Reuniões+", cor: "#f59e0b" },
  { nome: "Ganhos", cor: "#1A7A3A" },
];

export function FunilPorCanal() {
  const { data: execucoes } = useCanalExecucao();

  const linhas = useMemo(
    () =>
      (execucoes ?? []).map((e) => {
        const total = Number(e.total_oport ?? 0);
        const contatados = Number(e.contatados ?? 0);
        const reunioes = Number(e.reunioes_ou_mais ?? 0);
        const ganhos = Number(e.ganhos ?? 0);
        const segs = [
          Math.max(0, total - contatados), // sem contato ainda
          Math.max(0, contatados - reunioes), // contatados, sem reunião
          Math.max(0, reunioes - ganhos), // em reunião+
          ganhos, // fechados ganhos
        ];
        const taxa = contatados > 0 ? reunioes / contatados : null;
        return { id: e.canal_id, nome: e.nome, total, segs, taxa };
      }),
    [execucoes],
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-fin-dark">Funil por canal</h3>
          <div className="flex flex-wrap gap-2">
            {SEG.map((s) => (
              <span
                key={s.nome}
                className="flex items-center gap-1 text-[11px] text-muted-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.cor }}
                />
                {s.nome}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {linhas.map((l) => (
            <div key={l.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-fin-dark">{l.nome}</span>
                <span className="text-muted-foreground">
                  {l.total} leads
                  {l.taxa != null && (
                    <>
                      {" · "}contato→reunião{" "}
                      <strong className="text-fin-dark">{pct(l.taxa, 1)}</strong>
                    </>
                  )}
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
                {l.total > 0 &&
                  l.segs.map((n, i) =>
                    n > 0 ? (
                      <div
                        key={i}
                        style={{
                          width: `${(n / l.total) * 100}%`,
                          backgroundColor: SEG[i].cor,
                        }}
                        title={`${SEG[i].nome}: ${n}`}
                      />
                    ) : null,
                  )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
