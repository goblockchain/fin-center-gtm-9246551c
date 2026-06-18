import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/format";
import { ESTAGIOS, ESTAGIO_META } from "./estagios";
import { useOportunidades, useMoverEstagio, type OportunidadeCard } from "./api";
import type { EstagioOport } from "@/types/db";

function CardView({ o, dragging }: { o: OportunidadeCard; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-3 shadow-sm",
        dragging && "shadow-lg ring-2 ring-fin",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight text-fin-dark">
          {o.conta?.nome ?? "—"}
        </p>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      {o.conta?.bairro && (
        <p className="mt-0.5 text-xs text-muted-foreground">{o.conta.bairro}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="truncate text-xs text-muted-foreground">
          {o.canal?.nome ?? "—"}
        </span>
        <span className="shrink-0 text-xs font-semibold text-fin">
          {brl(o.valor_mrr)}
        </span>
      </div>
    </div>
  );
}

function DraggableCard({ o }: { o: OportunidadeCard }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: o.id,
    data: { o },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <CardView o={o} />
    </div>
  );
}

function Coluna({
  estagio,
  oports,
}: {
  estagio: EstagioOport;
  oports: OportunidadeCard[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estagio });
  const meta = ESTAGIO_META[estagio];
  const total = oports.reduce((s, o) => s + Number(o.valor_mrr ?? 0), 0);
  return (
    <div className="flex w-64 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
          <span className="text-sm font-semibold text-fin-dark">
            {meta.label}
          </span>
          <span className="text-xs text-muted-foreground">{oports.length}</span>
        </div>
        <span className="text-xs text-muted-foreground">{brl(total)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-24 flex-1 space-y-2 rounded-lg border border-dashed border-transparent bg-secondary/40 p-2 transition-colors",
          isOver && "border-fin bg-accent/30",
        )}
      >
        {oports.map((o) => (
          <DraggableCard key={o.id} o={o} />
        ))}
      </div>
    </div>
  );
}

export function PipelineBoard({ canalId }: { canalId: string | "all" }) {
  const { data: oports, isLoading } = useOportunidades(canalId);
  const mover = useMoverEstagio();
  const [active, setActive] = useState<OportunidadeCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 6 },
    }),
  );

  const porEstagio = useMemo(() => {
    const m: Record<string, OportunidadeCard[]> = {};
    for (const e of ESTAGIOS) m[e] = [];
    (oports ?? []).forEach((o) => m[o.estagio]?.push(o));
    return m;
  }, [oports]);

  function onDragStart(e: DragStartEvent) {
    setActive((e.active.data.current?.o as OportunidadeCard) ?? null);
  }
  function onDragEnd(e: DragEndEvent) {
    setActive(null);
    const overId = e.over?.id as EstagioOport | undefined;
    const o = e.active.data.current?.o as OportunidadeCard | undefined;
    if (overId && o && o.estagio !== overId) {
      mover.mutate({ id: o.id, estagio: overId });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando pipeline…
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ESTAGIOS.map((e) => (
          <Coluna key={e} estagio={e} oports={porEstagio[e]} />
        ))}
      </div>
      <DragOverlay>{active ? <CardView o={active} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
