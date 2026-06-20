import { useMemo, useState } from "react";
import { Loader2, Lock, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prazoHumano, urgencia, URGENCIA_TEXT, dataCurta } from "@/lib/datas";
import {
  useTarefas,
  useAtualizarStatusTarefa,
  type TarefaComCanal,
} from "@/features/tarefas/api";
import { TarefaFormDialog } from "@/features/tarefas/TarefaFormDialog";
import type { StatusTarefa } from "@/types/db";

const STATUS_OPC: { v: StatusTarefa; label: string }[] = [
  { v: "a_fazer", label: "A fazer" },
  { v: "fazendo", label: "Fazendo" },
  { v: "feito", label: "Feito" },
];
const STATUS_LABEL: Record<StatusTarefa, string> = {
  a_fazer: "A fazer",
  fazendo: "Fazendo",
  feito: "Feito",
};

/** Ícone de status estilo Linear (círculo vazio / meio-preenchido / concluído). */
function StatusIcon({
  status,
  className,
}: {
  status: StatusTarefa;
  className?: string;
}) {
  if (status === "feito") {
    return (
      <svg viewBox="0 0 16 16" className={cn("h-4 w-4", className)}>
        <circle cx="8" cy="8" r="7" className="fill-fin" />
        <path
          d="M4.8 8.4l2 2 4.2-4.2"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "fazendo") {
    return (
      <svg viewBox="0 0 16 16" className={cn("h-4 w-4", className)}>
        <circle cx="8" cy="8" r="7" fill="none" stroke="#D9920A" strokeWidth="1.6" />
        <path d="M8 8 L8 1.6 A6.4 6.4 0 0 1 8 14.4 Z" fill="#D9920A" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={cn("h-4 w-4", className)}>
      <circle cx="8" cy="8" r="7" fill="none" stroke="#94a3b8" strokeWidth="1.6" />
    </svg>
  );
}

/** Controle de status: ícone que abre um menu (estilo Linear). */
function StatusControl({
  status,
  bloqueada,
  onChange,
}: {
  status: StatusTarefa;
  bloqueada: boolean;
  onChange: (s: StatusTarefa) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Status: ${STATUS_LABEL[status]}`}
        className="grid h-7 w-7 place-items-center rounded-md hover:bg-secondary"
      >
        <StatusIcon status={status} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-1 w-40 rounded-md border border-border bg-card py-1 shadow-md">
            {STATUS_OPC.map((o) => {
              const disabled = o.v === "feito" && bloqueada;
              const ativo = o.v === status;
              return (
                <button
                  key={o.v}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled && !ativo) onChange(o.v);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-2.5 py-1.5 text-sm hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40",
                    ativo && "font-medium text-fin-dark",
                  )}
                >
                  <StatusIcon status={o.v} />
                  {o.label}
                  {disabled && <Lock className="ml-auto h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TarefaRow({
  t,
  bloqueada,
  bloqueioCodigo,
  onStatus,
  onEdit,
}: {
  t: TarefaComCanal;
  bloqueada: boolean;
  bloqueioCodigo?: string;
  onStatus: (s: StatusTarefa) => void;
  onEdit: () => void;
}) {
  const u = urgencia(t.prazo);
  const feito = t.status === "feito";
  return (
    <div
      onClick={onEdit}
      className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/40"
    >
      <div className="pt-0.5">
        <StatusControl status={t.status} bloqueada={bloqueada} onChange={onStatus} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="shrink-0 text-[11px]">
            {t.codigo}
          </Badge>
          <p
            className={cn(
              "truncate text-sm font-medium",
              feito ? "text-muted-foreground line-through" : "text-fin-dark",
            )}
          >
            {t.titulo}
          </p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-muted-foreground">{STATUS_LABEL[t.status]}</span>
          {t.responsavel && (
            <span className="text-muted-foreground">{t.responsavel}</span>
          )}
          {!feito && t.prazo && (
            <span className={cn("font-medium", URGENCIA_TEXT[u])}>
              {prazoHumano(t.prazo)}{" "}
              <span className="font-normal text-muted-foreground">
                · {dataCurta(t.prazo)}
              </span>
            </span>
          )}
          {bloqueada && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" /> bloqueada por {bloqueioCodigo}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TarefasPage() {
  const { data: tarefas, isLoading } = useTarefas();
  const mutar = useAtualizarStatusTarefa();
  const [editando, setEditando] = useState<TarefaComCanal | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { grupos, statusById, codigoById, feitas } = useMemo(() => {
    const statusById = new Map((tarefas ?? []).map((t) => [t.id, t.status]));
    const codigoById = new Map((tarefas ?? []).map((t) => [t.id, t.codigo]));
    const grupos = new Map<string, TarefaComCanal[]>();
    for (const t of tarefas ?? []) {
      const k = t.frente;
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k)!.push(t);
    }
    const feitas = (tarefas ?? []).filter((t) => t.status === "feito").length;
    return { grupos, statusById, codigoById, feitas };
  }, [tarefas]);

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description="Tarefas da sprint, agrupadas por frente. Clique na tarefa para editar e no status para mudar. A tarefa fica travada até a tarefa de que ela depende ficar pronta."
        actions={
          <div className="flex items-center gap-2">
            {tarefas?.length ? (
              <Badge variant="secondary">
                {feitas}/{tarefas.length} feitas
              </Badge>
            ) : null}
            <Button
              size="sm"
              onClick={() => {
                setEditando(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Nova tarefa
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando tarefas…
        </div>
      ) : (
        <div className="space-y-5">
          {[...grupos.entries()].map(([frente, lista]) => (
            <div key={frente}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fin-dark">
                {frente}
              </h2>
              <Card className="divide-y divide-border">
                {lista.map((t) => {
                  const bloqueada =
                    t.depende_de != null &&
                    statusById.get(t.depende_de) !== "feito";
                  return (
                    <TarefaRow
                      key={t.id}
                      t={t}
                      bloqueada={bloqueada}
                      bloqueioCodigo={
                        t.depende_de ? codigoById.get(t.depende_de) : undefined
                      }
                      onStatus={(s) => mutar.mutate({ id: t.id, status: s })}
                      onEdit={() => {
                        setEditando(t);
                        setFormOpen(true);
                      }}
                    />
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}

      <TarefaFormDialog
        tarefa={editando}
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditando(null);
        }}
      />
    </div>
  );
}
