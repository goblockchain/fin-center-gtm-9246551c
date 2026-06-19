import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dataCurta } from "@/lib/datas";
import { useTarefas } from "@/features/tarefas/api";
import { useGates } from "./api";
import { calcularTimeline } from "./timeline";

const COR_FRENTE: Record<string, string> = {
  Setup: "bg-muted-foreground/70",
  Yungas: "bg-fin",
  "Member-get-member": "bg-emerald-500",
  Indicações: "bg-teal-500",
  Outbound: "bg-amber-500",
  Inbound: "bg-sky-500",
  Gates: "bg-fin-dark",
};

const LABEL = "7rem";

export function Gantt() {
  const { data: tarefas } = useTarefas();
  const { data: gates } = useGates();

  const { frentes, tl } = useMemo(() => {
    const datas: (string | null)[] = [];
    const m = new Map<string, { inicio: string; prazo: string }>();
    for (const t of tarefas ?? []) {
      if (t.data_inicio) datas.push(t.data_inicio);
      if (t.prazo) datas.push(t.prazo);
      if (!t.data_inicio || !t.prazo) continue;
      const cur = m.get(t.frente);
      if (!cur) m.set(t.frente, { inicio: t.data_inicio, prazo: t.prazo });
      else
        m.set(t.frente, {
          inicio: t.data_inicio < cur.inicio ? t.data_inicio : cur.inicio,
          prazo: t.prazo > cur.prazo ? t.prazo : cur.prazo,
        });
    }
    (gates ?? []).forEach((g) => datas.push(g.data));
    return { frentes: [...m.entries()], tl: calcularTimeline(datas) };
  }, [tarefas, gates]);

  const hojeIso = new Date().toISOString().slice(0, 10);
  const larguraMin = Math.max(560, tl.semanas * 64 + 112);

  return (
    <Card className="overflow-x-auto p-4">
      <div className="relative" style={{ minWidth: larguraMin }}>
        {/* Cabeçalho de semanas (dinâmico) */}
        <div className="grid" style={{ gridTemplateColumns: `${LABEL} 1fr` }}>
          <div />
          <div
            className="grid border-b border-border pb-1"
            style={{ gridTemplateColumns: `repeat(${tl.semanas}, minmax(0,1fr))` }}
          >
            {Array.from({ length: tl.semanas }, (_, i) => (
              <div
                key={i}
                className="border-l border-border/60 pl-1 text-[10px] text-muted-foreground"
              >
                S{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Linhas por frente */}
        <div className="relative">
          {frentes.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sem tarefas com datas ainda. Crie tarefas e a linha do tempo se
              molda a elas.
            </p>
          )}
          {frentes.map(([frente, span]) => {
            const left = tl.pos(span.inicio) ?? 0;
            const right = tl.pos(span.prazo) ?? 0;
            const width = Math.max(1.5, right - left);
            return (
              <div
                key={frente}
                className="grid h-9 items-center"
                style={{ gridTemplateColumns: `${LABEL} 1fr` }}
              >
                <div className="truncate pr-2 text-xs font-medium text-fin-dark">
                  {frente}
                </div>
                <div className="relative h-6">
                  <div
                    className={cn(
                      "absolute top-0 flex h-6 items-center rounded px-2",
                      COR_FRENTE[frente] ?? "bg-fin",
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${dataCurta(span.inicio)} → ${dataCurta(span.prazo)}`}
                  >
                    <span className="truncate text-[10px] font-medium text-white">
                      {dataCurta(span.inicio)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Overlay: gates + hoje sobre a faixa de tempo */}
          {frentes.length > 0 && (
            <div
              className="pointer-events-none absolute inset-y-0"
              style={{ left: LABEL, right: 0 }}
            >
              {(gates ?? []).map((g) => {
                const p = tl.pos(g.data);
                if (p == null) return null;
                return (
                  <div key={g.id} className="absolute inset-y-0" style={{ left: `${p}%` }}>
                    <div className="h-full w-px border-l border-dashed border-warning" />
                    <span className="absolute -top-0.5 left-1 whitespace-nowrap text-[10px] font-medium text-warning">
                      {g.nome.split("—")[0].trim()}
                    </span>
                  </div>
                );
              })}
              {tl.dentro(hojeIso) && (
                <div className="absolute inset-y-0" style={{ left: `${tl.pos(hojeIso)}%` }}>
                  <div className="h-full w-0.5 bg-fin" />
                  <span className="absolute -bottom-0.5 left-1 text-[10px] font-semibold text-fin">
                    hoje
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
