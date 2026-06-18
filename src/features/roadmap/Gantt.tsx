import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dataCurta } from "@/lib/datas";
import { useTarefas } from "@/features/tarefas/api";
import { useGates, SPRINT_INICIO, SPRINT_FIM } from "./api";

const startMs = new Date(`${SPRINT_INICIO}T00:00:00`).getTime();
const endMs = new Date(`${SPRINT_FIM}T00:00:00`).getTime();
const span = endMs - startMs;
const posPct = (iso: string) =>
  Math.max(0, Math.min(100, ((new Date(`${iso}T00:00:00`).getTime() - startMs) / span) * 100));

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

  const frentes = useMemo(() => {
    const m = new Map<string, { inicio: string; prazo: string }>();
    for (const t of tarefas ?? []) {
      if (!t.data_inicio || !t.prazo) continue;
      const cur = m.get(t.frente);
      if (!cur) m.set(t.frente, { inicio: t.data_inicio, prazo: t.prazo });
      else
        m.set(t.frente, {
          inicio: t.data_inicio < cur.inicio ? t.data_inicio : cur.inicio,
          prazo: t.prazo > cur.prazo ? t.prazo : cur.prazo,
        });
    }
    return [...m.entries()];
  }, [tarefas]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojePct = Math.max(
    0,
    Math.min(100, ((hoje.getTime() - startMs) / span) * 100),
  );
  const dentroDaJanela = hoje.getTime() >= startMs && hoje.getTime() <= endMs;

  return (
    <Card className="overflow-hidden p-4">
      <div className="relative min-w-[560px]">
        {/* Cabeçalho de semanas */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `${LABEL} 1fr` }}
        >
          <div />
          <div className="grid grid-cols-10 border-b border-border pb-1">
            {Array.from({ length: 10 }, (_, i) => (
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
          {frentes.map(([frente, span2]) => {
            const left = posPct(span2.inicio);
            const width = Math.max(1.5, posPct(span2.prazo) - left);
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
                    title={`${dataCurta(span2.inicio)} → ${dataCurta(span2.prazo)}`}
                  >
                    <span className="truncate text-[10px] font-medium text-white">
                      {dataCurta(span2.inicio)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Overlay: gates + hoje, sobre a faixa de tempo */}
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: LABEL, right: 0 }}
          >
            {(gates ?? []).map((g) => (
              <div
                key={g.id}
                className="absolute inset-y-0"
                style={{ left: `${posPct(g.data)}%` }}
              >
                <div className="h-full w-px border-l border-dashed border-warning" />
                <span className="absolute -top-0.5 left-1 whitespace-nowrap text-[10px] font-medium text-warning">
                  {g.nome.split("—")[0].trim()}
                </span>
              </div>
            ))}
            {dentroDaJanela && (
              <div
                className="absolute inset-y-0"
                style={{ left: `${hojePct}%` }}
              >
                <div className="h-full w-0.5 bg-fin" />
                <span className="absolute -bottom-0.5 left-1 text-[10px] font-semibold text-fin">
                  hoje
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
