import { useMemo, useState } from "react";
import { Loader2, Lock, Check, Pencil, Plus } from "lucide-react";
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
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
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

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar tarefa"
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-fin-dark"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          {STATUS_OPC.map((o) => {
            const ativo = t.status === o.v;
            const disabled = o.v === "feito" && bloqueada;
            return (
              <button
                key={o.v}
                type="button"
                disabled={disabled}
                onClick={() => !ativo && onStatus(o.v)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium transition-colors",
                  ativo
                    ? "bg-fin text-white"
                    : "bg-card text-muted-foreground hover:bg-secondary",
                  disabled && "cursor-not-allowed opacity-40 hover:bg-card",
                )}
              >
                {o.v === "feito" && ativo ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  o.label
                )}
              </button>
            );
          })}
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
        description="Execução da sprint por frente. Uma tarefa fica bloqueada enquanto a dependência não está feita."
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
                        t.depende_de
                          ? codigoById.get(t.depende_de)
                          : undefined
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
