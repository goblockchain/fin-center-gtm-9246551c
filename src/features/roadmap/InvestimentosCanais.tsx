import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/format";
import { useCanalExecucao } from "@/features/canais/api";
import { useInvestimentos, useAtualizarInvestimento } from "./api";

function EditNum({
  value,
  onSave,
  prefixo = "R$",
}: {
  value: number;
  onSave: (v: number) => void;
  prefixo?: string;
}) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">{prefixo}</span>
      <Input
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          const n = Number(v);
          if (!Number.isNaN(n) && n !== Number(value)) onSave(n);
        }}
        className="h-8 w-24"
      />
    </div>
  );
}

/** Quick-fill: custo por lead × nº de leads -> executado. */
function CustoPorLead({
  leads,
  onAplicar,
}: {
  leads: number;
  onAplicar: (executado: number) => void;
}) {
  const [v, setV] = useState("");
  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="R$/lead"
        className="h-8 w-24"
      />
      <button
        type="button"
        onClick={() => {
          const c = Number(v);
          if (!Number.isNaN(c) && c > 0) onAplicar(c * leads);
        }}
        className="rounded-md border border-border px-2 py-1 text-xs text-fin-dark hover:bg-secondary"
        title={`× ${leads} leads`}
      >
        aplicar
      </button>
    </div>
  );
}

export function InvestimentosCanais() {
  const { data: execucoes } = useCanalExecucao();
  const { data: investimentos } = useInvestimentos();
  const atualizar = useAtualizarInvestimento();

  const invPorCanal = useMemo(
    () => new Map((investimentos ?? []).map((i) => [i.canal_id, i])),
    [investimentos],
  );

  function salvar(canalId: string | null, patch: { planejado?: number; executado?: number }) {
    if (!canalId) return;
    const inv = invPorCanal.get(canalId);
    if (inv) atualizar.mutate({ id: inv.id, patch });
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2 text-left font-medium">Canal</th>
            <th className="px-2 py-2 text-right font-medium">Leads</th>
            <th className="px-2 py-2 text-left font-medium">Planejado</th>
            <th className="px-2 py-2 text-left font-medium">Executado</th>
            <th className="px-2 py-2 text-left font-medium">Custo/lead</th>
            <th className="px-4 py-2 text-right font-medium">CAC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {(execucoes ?? []).map((e) => {
            const leads = Number(e.total_oport ?? 0);
            const ganhos = Number(e.ganhos ?? 0);
            const exec = Number(e.investimento_executado ?? 0);
            const cac = ganhos > 0 ? exec / ganhos : null;
            return (
              <tr key={e.canal_id}>
                <td className="px-4 py-2 font-medium text-fin-dark">{e.nome}</td>
                <td className="px-2 py-2 text-right text-muted-foreground">
                  {leads}
                </td>
                <td className="px-2 py-2">
                  <EditNum
                    value={Number(e.investimento_planejado ?? 0)}
                    onSave={(v) => salvar(e.canal_id, { planejado: v })}
                  />
                </td>
                <td className="px-2 py-2">
                  <EditNum
                    value={exec}
                    onSave={(v) => salvar(e.canal_id, { executado: v })}
                  />
                </td>
                <td className="px-2 py-2">
                  <CustoPorLead
                    leads={leads}
                    onAplicar={(executado) =>
                      salvar(e.canal_id, { executado })
                    }
                  />
                </td>
                <td className="px-4 py-2 text-right font-medium text-fin-dark">
                  {cac != null ? brl(cac) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
