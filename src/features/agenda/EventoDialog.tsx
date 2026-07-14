import { useEffect, useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useParticipantes,
  useCriarParticipante,
  useCriarEvento,
  useAtualizarEvento,
  useExcluirEvento,
  type EventoComParticipantes,
} from "./api";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function fromLocalInput(v: string) {
  return new Date(v).toISOString();
}

export function EventoDialog({
  open,
  onOpenChange,
  evento,
  defaultInicio,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  evento?: EventoComParticipantes | null;
  defaultInicio?: Date;
}) {
  const { data: participantes } = useParticipantes();
  const criarPart = useCriarParticipante();
  const criar = useCriarEvento();
  const atualizar = useAtualizarEvento();
  const excluir = useExcluirEvento();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (evento) {
      setTitulo(evento.titulo);
      setDescricao(evento.descricao ?? "");
      setLocal(evento.local ?? "");
      setInicio(toLocalInput(evento.inicio));
      setFim(toLocalInput(evento.fim));
      setSelecionados(new Set(evento.participantes.map((p) => p.participante.id)));
    } else {
      const start = defaultInicio ?? new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      setTitulo("");
      setDescricao("");
      setLocal("");
      setInicio(toLocalInput(start.toISOString()));
      setFim(toLocalInput(end.toISOString()));
      setSelecionados(new Set());
    }
    setNovoNome("");
    setNovoEmail("");
    setErro(null);
  }, [open, evento, defaultInicio]);

  const lista = useMemo(() => participantes ?? [], [participantes]);

  function toggle(id: string) {
    const next = new Set(selecionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelecionados(next);
  }

  async function adicionarPart() {
    if (!novoNome.trim()) return;
    const p = await criarPart.mutateAsync({
      nome: novoNome.trim(),
      email: novoEmail.trim() || null,
      telefone: null,
      tipo: "interno",
    });
    setSelecionados(new Set([...selecionados, p.id]));
    setNovoNome("");
    setNovoEmail("");
  }

  async function salvar() {
    setErro(null);
    if (!titulo.trim()) return setErro("Título obrigatório.");
    if (!inicio || !fim) return setErro("Data e hora obrigatórias.");
    if (new Date(fim) <= new Date(inicio)) return setErro("Fim precisa ser depois do início.");

    try {
      if (evento) {
        await atualizar.mutateAsync({
          id: evento.id,
          patch: {
            titulo,
            descricao: descricao || null,
            local: local || null,
            inicio: fromLocalInput(inicio),
            fim: fromLocalInput(fim),
          },
          participantesIds: [...selecionados],
        });
      } else {
        const res = await criar.mutateAsync({
          titulo,
          descricao: descricao || null,
          local: local || null,
          inicio: fromLocalInput(inicio),
          fim: fromLocalInput(fim),
          participantesIds: [...selecionados],
        });
        if (res.syncErro) {
          setErro(
            "Evento criado no UseFin, mas não sincronizou com o Google Calendar: " +
              res.syncErro,
          );
          return; // deixa o usuário ver antes de fechar
        }
      }
      onOpenChange(false);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function apagar() {
    if (!evento) return;
    if (!confirm("Excluir este evento? Também remove do Google Calendar.")) return;
    try {
      await excluir.mutateAsync(evento);
      onOpenChange(false);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{evento ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Início</Label>
              <Input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div>
              <Label>Fim</Label>
              <Input type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Local</Label>
            <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Endereço, sala, link Meet…" />
          </div>

          <div>
            <Label>Descrição</Label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full min-h-[64px] rounded-md border border-input bg-card p-2 text-sm"
            />
          </div>

          <div>
            <Label>Participantes</Label>
            <div className="mt-1 max-h-40 space-y-1 overflow-auto rounded-md border border-input bg-card p-2">
              {lista.length === 0 && (
                <p className="p-1 text-xs text-muted-foreground">
                  Nenhum participante cadastrado — adicione um abaixo.
                </p>
              )}
              {lista.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm hover:bg-accent/40">
                  <input
                    type="checkbox"
                    checked={selecionados.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span className="font-medium text-fin-dark">{p.nome}</span>
                  {p.email && <span className="text-xs text-muted-foreground">{p.email}</span>}
                </label>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="h-9"
              />
              <Input
                placeholder="email (p/ receber convite)"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                className="h-9"
              />
              <Button
                type="button"
                size="sm"
                onClick={adicionarPart}
                disabled={!novoNome.trim() || criarPart.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Convidados com e-mail recebem convite do Google Calendar automaticamente.
            </p>
          </div>

          {erro && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
              {erro}
            </p>
          )}
        </div>

        <DialogFooter className="flex-row justify-between gap-2">
          {evento ? (
            <Button variant="destructive" onClick={apagar}>
              <X className="h-4 w-4" /> Excluir
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={criar.isPending || atualizar.isPending}>
              {evento ? "Salvar" : "Criar evento"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
