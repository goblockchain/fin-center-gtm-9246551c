import { useState } from "react";
import { Handshake, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl, pct } from "@/lib/format";
import { useParceiroKpis, useCriarParceiro, useExcluirParceiro } from "./api";

export function ParceirosSecao() {
  const { data: parceiros } = useParceiroKpis();
  const criar = useCriarParceiro();
  const excluir = useExcluirParceiro();
  const [nome, setNome] = useState("");

  const lista = [...(parceiros ?? [])].sort(
    (a, b) => Number(b.mrr ?? 0) - Number(a.mrr ?? 0),
  );
  const totais = lista.reduce(
    (a, p) => ({
      mrr: a.mrr + Number(p.mrr ?? 0),
      ativos: a.ativos + (p.ativo ? 1 : 0),
    }),
    { mrr: 0, ativos: 0 },
  );

  function adicionar() {
    if (!nome.trim()) return;
    criar.mutate({ nome: nome.trim() }, { onSuccess: () => setNome("") });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-fin" />
            <h2 className="text-sm font-semibold text-fin-dark">Parcerias</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {lista.length} cadastrados · {totais.ativos} ativos · {brl(totais.mrr)}
          </span>
        </div>
        <p className="mb-3 text-[11px] text-muted-foreground">
          Cadastre o parceiro; os números (leads, reuniões, clientes, MRR) vêm do
          pipe — atribua o lead ao parceiro na ficha do lead.
        </p>

        <div className="flex gap-2">
          <Input
            className="h-9 flex-1"
            placeholder="Nome do parceiro"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
          />
          <button
            type="button"
            onClick={adicionar}
            disabled={criar.isPending || !nome.trim()}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-fin px-3 text-sm font-medium text-white hover:bg-fin-dark disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>

        {lista.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-1 text-left font-medium">#</th>
                  <th className="px-2 py-1 text-left font-medium">Parceiro</th>
                  <th className="px-2 py-1 text-right font-medium">Leads</th>
                  <th className="px-2 py-1 text-right font-medium">Reuniões</th>
                  <th className="px-2 py-1 text-right font-medium">Clientes</th>
                  <th className="px-2 py-1 text-right font-medium">Conv.</th>
                  <th className="px-2 py-1 text-right font-medium">MRR</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.map((p, i) => {
                  const leads = Number(p.leads ?? 0);
                  const conv = leads > 0 ? Number(p.clientes ?? 0) / leads : null;
                  return (
                    <tr key={p.parceiro_id ?? i}>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-2 py-1.5 font-medium text-fin-dark">
                        {p.nome}
                        {!p.ativo && (
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            inativo
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {p.leads}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {p.reunioes}
                      </td>
                      <td className="px-2 py-1.5 text-right text-fin-dark">
                        {p.clientes}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {conv != null ? pct(conv, 1) : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-right font-medium text-fin-dark">
                        {Number(p.mrr ?? 0) > 0 ? brl(p.mrr) : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            p.parceiro_id && excluir.mutate(p.parceiro_id)
                          }
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Excluir parceiro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Nenhum parceiro cadastrado ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
