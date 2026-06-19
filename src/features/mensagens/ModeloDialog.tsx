import { useEffect, useState } from "react";
import { Copy, Check, Loader2, MessageSquareOff } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ContaPicker, type ContaRef } from "@/components/shared/ContaPicker";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRegistrarLog, type ModeloComCanal } from "./api";
import {
  preencher,
  variaveisUsadas,
  VARIAVEL_LABEL,
  type Variavel,
} from "./variaveis";
import type { StatusMensagem } from "@/types/db";

const STATUS_MSG: { v: StatusMensagem; label: string }[] = [
  { v: "rascunho", label: "Rascunho" },
  { v: "enviado", label: "Enviado" },
  { v: "respondido", label: "Respondido" },
  { v: "sem_resposta", label: "Sem resposta" },
];

export function ModeloDialog({
  modelo,
  open,
  onOpenChange,
}: {
  modelo: ModeloComCanal | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { user } = useAuth();
  const registrar = useRegistrarLog();
  const [vars, setVars] = useState<Partial<Record<Variavel, string>>>({});
  const [conta, setConta] = useState<ContaRef | null>(null);
  const [status, setStatus] = useState<StatusMensagem>("enviado");
  const [obs, setObs] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [logFeito, setLogFeito] = useState(false);

  useEffect(() => {
    if (open) {
      setVars({});
      setConta(null);
      setStatus("enviado");
      setObs("");
      setCopiado(false);
      setLogFeito(false);
    }
  }, [open]);

  if (!modelo) return null;
  const usadas = variaveisUsadas(modelo.corpo);
  const texto = preencher(modelo.corpo, vars);

  async function copiar() {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  async function registrarLog() {
    await registrar.mutateAsync({
      modelo_id: modelo!.id,
      canal_id: modelo!.canal_id,
      conta_id: conta?.id ?? null,
      variante: modelo!.variante,
      status_manual: status,
      observacao: obs.trim() || null,
      autor: user?.email ?? null,
    });
    setLogFeito(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{modelo.titulo}</DialogTitle>
            {modelo.variante && (
              <Badge variant="secondary">Variante {modelo.variante}</Badge>
            )}
          </div>
          <DialogDescription>
            {modelo.canal?.nome ?? "Sem canal"} · preencha as variáveis e
            registre o status manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {usadas.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {usadas.map((v) => (
                <div key={v} className="space-y-1">
                  <label className="text-xs font-medium text-fin-dark">
                    {VARIAVEL_LABEL[v]}
                  </label>
                  <Input
                    value={vars[v] ?? ""}
                    onChange={(e) =>
                      setVars((s) => ({ ...s, [v]: e.target.value }))
                    }
                    placeholder={`{${v}}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pré-visualização */}
          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <p className="whitespace-pre-wrap text-sm text-fin-dark">{texto}</p>
            <div className="mt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={copiar}>
                {copiado ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiado ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Log manual */}
          <div className="space-y-3 rounded-md border border-border p-3">
            <p className="text-sm font-medium text-fin-dark">
              Registrar status (manual)
            </p>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Conta (opcional)
              </label>
              <ContaPicker value={conta} onChange={setConta} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as StatusMensagem)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_MSG.map((s) => (
                      <SelectItem key={s.v} value={s.v}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Observação
                </label>
                <Input
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="ex.: respondeu pedindo proposta"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquareOff className="h-3.5 w-3.5" /> O UseFin não
                envia WhatsApp — só registra.
              </p>
              <Button
                size="sm"
                onClick={registrarLog}
                disabled={registrar.isPending || logFeito}
              >
                {registrar.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {logFeito ? "Registrado ✓" : "Registrar no log"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
