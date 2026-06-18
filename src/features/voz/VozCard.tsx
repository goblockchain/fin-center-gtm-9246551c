import { Pin, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TIPO_VOZ_META } from "./tipos";
import { VozImagem } from "./VozImagem";
import type { VozComConta } from "./api";

export function VozCard({
  v,
  onToggleProva,
}: {
  v: VozComConta;
  onToggleProva: (fixado: boolean) => void;
}) {
  const meta = TIPO_VOZ_META[v.tipo];
  return (
    <Card className={cn(v.fixado_como_prova && "ring-1 ring-fin")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              meta.chip,
            )}
          >
            {meta.label}
          </span>
          <button
            type="button"
            onClick={() => onToggleProva(!v.fixado_como_prova)}
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              v.fixado_como_prova
                ? "text-fin"
                : "text-muted-foreground hover:text-fin-dark",
            )}
          >
            <Pin
              className={cn("h-3.5 w-3.5", v.fixado_como_prova && "fill-fin")}
            />
            {v.fixado_como_prova ? "Prova fixada" : "Fixar como prova"}
          </button>
        </div>

        {v.titulo && <p className="font-medium text-fin-dark">{v.titulo}</p>}

        <blockquote className="border-l-2 border-fin-light pl-3 text-sm italic text-foreground">
          “{v.conteudo}”
        </blockquote>

        {v.imagem_url && <VozImagem path={v.imagem_url} className="h-44 w-full" />}

        {v.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {v.tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">
            {v.autor_cliente ?? v.conta?.nome ?? "—"}
            {v.conta?.nome && v.autor_cliente ? ` · ${v.conta.nome}` : ""}
          </span>
          {v.resultado_mensuravel && (
            <span className="font-medium text-fin">{v.resultado_mensuravel}</span>
          )}
        </div>

        {!v.autorizado && (
          <p className="flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" /> Uso público não autorizado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
