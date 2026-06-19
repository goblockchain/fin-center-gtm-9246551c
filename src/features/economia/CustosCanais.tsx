import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { brl } from "@/lib/format";
import { useCanais } from "@/features/canais/api";
import {
  useCustos,
  useCriarCusto,
  useExcluirCusto,
  TIPOS_CUSTO,
  TIPO_CUSTO_LABEL,
  competencia,
} from "./api";
import type { TipoCusto } from "@/types/db";

export function CustosCanais() {
  const { data: canais } = useCanais();
  const { data: custos } = useCustos();
  const criar = useCriarCusto();
  const excluir = useExcluirCusto();

  const [canalId, setCanalId] = useState("");
  const [tipo, setTipo] = useState<TipoCusto>("operacional");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [horas, setHoras] = useState("");
  const [comp, setComp] = useState(competencia().slice(0, 7)); // yyyy-mm

  useEffect(() => {
    if (canais?.length && !canalId) setCanalId(canais[0].id);
  }, [canais, canalId]);

  const doCanal = useMemo(
    () => (custos ?? []).filter((c) => c.canal_id === canalId),
    [custos, canalId],
  );
  const totalValor = doCanal.reduce((s, c) => s + Number(c.valor ?? 0), 0);
  const totalHoras = doCanal.reduce((s, c) => s + Number(c.horas ?? 0), 0);

  function adicionar() {
    const v = Number(valor);
    if (!canalId || valor === "" || Number.isNaN(v)) return;
    criar.mutate(
      {
        canal_id: canalId,
        tipo,
        descricao: descricao || null,
        valor: v,
        horas: horas ? Number(horas) : null,
        competencia: comp ? `${comp}-01` : null,
      },
      {
        onSuccess: () => {
          setDescricao("");
          setValor("");
          setHoras("");
        },
      },
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select value={canalId} onValueChange={setCanalId}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            {(canais ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          Total: <strong className="text-fin-dark">{brl(totalValor)}</strong>
          {totalHoras > 0 && <> · {totalHoras}h</>}
        </span>
      </div>

      {/* Formulário de novo custo */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-12">
        <div className="col-span-1 sm:col-span-2">
          <Select value={tipo} onValueChange={(v) => setTipo(v as TipoCusto)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_CUSTO.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          className="col-span-2 h-9 sm:col-span-4"
          placeholder="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <Input
          className="col-span-1 h-9 sm:col-span-2"
          type="number"
          min={0}
          placeholder="R$ valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <Input
          className="col-span-1 h-9 sm:col-span-1"
          type="number"
          min={0}
          placeholder="horas"
          value={horas}
          onChange={(e) => setHoras(e.target.value)}
        />
        <Input
          className="col-span-1 h-9 sm:col-span-2"
          type="month"
          value={comp}
          onChange={(e) => setComp(e.target.value)}
        />
        <button
          type="button"
          onClick={adicionar}
          disabled={criar.isPending || valor === ""}
          className="col-span-1 inline-flex h-9 items-center justify-center gap-1 rounded-md bg-fin px-3 text-sm font-medium text-white hover:bg-fin-dark disabled:opacity-50 sm:col-span-1"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Lista de custos do canal */}
      {doCanal.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-1 text-left font-medium">Tipo</th>
                <th className="px-2 py-1 text-left font-medium">Descrição</th>
                <th className="px-2 py-1 text-right font-medium">Valor</th>
                <th className="px-2 py-1 text-right font-medium">Horas</th>
                <th className="px-2 py-1 text-left font-medium">Mês</th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doCanal.map((c) => (
                <tr key={c.id}>
                  <td className="px-2 py-1.5 text-fin-dark">
                    {TIPO_CUSTO_LABEL[c.tipo]}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {c.descricao ?? "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right text-fin-dark">
                    {brl(c.valor)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                    {c.horas != null ? `${Number(c.horas)}h` : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {c.competencia ? c.competencia.slice(0, 7) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => excluir.mutate(c.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Excluir custo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Nenhum custo lançado para este canal ainda.
        </p>
      )}
    </Card>
  );
}
