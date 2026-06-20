import { useState } from "react";
import { Plus, Quote, Loader2, Pin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useVozes, useToggleProva } from "@/features/voz/api";
import { VozCard } from "@/features/voz/VozCard";
import { VozDialog } from "@/features/voz/VozDialog";
import { TIPOS_VOZ, TIPO_VOZ_META } from "@/features/voz/tipos";
import type { TipoVoz } from "@/types/db";

export function VozPage() {
  const [tipo, setTipo] = useState<TipoVoz | "all">("all");
  const [soFixadas, setSoFixadas] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: vozes, isLoading } = useVozes({ tipo, soFixadas });
  const toggle = useToggleProva();

  return (
    <div>
      <PageHeader
        title="Voz do Cliente"
        description="Depoimentos, mensagens, histórias e relatórios. Cada prova fica ligada à conta de onde veio."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nova voz
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={tipo}
          onValueChange={(v) => setTipo(v as TipoVoz | "all")}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {TIPOS_VOZ.map((t) => (
              <SelectItem key={t} value={t}>
                {TIPO_VOZ_META[t].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => setSoFixadas((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium",
            soFixadas
              ? "border-fin bg-fin-light/30 text-fin-dark"
              : "border-input text-muted-foreground hover:bg-secondary",
          )}
        >
          <Pin className={cn("h-3.5 w-3.5", soFixadas && "fill-fin text-fin")} />
          Só provas fixadas
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando…
        </div>
      ) : !vozes?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Quote className="h-8 w-8" />
            <p>Nenhum registro com esses filtros.</p>
            <Button variant="outline" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Registrar a primeira voz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {vozes.map((v) => (
            <VozCard
              key={v.id}
              v={v}
              onToggleProva={(fixado) => toggle.mutate({ id: v.id, fixado })}
            />
          ))}
        </div>
      )}

      <VozDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
