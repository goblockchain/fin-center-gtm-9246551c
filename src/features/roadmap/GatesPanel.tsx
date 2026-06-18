import { Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { relativo, dataCurta, urgencia, URGENCIA_TEXT } from "@/lib/datas";
import { useGates } from "./api";

export function GatesPanel() {
  const { data: gates } = useGates();
  return (
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
                <Badge variant={concluido ? "success" : "secondary"}>
                  {concluido ? "Concluído" : "Pendente"}
                </Badge>
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
    </div>
  );
}
