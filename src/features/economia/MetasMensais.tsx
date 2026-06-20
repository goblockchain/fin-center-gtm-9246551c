import { useEffect, useMemo, useState } from "react";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/format";
import { useMetas, useUpsertMeta, competencia } from "./api";

export function MetasMensais() {
  const { data: metas } = useMetas();
  const upsert = useUpsertMeta();
  const [comp, setComp] = useState(competencia().slice(0, 7)); // yyyy-mm
  const [mrr, setMrr] = useState("");
  const [clientes, setClientes] = useState("");

  const existente = useMemo(
    () => (metas ?? []).find((m) => m.competencia.slice(0, 7) === comp),
    [metas, comp],
  );
  // Pré-preenche com a meta salva. Depende de valores primitivos (não da ref do
  // objeto), senão um refetch sobrescreveria o que está sendo digitado (WR-05).
  const exMrr = existente ? Number(existente.meta_mrr) : null;
  const exClientes = existente ? existente.meta_clientes : null;
  useEffect(() => {
    setMrr(exMrr != null ? String(exMrr) : "");
    setClientes(exClientes != null ? String(exClientes) : "");
  }, [comp, exMrr, exClientes]);

  function salvar() {
    if (!comp) return;
    upsert.mutate({
      competencia: `${comp}-01`,
      meta_mrr: Number(mrr) || 0,
      meta_clientes: Number(clientes) || 0,
    });
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="text-xs font-medium text-muted-foreground">
          Mês
          <Input
            type="month"
            value={comp}
            onChange={(e) => setComp(e.target.value)}
            className="mt-1 h-9 sm:w-40"
          />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Meta de MRR (R$)
          <Input
            type="number"
            min={0}
            value={mrr}
            onChange={(e) => setMrr(e.target.value)}
            placeholder="0"
            className="mt-1 h-9 sm:w-36"
          />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Meta de clientes
          <Input
            type="number"
            min={0}
            value={clientes}
            onChange={(e) => setClientes(e.target.value)}
            placeholder="0"
            className="mt-1 h-9 sm:w-32"
          />
        </label>
        <button
          type="button"
          onClick={salvar}
          disabled={upsert.isPending}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-fin px-4 text-sm font-medium text-white hover:bg-fin-dark disabled:opacity-50"
        >
          <Target className="h-4 w-4" />
          {existente ? "Atualizar" : "Salvar"}
        </button>
      </div>

      {(metas ?? []).length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-1 text-left font-medium">Mês</th>
                <th className="px-2 py-1 text-right font-medium">Meta MRR</th>
                <th className="px-2 py-1 text-right font-medium">
                  Meta clientes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(metas ?? []).map((m) => (
                <tr key={m.id}>
                  <td className="px-2 py-1.5 text-fin-dark">
                    {m.competencia.slice(0, 7)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-fin-dark">
                    {brl(m.meta_mrr)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                    {m.meta_clientes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
