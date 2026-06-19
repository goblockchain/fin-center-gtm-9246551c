import { useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl, pct } from "@/lib/format";
import { dataCurta } from "@/lib/datas";
import { useEventos, useCriarEvento, useExcluirEvento } from "./api";

export function EventosSecao() {
  const { data: eventos } = useEventos();
  const criar = useCriarEvento();
  const excluir = useExcluirEvento();

  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [participantes, setParticipantes] = useState("");
  const [clientes, setClientes] = useState("");
  const [custo, setCusto] = useState("");
  const [receita, setReceita] = useState("");

  const lista = eventos ?? [];

  function adicionar() {
    if (!nome.trim()) return;
    criar.mutate(
      {
        nome: nome.trim(),
        data: data || null,
        participantes: Number(participantes) || 0,
        clientes: Number(clientes) || 0,
        custo: Number(custo) || 0,
        receita: Number(receita) || 0,
      },
      {
        onSuccess: () => {
          setNome("");
          setData("");
          setParticipantes("");
          setClientes("");
          setCusto("");
          setReceita("");
        },
      },
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-fin" />
          <h2 className="text-sm font-semibold text-fin-dark">Eventos</h2>
        </div>

        {/* Novo evento */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-12">
          <Input
            className="col-span-2 h-9 sm:col-span-3"
            placeholder="Nome do evento"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-2"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-2"
            type="number"
            min={0}
            placeholder="particip."
            value={participantes}
            onChange={(e) => setParticipantes(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-1"
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
            placeholder="R$ custo"
            value={custo}
            onChange={(e) => setCusto(e.target.value)}
          />
          <Input
            className="col-span-1 h-9 sm:col-span-1"
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

        {/* Comparação */}
        {lista.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-1 text-left font-medium">Evento</th>
                  <th className="px-2 py-1 text-left font-medium">Data</th>
                  <th className="px-2 py-1 text-right font-medium">Particip.</th>
                  <th className="px-2 py-1 text-right font-medium">Clientes</th>
                  <th className="px-2 py-1 text-right font-medium">Custo</th>
                  <th className="px-2 py-1 text-right font-medium">CAC</th>
                  <th className="px-2 py-1 text-right font-medium">Receita</th>
                  <th className="px-2 py-1 text-right font-medium">ROI</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.map((ev) => {
                  const cli = Number(ev.clientes ?? 0);
                  const custoN = Number(ev.custo ?? 0);
                  const rec = Number(ev.receita ?? 0);
                  const cac = cli > 0 && custoN > 0 ? custoN / cli : null;
                  const roi = custoN > 0 ? (rec - custoN) / custoN : null;
                  return (
                    <tr key={ev.id}>
                      <td className="px-2 py-1.5 font-medium text-fin-dark">
                        {ev.nome}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {ev.data ? dataCurta(ev.data) : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {ev.participantes}
                      </td>
                      <td className="px-2 py-1.5 text-right text-fin-dark">
                        {cli}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {brl(custoN)}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {cac != null ? brl(cac) : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-right text-fin-dark">
                        {brl(rec)}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {roi != null ? (
                          <span
                            className={roi >= 0 ? "text-fin" : "text-destructive"}
                          >
                            {pct(roi, 0)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => excluir.mutate(ev.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Excluir evento"
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
            Nenhum evento cadastrado ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
