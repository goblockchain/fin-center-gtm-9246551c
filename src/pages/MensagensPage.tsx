import { useState } from "react";
import { Loader2, MessageSquareText, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCanais } from "@/features/canais/api";
import { useModelos, type ModeloComCanal } from "@/features/mensagens/api";
import { ModeloDialog } from "@/features/mensagens/ModeloDialog";
import { ESTAGIOS, ESTAGIO_META } from "@/features/pipeline/estagios";

export function MensagensPage() {
  const [canalId, setCanalId] = useState<string>("all");
  const [estagio, setEstagio] = useState<string>("all");
  const [aberto, setAberto] = useState<ModeloComCanal | null>(null);

  const { data: canais } = useCanais();
  const { data: modelos, isLoading } = useModelos(canalId, estagio);

  return (
    <div>
      <PageHeader
        title="Mensagens"
        description="Modelos por canal e estágio, com variáveis {nome}, {cafe}, {dor} e variante A/B. O Fin Center não envia WhatsApp — só registra status."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Select value={canalId} onValueChange={setCanalId}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os canais</SelectItem>
            {(canais ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estagio} onValueChange={setEstagio}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Estágio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estágios</SelectItem>
            {ESTAGIOS.map((e) => (
              <SelectItem key={e} value={e}>
                {ESTAGIO_META[e].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando modelos…
        </div>
      ) : !modelos?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <MessageSquareText className="h-8 w-8" />
            <p>Nenhum modelo com esses filtros.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {modelos.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAberto(m)}
              className="group text-left"
            >
              <Card className="h-full transition-colors hover:border-fin">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-fin-dark">{m.titulo}</p>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {m.canal?.nome && (
                      <Badge variant="outline">{m.canal.nome}</Badge>
                    )}
                    {m.estagio && (
                      <Badge variant="secondary">
                        {ESTAGIO_META[m.estagio].label}
                      </Badge>
                    )}
                    {m.variante && <Badge>Variante {m.variante}</Badge>}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {m.corpo}
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <ModeloDialog
        modelo={aberto}
        open={!!aberto}
        onOpenChange={(o) => !o && setAberto(null)}
      />
    </div>
  );
}
