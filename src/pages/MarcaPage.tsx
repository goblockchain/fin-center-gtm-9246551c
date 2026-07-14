import { useEffect, useMemo, useState } from "react";
import { CalendarClock, GripVertical, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImportarIniciativasCsv } from "@/features/marca/ImportarIniciativasCsv";

type Status = "ideia" | "em_teste" | "validada" | "descartada";
type Categoria = "marca" | "comercial";

type Iniciativa = {
  id: string;
  titulo: string;
  categoria: Categoria;
  descricao: string;
  prazo: string; // ISO
  resultado: string;
  status: Status;
};

const COLUNAS: { id: Status; label: string }[] = [
  { id: "ideia", label: "Ideia" },
  { id: "em_teste", label: "Em teste" },
  { id: "validada", label: "Validada" },
  { id: "descartada", label: "Descartada" },
];

const SEED: Iniciativa[] = [
  {
    id: "i1",
    titulo: "Definir nome único e alinhar site/IG/LinkedIn",
    categoria: "marca",
    descricao:
      "Padronizar nome, bio e identidade visual nos 3 canais para reduzir atrito na 1ª impressão.",
    prazo: "2026-06-25",
    resultado: "",
    status: "em_teste",
  },
  {
    id: "i2",
    titulo: "Coletar 3 depoimentos de donos de café com antes/depois",
    categoria: "marca",
    descricao:
      "Vídeo curto de 60s mostrando o número que o dono não sabia antes e passou a saber depois.",
    prazo: "2026-07-10",
    resultado: "",
    status: "ideia",
  },
  {
    id: "i3",
    titulo: "A/B de mensagem de dor no outbound",
    categoria: "comercial",
    descricao:
      "Variante A: pergunta sobre lucro do mês passado. Variante B: pergunta sobre custo do cafezinho.",
    prazo: "2026-07-05",
    resultado: "",
    status: "em_teste",
  },
  {
    id: "i4",
    titulo: "Testar webinar para a base da Yungas",
    categoria: "comercial",
    descricao:
      "Webinar de 30min com dono de café convidado + demo do WhatsApp. Meta: 20 inscritos, 8 presentes.",
    prazo: "2026-07-18",
    resultado: "",
    status: "ideia",
  },
  {
    id: "i5",
    titulo: "Landing page com calculadora de margem",
    categoria: "marca",
    descricao:
      "Página única com calculadora simples (faturamento - custo) gerando lead qualificado.",
    prazo: "2026-06-20",
    resultado: "Conversão 4% em 80 visitas — manter como inbound suplementar.",
    status: "validada",
  },
  {
    id: "i6",
    titulo: "Anúncio Meta segmentado a donos de café",
    categoria: "comercial",
    descricao: "Teste de R$ 500 com 3 criativos diferentes em públicos lookalike.",
    prazo: "2026-06-15",
    resultado: "CPL alto (R$ 180) e leads desqualificados. Descartado para esta fase.",
    status: "descartada",
  },
];

const CAT_LABEL: Record<Categoria, string> = {
  marca: "Marca",
  comercial: "Comercial",
};

const STORAGE_KEY = "usefin.marca.iniciativas";

function carregar(): Iniciativa[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function MarcaPage() {
  const [items, setItems] = useState<Iniciativa[]>(carregar);
  const [filterCat, setFilterCat] = useState<"todas" | Categoria>("todas");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [editing, setEditing] = useState<Iniciativa | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage indisponível — segue em memória */
    }
  }, [items]);

  const filtered = useMemo(
    () =>
      filterCat === "todas"
        ? items
        : items.filter((i) => i.categoria === filterCat),
    [items, filterCat],
  );

  function move(id: string, to: Status) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: to } : i)));
  }

  function update(id: string, patch: Partial<Iniciativa>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function create(novo: Omit<Iniciativa, "id">) {
    setItems((prev) => [...prev, { ...novo, id: `i${Date.now()}` }]);
  }

  return (
    <div>
      <PageHeader
        title="Marca & iniciativas"
        description="Esteira de ideias e testes — arraste cards para mudar o status."
        actions={
          <>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <Select
                value={filterCat}
                onValueChange={(v) => setFilterCat(v as "todas" | Categoria)}
              >
                <SelectTrigger className="h-9 w-[180px] bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  <SelectItem value="marca">Marca</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ImportarIniciativasCsv onReplace={(items) => setItems(items)} />
            <NovaIniciativa
              open={createOpen}
              onOpenChange={setCreateOpen}
              onCreate={(v) => {
                create(v);
                setCreateOpen(false);
              }}
            />
          </>
        }
      />

      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex min-w-max gap-3">
          {COLUNAS.map((col) => {
            const list = filtered.filter((i) => i.status === col.id);
            const isOver = overCol === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (overCol !== col.id) setOverCol(col.id);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggingId) move(draggingId, col.id);
                  setDraggingId(null);
                  setOverCol(null);
                }}
                className={
                  "flex max-h-[calc(100vh-220px)] w-80 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors " +
                  (isOver ? "border-primary bg-accent/30" : "border-border")
                }
              >
                <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {col.label}
                  </p>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-card px-1.5 text-[10px] font-semibold text-foreground">
                    {list.length}
                  </span>
                </div>
                <div className="space-y-2 overflow-y-auto p-2">
                  {list.map((it) => (
                    <IniciativaCard
                      key={it.id}
                      it={it}
                      dragging={draggingId === it.id}
                      onDragStart={() => setDraggingId(it.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverCol(null);
                      }}
                      onClick={() => setEditing(it)}
                    />
                  ))}
                  {list.length === 0 && (
                    <p className="py-6 text-center text-[11px] text-muted-foreground">
                      Vazio
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EditDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (editing) update(editing.id, patch);
          setEditing(null);
        }}
      />
    </div>
  );
}

