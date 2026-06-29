import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { Loader2, GripVertical, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/format";
import { ContaSheet } from "@/features/crm/ContaSheet";
import { ESTAGIOS, ESTAGIO_META } from "./estagios";
import { useOportunidades, useMoverEstagio, type OportunidadeCard } from "./api";
import type { EstagioOport } from "@/types/db";

function CardView({
  o,
  dragging,
  onOpen,
  handleProps,
}: {
  o: OportunidadeCard;
  dragging?: boolean;
  onOpen?: () => void;
  handleProps?: Record<string, unknown>;
}) {
  const decisor = o.conta?.contatos?.find((c) => c.papel === "decisor")?.nome;
  return (
    <div
      onClick={onOpen}
      className={cn(
        "rounded-md border border-border bg-card shadow-sm",
        onOpen && "cursor-pointer hover:border-fin",
        dragging && "shadow-lg ring-2 ring-fin",
      )}
    >
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <p className="min-w-0 flex-1 truncate text-sm font-medium leading-tight text-fin-dark">
          {o.conta?.nome ?? "—"}
        </p>
        <span
          {...handleProps}
          onClick={(e) => e.stopPropagation()}
          aria-label="Arrastar"
          className={cn(
            "shrink-0 text-muted-foreground",
            handleProps && "cursor-grab touch-none active:cursor-grabbing",
          )}
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </div>
      <div className="px-3 pb-3 pt-1.5">
        <div className="space-y-1">
          {o.conta?.telefone && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{o.conta.telefone}</span>
            </p>
          )}
          {decisor && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{decisor}</span>
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {o.canal?.nome ?? "—"}
          </span>
          <span className="shrink-0 text-xs font-semibold text-fin">
            {brl(o.valor_mrr)}
          </span>
        </div>
      </div>
    </div>
  );
}

function DraggableCard({
  o,
  onOpen,
}: {
  o: OportunidadeCard;
  onOpen: (o: OportunidadeCard) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: o.id,
    data: { o },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("touch-none cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <CardView o={o} onOpen={() => onOpen(o)} handleProps={{}} />
    </div>
  );
}

// Quantos cards renderizar por coluna antes do "ver mais". Cada card é um
// draggable do dnd-kit; centenas de uma vez deixam o board lento.
const LIMITE_COLUNA = 30;

function Coluna({
  estagio,
  oports,
  onOpen,
}: {
  estagio: EstagioOport;
  oports: OportunidadeCard[];
  onOpen: (o: OportunidadeCard) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estagio });
  const meta = ESTAGIO_META[estagio];
  const total = oports.reduce((s, o) => s + Number(o.valor_mrr ?? 0), 0);
  const [verTodos, setVerTodos] = useState(false);
  const visiveis = verTodos ? oports : oports.slice(0, LIMITE_COLUNA);
  const ocultos = oports.length - visiveis.length;
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
        {visiveis.map((o) => (
          <DraggableCard key={o.id} o={o} onOpen={onOpen} />
        ))}
        {ocultos > 0 && (
          <button
            type="button"
            onClick={() => setVerTodos(true)}
            className="w-full rounded-md border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-fin hover:text-fin-dark"
          >
            + ver mais {ocultos}
          </button>
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({ canalId }: { canalId: string | "all" }) {
  const { data: oports, isLoading } = useOportunidades(canalId);
  const mover = useMoverEstagio();
  const [active, setActive] = useState<OportunidadeCard | null>(null);
  const [aberta, setAberta] = useState<OportunidadeCard | null>(null);

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
    <>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="scroll-x-bar flex gap-3 overflow-x-auto pb-4">
          {ESTAGIOS.map((e) => (
            <Coluna
              key={e}
              estagio={e}
              oports={porEstagio[e]}
              onOpen={setAberta}
            />
          ))}
        </div>
        <DragOverlay>
          {active ? <CardView o={active} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <ContaSheet
        conta={aberta?.conta ?? null}
        canalNome={aberta?.canal?.nome}
        open={!!aberta}
        onOpenChange={(o) => !o && setAberta(null)}
      />
    </>
  );
}
