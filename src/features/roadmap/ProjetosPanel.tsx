import { useEffect, useState } from "react";
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
import type { Projeto, StatusTarefa } from "@/types/db";
import {
  useProjetos,
  useCriarProjeto,
  useAtualizarProjeto,
  useExcluirProjeto,
} from "./projetos";

const STATUS: { value: StatusTarefa; label: string }[] = [
  { value: "a_fazer", label: "A fazer" },
  { value: "fazendo", label: "Fazendo" },
  { value: "feito", label: "Feito" },
];

/** Linha editável diretamente (sem lápis): salva no blur / on-change. */
function ProjetoRow({ p }: { p: Projeto }) {
  const atualizar = useAtualizarProjeto();
  const excluir = useExcluirProjeto();
  const [nome, setNome] = useState(p.nome);
  const [erro, setErro] = useState<string | null>(null);

  // Sincroniza só quando o valor canônico muda (não enquanto digito).
  useEffect(() => setNome(p.nome), [p.nome]);

  const salvar = (patch: Partial<Projeto>) => {
    setErro(null);
    atualizar.mutate(
      { id: p.id, patch },
      { onError: () => setErro("Não salvou — tente de novo.") },
    );
  };

  return (
    <tr>
      <td className="px-2 py-1.5">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={() => {
            const v = nome.trim();
            if (v && v !== p.nome) salvar({ nome: v });
            else if (!v) setNome(p.nome);
          }}
          className="w-full rounded bg-transparent px-1 py-0.5 text-sm font-medium text-fin-dark outline-none hover:bg-secondary/50 focus:bg-secondary"
        />
        {erro && (
          <p className="mt-0.5 px-1 text-[10px] text-destructive">{erro}</p>
        )}
      </td>
      <td className="px-2 py-1.5">
        <Input
          type="date"
          value={p.data_inicio}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            if (v > p.prazo) setErro("Início não pode ser depois do prazo.");
            else salvar({ data_inicio: v });
          }}
          className="h-8 w-36"
        />
      </td>
      <td className="px-2 py-1.5">
        <Input
          type="date"
          value={p.prazo}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            if (v < p.data_inicio) setErro("Prazo não pode ser antes do início.");
            else salvar({ prazo: v });
          }}
          className="h-8 w-36"
        />
      </td>
      <td className="px-2 py-1.5">
        <Select
          value={p.status}
          onValueChange={(v) => salvar({ status: v as StatusTarefa })}
        >
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-2 py-1.5 text-right">
        <button
          type="button"
          onClick={() =>
            excluir.mutate(p.id, {
              onError: () => setErro("Não foi possível excluir."),
            })
          }
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Excluir projeto ${p.nome}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export function ProjetosPanel() {
  const { data: projetos } = useProjetos();
  const criar = useCriarProjeto();

  const [nome, setNome] = useState("");
  const [inicio, setInicio] = useState("");
  const [prazo, setPrazo] = useState("");
  const [status, setStatus] = useState<StatusTarefa>("a_fazer");
  const [addErro, setAddErro] = useState<string | null>(null);

  function adicionar() {
    if (!nome.trim() || !inicio || !prazo) return;
    if (prazo < inicio) {
      setAddErro("O prazo não pode ser antes do início.");
      return;
    }
    setAddErro(null);
    // ordem = maior existente + 1 (não a contagem, que colide após exclusões).
    const ordem = Math.max(0, ...(projetos ?? []).map((p) => p.ordem)) + 1;
    criar.mutate(
      { nome: nome.trim(), data_inicio: inicio, prazo, status, ordem },
      {
        onSuccess: () => {
          setNome("");
          setInicio("");
          setPrazo("");
          setStatus("a_fazer");
        },
        onError: () => setAddErro("Não foi possível adicionar o projeto."),
      },
    );
  }

  const lista = projetos ?? [];
  const podeAdd = nome.trim() && inicio && prazo;

  return (
    <Card className="p-4">
      {/* Novo projeto */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-12">
        <Input
          className="col-span-2 h-9 sm:col-span-4"
          placeholder="Nome do projeto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Input
          className="col-span-1 h-9 sm:col-span-3"
          type="date"
          aria-label="Início"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
        />
        <Input
          className="col-span-1 h-9 sm:col-span-3"
          type="date"
          aria-label="Prazo"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
        />
        <div className="col-span-1 sm:col-span-1">
          <Select value={status} onValueChange={(v) => setStatus(v as StatusTarefa)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={adicionar}
          disabled={criar.isPending || !podeAdd}
          className="col-span-1 inline-flex h-9 items-center justify-center gap-1 rounded-md bg-fin px-3 text-sm font-medium text-white hover:bg-fin-dark disabled:opacity-50 sm:col-span-1"
          aria-label="Adicionar projeto"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {addErro && (
        <p className="mt-1.5 text-xs text-destructive">{addErro}</p>
      )}

      {/* Lista editável */}
      {lista.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-1 text-left font-medium">Projeto</th>
                <th className="px-2 py-1 text-left font-medium">Início</th>
                <th className="px-2 py-1 text-left font-medium">Prazo</th>
                <th className="px-2 py-1 text-left font-medium">Status</th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((p) => (
                <ProjetoRow key={p.id} p={p} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Clique direto nos campos para editar. Cada projeto vira uma barra na
          linha do tempo acima.
        </p>
      )}
    </Card>
  );
}
