import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { dataCurta } from "@/lib/datas";
import { useCanais } from "@/features/canais/api";
import { usePipelineSemana, agregarSemanas } from "./atividade";

export function AtividadeSemana() {
  const { data: linhas } = usePipelineSemana();
  const { data: canais } = useCanais();
  const [canalId, setCanalId] = useState<string>("all");

  const { semanas, totais } = useMemo(
    () => agregarSemanas(linhas ?? [], canalId),
    [linhas, canalId],
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-fin" />
            <h2 className="text-sm font-semibold text-fin-dark">
              Atividade no pipe por semana
            </h2>
          </div>
          <Select value={canalId} onValueChange={setCanalId}>
            <SelectTrigger className="sm:w-56">
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
        </div>

        {semanas.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Semana</th>
                  <th className="px-2 py-2 text-right font-medium">Contatos</th>
                  <th className="px-2 py-2 text-right font-medium">Reuniões</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Fechamentos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {semanas.map((s) => (
                  <tr key={s.semana}>
                    <td className="px-4 py-2 text-fin-dark">
                      {dataCurta(s.semana).slice(0, 5)}
                      <span className="ml-1 text-[11px] text-muted-foreground">
                        (semana)
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right text-fin-dark">
                      {s.contatos}
                    </td>
                    <td className="px-2 py-2 text-right text-fin-dark">
                      {s.reunioes}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-fin">
                      {s.fechamentos}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border text-sm font-semibold">
                  <td className="px-4 py-2 text-fin-dark">Total</td>
                  <td className="px-2 py-2 text-right text-fin-dark">
                    {totais.contatos}
                  </td>
                  <td className="px-2 py-2 text-right text-fin-dark">
                    {totais.reunioes}
                  </td>
                  <td className="px-4 py-2 text-right text-fin">
                    {totais.fechamentos}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Sem atividade registrada ainda.
          </p>
        )}
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Atualiza sozinho a cada mudança de estágio no Pipeline. Contatos =
          entrou em “contatado” · Reuniões = entrou em “reunião” · Fechamentos =
          fechado-ganho.
        </p>
      </CardContent>
    </Card>
  );
}
