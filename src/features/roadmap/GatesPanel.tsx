import { useState } from "react";
import { Flag, Pencil, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { relativo, dataCurta, urgencia, URGENCIA_TEXT } from "@/lib/datas";
import { useGates } from "./api";
import { GateDialog } from "./GateDialog";
import type { Gate } from "@/types/db";

export function GatesPanel() {
  const { data: gates } = useGates();
  const [editing, setEditing] = useState<Gate | null>(null);
  const [open, setOpen] = useState(false);

  function novo() {
    setEditing(null);
    setOpen(true);
  }
  function editar(g: Gate) {
    setEditing(g);
    setOpen(true);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {(gates ?? []).map((g) => {
          const u = urgencia(g.data);
          const concluido = g.status === "concluido";
          return (
            <Card key={g.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-fin" />
                    <h3 className="font-semibold text-fin-dark">{g.nome}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={concluido ? "success" : "secondary"}>
                      {concluido ? "Concluído" : "Pendente"}
                    </Badge>
                    <button
                      type="button"
                      aria-label="Editar gate"
                      onClick={() => editar(g)}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-fin-dark"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className={cn("text-sm font-semibold", URGENCIA_TEXT[u])}>
                  {relativo(g.data)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    · {dataCurta(g.data)}
                  </span>
                </p>
                {g.criterio && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-fin-dark">Critério: </span>
                    {g.criterio}
                  </p>
                )}
                {g.decisao_possivel && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-fin-dark">Decisão: </span>
                    {g.decisao_possivel}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}

        <button
          type="button"
          onClick={novo}
          className="flex min-h-28 items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-fin hover:bg-accent/20 hover:text-fin-dark"
        >
          <Plus className="h-4 w-4" /> Novo gate
        </button>
      </div>

      <GateDialog gate={editing} open={open} onOpenChange={setOpen} />
    </>
  );
}
