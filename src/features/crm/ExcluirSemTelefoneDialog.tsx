import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useContasSemTelefone,
  useExcluirContasSemTelefone,
} from "@/features/crm/api";


export function ExcluirSemTelefoneDialog() {
  const [open, setOpen] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const { data: contas, isLoading } = useContasSemTelefone();
  const excluir = useExcluirContasSemTelefone();
  const total = contas?.length ?? 0;

  async function handleExcluir() {
    if (!contas?.length) return;
    try {
      await excluir.mutateAsync(contas.map((c) => c.id));
      setOpen(false);
      setConfirmando(false);
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Falha ao excluir os leads.",
      );
    }
  }


  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setConfirmando(false);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-700 hover:text-red-800">
          <Trash2 className="mr-2 h-4 w-4" /> Excluir sem telefone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Excluir leads sem telefone
          </DialogTitle>
          <DialogDescription>
            Remove em massa todas as contas que não têm telefone informado. A
            ação remove também contatos, interações e oportunidades vinculadas
            (cascade) e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/30 p-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
            </div>
          ) : total === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma conta sem telefone — nada para remover.
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-fin-dark">
                {total} {total === 1 ? "conta será removida" : "contas serão removidas"}:
              </p>
              <ul className="max-h-56 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                {contas!.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{c.nome}</span>
                    <span className="shrink-0 text-xs">
                      {c.bairro ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          {total > 0 &&
            (!confirmando ? (
              <Button
                variant="destructive"
                onClick={() => setConfirmando(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir {total}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleExcluir}
                disabled={excluir.isPending}
              >
                {excluir.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Confirmar exclusão de {total}
              </Button>
            ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