function CatBadge({ c }: { c: Categoria }) {
  const cls =
    c === "marca"
      ? "bg-primary/15 text-primary border border-primary/30"
      : "bg-accent/40 text-accent-foreground border border-accent";
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}
    >
      {CAT_LABEL[c]}
    </span>
  );
}

function IniciativaCard({
  it,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  it: Iniciativa;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const data = new Date(it.prazo);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const atrasada =
    data < hoje && it.status !== "validada" && it.status !== "descartada";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={
        "group cursor-grab rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 active:cursor-grabbing " +
        (dragging ? "opacity-50" : "")
      }
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        <p className="flex-1 text-sm font-semibold leading-tight text-foreground">
          {it.titulo}
        </p>
      </div>
      <div className="mt-2">
        <CatBadge c={it.categoria} />
      </div>
      <p className="mt-2 line-clamp-3 text-xs leading-snug text-muted-foreground">
        {it.descricao}
      </p>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
        <CalendarClock
          className={`h-3 w-3 ${atrasada ? "text-destructive" : "text-primary"}`}
        />
        <span
          className={
            atrasada ? "font-medium text-destructive" : "text-muted-foreground"
          }
        >
          Prazo: {data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          {atrasada ? " · atrasada" : ""}
        </span>
      </div>

      {it.resultado && (
        <div className="mt-2 rounded-md border border-border/60 bg-muted/60 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Resultado
          </p>
          <p className="mt-0.5 text-xs leading-snug text-foreground">
            {it.resultado}
          </p>
        </div>
      )}
    </div>
  );
}

function EditDialog({
  item,
  onClose,
  onSave,
}: {
  item: Iniciativa | null;
  onClose: () => void;
  onSave: (patch: Partial<Iniciativa>) => void;
}) {
  const [resultado, setResultado] = useState("");
  const [status, setStatus] = useState<Status>("ideia");

  useEffect(() => {
    if (item) {
      setResultado(item.resultado);
      setStatus(item.status);
    }
  }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {item && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <CatBadge c={item.categoria} />
              </div>
              <DialogTitle className="mt-2 text-left">{item.titulo}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição
                </p>
                <p className="mt-1 text-sm text-foreground">{item.descricao}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prazo
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(item.prazo).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger className="h-9 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUNAS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Resultado</Label>
                <Textarea
                  rows={3}
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  placeholder="O que o teste mostrou? Próximo passo?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => onSave({ resultado, status })}>Salvar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NovaIniciativa({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (v: Omit<Iniciativa, "id">) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("marca");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [status, setStatus] = useState<Status>("ideia");

  function reset() {
    setTitulo("");
    setCategoria("marca");
    setDescricao("");
    setPrazo("");
    setStatus("ideia");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-9">
          <Plus className="mr-1 h-4 w-4" />
          Nova iniciativa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova iniciativa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria</Label>
              <Select
                value={categoria}
                onValueChange={(v) => setCategoria(v as Categoria)}
              >
                <SelectTrigger className="h-9 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marca">Marca</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status inicial</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger className="h-9 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUNAS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Prazo de teste</Label>
            <Input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!titulo || !prazo}
            onClick={() =>
              onCreate({
                titulo,
                categoria,
                descricao,
                prazo,
                resultado: "",
                status,
              })
            }
          >
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
