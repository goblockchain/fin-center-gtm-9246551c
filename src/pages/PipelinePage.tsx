import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCanais } from "@/features/canais/api";
import { PipelineBoard } from "@/features/pipeline/PipelineBoard";

export function PipelinePage() {
  const [canalId, setCanalId] = useState<string>("all");
  const { data: canais } = useCanais();

  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Arraste os cards para mudar a etapa — salva na hora."
        actions={
          <Select value={canalId} onValueChange={setCanalId}>
            <SelectTrigger className="w-52">
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
        }
      />
      <PipelineBoard canalId={canalId} />
    </div>
  );
}
