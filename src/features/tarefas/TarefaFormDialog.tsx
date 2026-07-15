import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCanais } from "@/features/canais/api";
import {
  useTarefas,
  useCriarTarefa,
  useAtualizarTarefa,
  type TarefaComCanal,
} from "./api";

// As frentes acompanham os canais. O slug é a chave real (não muda); o rótulo
// segue o nome do canal. "Fin Light" é o antigo Member-get-member.
const FRENTES: { frente: string; slug: string | null; prefixo: string }[] = [
  { frente: "Setup", slug: null, prefixo: "S" },
  { frente: "Yungas", slug: "base-yungas", prefixo: "Y" },
  { frente: "Fin Light", slug: "member-get-member", prefixo: "M" },
  { frente: "Indicações", slug: "indicacoes", prefixo: "I" },
  { frente: "Outbound", slug: "outbound", prefixo: "O" },
  { frente: "Inbound", slug: "inbound", prefixo: "N" },
  { frente: "Meta Ads", slug: "meta-ads", prefixo: "MA" },
  { frente: "ABF", slug: "abf", prefixo: "A" },
  { frente: "Gates", slug: null, prefixo: "G" },
];

type Form = {
  frente: string;
  codigo: string;
  titulo: string;
  responsavel: string;
  data_inicio: string;
  prazo: string;
  depende_de: string;
};

export function TarefaFormDialog({
  tarefa,
  open,
  onOpenChange,
}: {
  tarefa: TarefaComCanal | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data: tarefas } = useTarefas();
  const { data: canais } = useCanais();
  const criar = useCriarTarefa();
  const atualizar = useAtualizarTarefa();
  const ehEdicao = !!tarefa;
  const [form, setForm] = useState<Form | null>(null);

  function proximoCodigo(frente: string, lista: TarefaComCanal[]) {
    const pref = FRENTES.find((f) => f.frente === frente)?.prefixo ?? "T";
    const nums = lista
      .map((t) => t.codigo)
      .filter((c) => c.startsWith(pref))
      .map((c) => parseInt(c.slice(pref.length), 10))
      .filter((n) => !Number.isNaN(n));
    return `${pref}${(nums.length ? Math.max(...nums) : 0) + 1}`;
  }

  useEffect(() => {
    if (!open) return;
    if (tarefa) {
      setForm({
        frente: tarefa.frente,
        codigo: tarefa.codigo,
        titulo: tarefa.titulo,
        responsavel: tarefa.responsavel ?? "",
        data_inicio: tarefa.data_inicio ?? "",
        prazo: tarefa.prazo ?? "",
        depende_de: tarefa.depende_de ?? "",
      });
    } else {
      setForm({
        frente: "Setup",
        codigo: proximoCodigo("Setup", tarefas ?? []),
        titulo: "",
        responsavel: "",
        data_inicio: "",
        prazo: "",
        depende_de: "",
      });
    }
  }, [open, tarefa, tarefas]);

  if (!form) return null;
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));
  const pendente = criar.isPending || atualizar.isPending;

  function trocarFrente(frente: string) {
    setForm((f) =>
      f
        ? {
            ...f,
            frente,
            codigo: ehEdicao ? f.codigo : proximoCodigo(frente, tarefas ?? []),
          }
        : f,
    );
  }

  async function salvar() {
    if (!form || !form.titulo.trim()) return;
    const slug = FRENTES.find((f) => f.frente === form.frente)?.slug ?? null;
    const canalId = slug
      ? (canais?.find((c) => c.slug === slug)?.id ?? null)
      : null;
    const base = {
      frente: form.frente,
      canal_id: canalId,
      titulo: form.titulo.trim(),
      responsavel: form.responsavel.trim() || null,
      data_inicio: form.data_inicio || null,
      prazo: form.prazo || null,
      depende_de: form.depende_de || null,
    };
    if (ehEdicao) {
      await atualizar.mutateAsync({ id: tarefa!.id, patch: base });
    } else {
      await criar.mutateAsync({
        ...base,
        codigo: form.codigo.trim() || proximoCodigo(form.frente, tarefas ?? []),
        status: "a_fazer",
        ordem: (tarefas?.length ?? 0) + 1,
      });
    }
    onOpenChange(false);
  }

  const opcoesDep = (tarefas ?? []).filter((t) => t.id !== tarefa?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ehEdicao ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>
            Frente, prazos e dependência — a linha do tempo do roadmap se ajusta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-fin-dark">Frente</label>
              <Select value={form.frente} onValueChange={trocarFrente}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRENTES.map((f) => (
                    <SelectItem key={f.frente} value={f.frente}>
                      {f.frente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-fin-dark">Código</label>
              <Input
                value={form.codigo}
                onChange={(e) => set("codigo", e.target.value)}
                className="w-24"
                disabled={ehEdicao}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-fin-dark">Título *</label>
            <Input
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-fin-dark">
              Responsável
            </label>
            <Input
              value={form.responsavel}
              onChange={(e) => set("responsavel", e.target.value)}
              placeholder="ex.: Natalia"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-fin-dark">Início</label>
              <Input
                type="date"
                value={form.data_inicio}
                onChange={(e) => set("data_inicio", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-fin-dark">Prazo</label>
              <Input
                type="date"
                value={form.prazo}
                onChange={(e) => set("prazo", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-fin-dark">
              Depende de (opcional)
            </label>
            <Select
              value={form.depende_de || "nenhuma"}
              onValueChange={(v) => set("depende_de", v === "nenhuma" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Nenhuma</SelectItem>
                {opcoesDep.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.codigo} · {t.titulo.slice(0, 40)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={pendente}
          >
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={pendente || !form.titulo.trim()}>
            {pendente && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
