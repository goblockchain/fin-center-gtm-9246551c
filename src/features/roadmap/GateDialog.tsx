import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import { useCriarGate, useAtualizarGate, useExcluirGate } from "./api";
import type { Gate, StatusGate } from "@/types/db";

type Form = {
  nome: string;
  data: string;
  criterio: string;
  decisao_possivel: string;
  status: StatusGate;
};

export function GateDialog({
  gate,
  open,
  onOpenChange,
}: {
  gate: Gate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const criar = useCriarGate();
  const atualizar = useAtualizarGate();
  const excluir = useExcluirGate();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        gate
          ? {
              nome: gate.nome,
              data: gate.data,
              criterio: gate.criterio ?? "",
              decisao_possivel: gate.decisao_possivel ?? "",
              status: gate.status,
            }
          : {
              nome: "",
              data: "",
              criterio: "",
              decisao_possivel: "",
              status: "pendente",
            },
      );
    }
  }, [open, gate]);

  if (!form) return null;
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));
  const pendente = criar.isPending || atualizar.isPending || excluir.isPending;

  async function salvar() {
    if (!form || !form.nome.trim() || !form.data) return;
    const dados = {
      nome: form.nome.trim(),
      data: form.data,
      criterio: form.criterio.trim() || null,
      decisao_possivel: form.decisao_possivel.trim() || null,
      status: form.status,
    };
    if (gate) await atualizar.mutateAsync({ id: gate.id, patch: dados });
    else await criar.mutateAsync(dados);
    onOpenChange(false);
  }

  async function remover() {
    if (gate) {
      await excluir.mutateAsync(gate.id);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{gate ? "Editar gate" : "Novo gate"}</DialogTitle>
          <DialogDescription>
            Gate de decisão da sprint — a linha do tempo se ajusta à data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-fin-dark">Nome *</label>
              <Input
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                placeholder="ex.: Gate 1 — meio"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-fin-dark">Data *</label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => set("data", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-fin-dark">Critério</label>
            <Input
              value={form.criterio}
              onChange={(e) => set("criterio", e.target.value)}
              placeholder="ex.: Conversão por canal vs baseline de 2%"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-fin-dark">
              Decisão possível
            </label>
            <Input
              value={form.decisao_possivel}
              onChange={(e) => set("decisao_possivel", e.target.value)}
              placeholder="ex.: matar · iterar · escalar"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-fin-dark">Status</label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as StatusGate)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {gate ? (
            <Button variant="ghost" onClick={remover} disabled={pendente}>
              <Trash2 className="h-4 w-4 text-destructive" /> Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pendente}
            >
              Cancelar
            </Button>
            <Button
              onClick={salvar}
              disabled={pendente || !form.nome.trim() || !form.data}
            >
              {pendente && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
