import { useState } from "react";
import { Handshake, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl, pct } from "@/lib/format";
import {
  useParceiros,
  useCriarParceiro,
  useExcluirParceiro,
} from "./api";

export function ParceirosSecao() {
  const { data: parceiros } = useParceiros();
  const criar = useCriarParceiro();
  const excluir = useExcluirParceiro();

  const [nome, setNome] = useState("");
  const [leads, setLeads] = useState("");
  const [sqls, setSqls] = useState("");
  const [clientes, setClientes] = useState("");
  const [receita, setReceita] = useState("");

  const lista = parceiros ?? [];
  const totais = lista.reduce(
    (a, p) => ({
      leads: a.leads + Number(p.leads_enviados ?? 0),
      clientes: a.clientes + Number(p.clientes ?? 0),
      receita: a.receita + Number(p.receita ?? 0),
      ativos: a.ativos + (p.ativo ? 1 : 0),
    }),
    { leads: 0, clientes: 0, receita: 0, ativos: 0 },
  );

  function adicionar() {
    if (!nome.trim()) return;
    criar.mutate(
      {
        nome: nome.trim(),
        leads_enviados: Number(leads) || 0,
        sqls: Number(sqls) || 0,
        clientes: Number(clientes) || 0,
        receita: Number(receita) || 0,
      },
      {
        onSuccess: () => {
          setNome("");
          setLeads("");
          setSqls("");
          setClientes("");
          setReceita("");
        },
      },
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-fin" />
            <h2 className="text-sm font-semibold text-fin-dark">Parcerias</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {lista.length} cadastrados · {totais.ativos} ativos ·{" "}
            {brl(totais.receita)}
          </span>
        </div>

        {/* Novo parceiro */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-12">
          <Input
            className="col-span-2 h-9 sm:col-span-3"
            placeholder="Nome do parceiro"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-2"
            type="number"
            min={0}
            placeholder="leads"
            value={leads}
            onChange={(e) => setLeads(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-2"
            type="number"
            min={0}
            placeholder="SQLs"
            value={sqls}
            onChange={(e) => setSqls(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-2"
            type="number"
            min={0}
            placeholder="clientes"
            value={clientes}
            onChange={(e) => setClientes(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-2"
            type="number"
            min={0}
            placeholder="R$ rec."
            value={receita}
            onChange={(e) => setReceita(e.target.value)}
          />
          <button
            type="button"
            onClick={adicionar}
            disabled={criar.isPending || !nome.trim()}
            className="col-span-1 inline-flex h-9 items-center justify-center rounded-md bg-fin px-3 text-sm font-medium text-white hover:bg-fin-dark disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Ranking */}
        {lista.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-1 text-left font-medium">#</th>
                  <th className="px-2 py-1 text-left font-medium">Parceiro</th>
                  <th className="px-2 py-1 text-right font-medium">Leads</th>
                  <th className="px-2 py-1 text-right font-medium">Clientes</th>
                  <th className="px-2 py-1 text-right font-medium">Conv.</th>
                  <th className="px-2 py-1 text-right font-medium">Receita</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.map((p, i) => {
                  const conv =
                    Number(p.leads_enviados ?? 0) > 0
                      ? Number(p.clientes ?? 0) / Number(p.leads_enviados)
                      : null;
                  return (
                    <tr key={p.id}>
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
                        {p.leads_enviados}
                      </td>
                      <td className="px-2 py-1.5 text-right text-fin-dark">
                        {p.clientes}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {conv != null ? pct(conv, 1) : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-right font-medium text-fin-dark">
                        {brl(p.receita)}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => excluir.mutate(p.id)}
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
