import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAtualizarTarefa, type TarefaComCanal } from "./api";

type Form = {
  titulo: string;
  responsavel: string;
  data_inicio: string;
  prazo: string;
};

export function TarefaEditDialog({
  tarefa,
  open,
  onOpenChange,
}: {
  tarefa: TarefaComCanal | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const atualizar = useAtualizarTarefa();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (open && tarefa) {
      setForm({
        titulo: tarefa.titulo,
        responsavel: tarefa.responsavel ?? "",
        data_inicio: tarefa.data_inicio ?? "",
        prazo: tarefa.prazo ?? "",
      });
    }
  }, [open, tarefa]);

  if (!tarefa || !form) return null;
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function salvar() {
    if (!form) return;
    await atualizar.mutateAsync({
      id: tarefa!.id,
      patch: {
        titulo: form.titulo.trim() || tarefa!.titulo,
        responsavel: form.responsavel.trim() || null,
        data_inicio: form.data_inicio || null,
        prazo: form.prazo || null,
      },
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tarefa.codigo}</Badge>
            <DialogTitle>Editar tarefa</DialogTitle>
          </div>
          <DialogDescription>
            {tarefa.frente}
            {tarefa.canal?.nome ? ` · ${tarefa.canal.nome}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-fin-dark">Título</label>
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
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={atualizar.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={atualizar.isPending}>
            {atualizar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
