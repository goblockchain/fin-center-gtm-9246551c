import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dataCurta, urgencia, hojeISO, DIA } from "@/lib/datas";
import type { Projeto } from "@/types/db";
import { useProjetos } from "./projetos";
import { useGates } from "./api";
import { calcularTimeline } from "./timeline";

const LABEL = "9rem";

/** Cor da barra: cor própria (override) > feito > regra de prazo §10.5 (vermelho
 *  vencido, âmbar ≤2 dias — via `urgencia`, em hora local) > status. */
function corProjeto(p: Projeto): { bar?: string; texto: string; corHex?: string } {
  if (p.cor) return { texto: "text-white", corHex: p.cor };
  if (p.status === "feito") return { bar: "bg-fin-dark", texto: "text-white" };
  const u = urgencia(p.prazo);
  if (u === "vencido") return { bar: "bg-destructive", texto: "text-white" };
  if (u === "perto") return { bar: "bg-warning", texto: "text-white" };
  if (p.status === "fazendo") return { bar: "bg-fin", texto: "text-white" };
  return { bar: "bg-fin-light", texto: "text-fin-dark" };
}

const LEGENDA: { cls: string; label: string }[] = [
  { cls: "bg-fin-light", label: "a fazer" },
  { cls: "bg-fin", label: "fazendo" },
  { cls: "bg-fin-dark", label: "feito" },
  { cls: "bg-warning", label: "perto do prazo" },
  { cls: "bg-destructive", label: "atrasado" },
];

export function Gantt() {
  const { data: projetos } = useProjetos();
  const { data: gates } = useGates();
  const hojeIso = hojeISO();

  const tl = useMemo(() => {
    const datas: (string | null)[] = [];
    (projetos ?? []).forEach((p) => {
      datas.push(p.data_inicio, p.prazo);
    });
    (gates ?? []).forEach((g) => datas.push(g.data));
    return calcularTimeline(datas);
  }, [projetos, gates]);

  const lista = projetos ?? [];
  const span = tl.fimMs - tl.inicioMs;
  const larguraMin = Math.max(560, tl.semanas * 64 + 144);

  return (
    <Card className="overflow-x-auto p-4">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {LEGENDA.map((l) => (
          <span
            key={l.label}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
          >
            <span className={cn("h-2.5 w-2.5 rounded-sm", l.cls)} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="relative" style={{ minWidth: larguraMin }}>
        {/* Cabeçalho de semanas — posicionado por % p/ casar com as barras */}
        <div className="grid" style={{ gridTemplateColumns: `${LABEL} 1fr` }}>
          <div />
          <div className="relative h-4 border-b border-border">
            {Array.from({ length: tl.semanas }, (_, i) => {
              const left = ((i * 7 * DIA) / span) * 100;
              if (left > 100) return null;
              return (
                <div
                  key={i}
                  className="absolute top-0 border-l border-border/60 pl-1 text-[10px] text-muted-foreground"
                  style={{ left: `${left}%` }}
                >
                  S{i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Uma barra por projeto */}
        <div className="relative">
          {lista.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum projeto cadastrado. Adicione projetos abaixo e a linha do
              tempo se molda aos prazos deles.
            </p>
          )}
          {lista.map((p) => {
            const left = tl.pos(p.data_inicio) ?? 0;
            const right = tl.pos(p.prazo) ?? 0;
            const width = Math.max(1.5, right - left);
            const cor = corProjeto(p);
            return (
              <div
                key={p.id}
                className="grid h-9 items-center"
                style={{ gridTemplateColumns: `${LABEL} 1fr` }}
              >
                <div className="truncate pr-2 text-xs font-medium text-fin-dark">
                  {p.nome}
                </div>
                <div className="relative h-6">
                  <div
                    className={cn(
                      "absolute top-0 flex h-6 items-center rounded px-2",
                      cor.bar,
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      ...(cor.corHex ? { backgroundColor: cor.corHex } : {}),
                    }}
                    title={`${p.nome}: ${dataCurta(p.data_inicio)} → ${dataCurta(p.prazo)}`}
                  >
                    <span className={cn("truncate text-[10px] font-medium", cor.texto)}>
                      {dataCurta(p.data_inicio)} → {dataCurta(p.prazo)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Overlay: gates (decisão) + hoje sobre a faixa de tempo */}
          {lista.length > 0 && (
            <div
              className="pointer-events-none absolute inset-y-0"
              style={{ left: LABEL, right: 0 }}
            >
              {(gates ?? []).map((g) => {
                const pp = tl.pos(g.data);
                if (pp == null) return null;
                return (
                  <div key={g.id} className="absolute inset-y-0" style={{ left: `${pp}%` }}>
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
