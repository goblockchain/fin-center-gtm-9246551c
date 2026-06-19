import { useEffect, useMemo, useState } from "react";
import { Users, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl, pct } from "@/lib/format";
import { useCanalEconomia, useCanalExecucao } from "@/features/canais/api";
import { competencia } from "@/features/economia/api";
import { useComunidade, useUpsertComunidade } from "./api";

function Tile({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div className="rounded-md bg-secondary/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-fin-dark">{valor}</p>
    </div>
  );
}

export function ComunidadeSecao() {
  const { data: metricas } = useComunidade();
  const { data: economia } = useCanalEconomia();
  const { data: execucoes } = useCanalExecucao();
  const upsert = useUpsertComunidade();

  const [comp, setComp] = useState(competencia().slice(0, 7));
  const [tot, setTot] = useState("");
  const [ativos, setAtivos] = useState("");
  const [conversas, setConversas] = useState("");
  const [part, setPart] = useState("");

  const existente = useMemo(
    () => (metricas ?? []).find((m) => m.competencia.slice(0, 7) === comp),
    [metricas, comp],
  );
  useEffect(() => {
    setTot(existente ? String(existente.membros_totais) : "");
    setAtivos(existente ? String(existente.membros_ativos) : "");
    setConversas(existente ? String(existente.conversas_iniciadas) : "");
    setPart(existente ? String(existente.participacao_semanal) : "");
  }, [existente]);

  // Funil derivado dos canais de tipo "comunidade".
  const funil = useMemo(() => {
    const ids = new Set(
      (economia ?? [])
        .filter((e) => e.tipo === "comunidade")
        .map((e) => e.canal_id),
    );
    const clientes = (economia ?? [])
      .filter((e) => e.tipo === "comunidade")
      .reduce((s, e) => s + Number(e.clientes ?? 0), 0);
    const mrr = (economia ?? [])
      .filter((e) => e.tipo === "comunidade")
      .reduce((s, e) => s + Number(e.mrr_ganho ?? 0), 0);
    const ex = (execucoes ?? []).filter((e) => ids.has(e.canal_id));
    const leads = ex.reduce((s, e) => s + Number(e.total_oport ?? 0), 0);
    const sql = ex.reduce((s, e) => s + Number(e.reunioes_ou_mais ?? 0), 0);
    return { leads, sql, clientes, mrr };
  }, [economia, execucoes]);

  const atual = metricas?.[0];
  const ativosN = Number(atual?.membros_ativos ?? 0);
  const taxa = ativosN > 0 ? funil.clientes / ativosN : null;
  const mrrPorMembro = ativosN > 0 ? funil.mrr / ativosN : null;

  function salvar() {
    upsert.mutate({
      competencia: `${comp}-01`,
      membros_totais: Number(tot) || 0,
      membros_ativos: Number(ativos) || 0,
      conversas_iniciadas: Number(conversas) || 0,
      participacao_semanal: Number(part) || 0,
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-fin" />
          <h2 className="text-sm font-semibold text-fin-dark">
            Comunidade (community-led growth)
          </h2>
        </div>

        {/* Entrada mensal */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          <label className="text-[11px] text-muted-foreground">
            Mês
            <Input
              type="month"
              value={comp}
              onChange={(e) => setComp(e.target.value)}
              className="mt-1 h-9"
            />
          </label>
          <label className="text-[11px] text-muted-foreground">
            Membros
            <Input
              type="number"
              min={0}
              value={tot}
              onChange={(e) => setTot(e.target.value)}
              className="mt-1 h-9"
            />
          </label>
          <label className="text-[11px] text-muted-foreground">
            Ativos
            <Input
              type="number"
              min={0}
              value={ativos}
              onChange={(e) => setAtivos(e.target.value)}
              className="mt-1 h-9"
            />
          </label>
          <label className="text-[11px] text-muted-foreground">
            Conversas
            <Input
              type="number"
              min={0}
              value={conversas}
              onChange={(e) => setConversas(e.target.value)}
              className="mt-1 h-9"
            />
          </label>
          <label className="text-[11px] text-muted-foreground">
            Particip./sem
            <Input
              type="number"
              min={0}
              value={part}
              onChange={(e) => setPart(e.target.value)}
              className="mt-1 h-9"
            />
          </label>
          <button
            type="button"
            onClick={salvar}
            disabled={upsert.isPending}
            className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-fin px-3 text-sm font-medium text-white hover:bg-fin-dark disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {existente ? "Atualizar" : "Salvar"}
          </button>
        </div>

        {/* KPIs derivados (mês mais recente + funil dos canais comunidade) */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <Tile label="Membros" valor={atual?.membros_totais ?? "—"} />
          <Tile label="Ativos" valor={ativosN || "—"} />
          <Tile label="Conversas" valor={atual?.conversas_iniciadas ?? "—"} />
          <Tile label="Leads (canal)" valor={funil.leads} />
          <Tile label="Reuniões" valor={funil.sql} />
          <Tile label="Clientes" valor={funil.clientes} />
          <Tile
            label="Conv. comunidade"
            valor={taxa != null ? pct(taxa, 1) : "—"}
          />
          <Tile
            label="MRR/membro ativo"
            valor={mrrPorMembro != null ? brl(mrrPorMembro) : "—"}
          />
        </div>
        {!atual && (
          <p className="mt-2 text-xs text-muted-foreground">
            Registre os membros do mês para ver conversão da comunidade e MRR por
            membro ativo. Leads/reuniões/clientes vêm dos canais de tipo
            “comunidade”.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
