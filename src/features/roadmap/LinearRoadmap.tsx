import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { dataCurta, hojeISO, DIA } from "@/lib/datas";
import { calcularTimeline } from "./timeline";
import { RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

const DEFAULT_TEAM = "Sprint - View";
const LABEL = "12rem";

type LinearProject = {
  id: string;
  name: string;
  description: string | null;
  state: string;
  progress: number;
  startDate: string | null;
  targetDate: string | null;
  url: string;
  color: string | null;
  lead: { name: string } | null;
};

type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  priority: number;
  priorityLabel: string;
  estimate: number | null;
  dueDate: string | null;
  url: string;
  state: { name: string; type: string; color: string };
  assignee: { name: string } | null;
  project: { id: string; name: string } | null;
  updatedAt: string;
};

type LinearData = {
  team: { id: string; name: string; key: string };
  projects: LinearProject[];
  issues: LinearIssue[];
  synced_at: string;
};

function corDoEstado(state: string, corHex?: string | null) {
  if (corHex) return corHex;
  const s = state.toLowerCase();
  if (s === "completed") return "#1B4332";
  if (s === "started") return "#2D6A4F";
  if (s === "planned" || s === "backlog") return "#95D5B2";
  if (s === "canceled" || s === "paused") return "#9CA3AF";
  return "#40916C";
}

function useLinearData(team: string) {
  return useQuery({
    queryKey: ["linear", team],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<LinearData>(
        "linear-sync",
        { body: null, method: "GET" as any, headers: {} as any },
      );
      // supabase.functions.invoke doesn't easily support query params via GET; call fetch directly
      if (error || !data) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linear-sync?team=${encodeURIComponent(team)}`;
        const session = await supabase.auth.getSession();
        const token =
          session.data.session?.access_token ??
          (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Falha ao sincronizar Linear");
        return json as LinearData;
      }
      return data;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

function ProjetosGantt({ projects }: { projects: LinearProject[] }) {
  const hojeIso = hojeISO();
  const tl = useMemo(() => {
    const datas: (string | null)[] = [];
    projects.forEach((p) => {
      datas.push(p.startDate, p.targetDate);
    });
    return calcularTimeline(datas);
  }, [projects]);

  const larguraMin = Math.max(560, tl.semanas * 64 + 192);
  const span = tl.fimMs - tl.inicioMs;

  if (projects.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum project cadastrado neste team do Linear.
      </p>
    );
  }

  return (
    <div className="relative" style={{ minWidth: larguraMin }}>
      <div className="grid" style={{ gridTemplateColumns: `${LABEL} 1fr` }}>
        <div />
        <div className="relative h-4 border-b border-border">
          {Array.from({ length: tl.semanas }, (_, i) => {
            const left = ((i * 7 * DIA) / span) * 100;
            if (left > 100) return null;
            return (
              <div
                key={i}
                className="absolute top-0 border-l border-border/60 pl-1 text-[10px] text-muted-foreground"
                style={{ left: `${left}%` }}
              >
                S{i + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {projects.map((p) => {
          const left = tl.pos(p.startDate) ?? 0;
          const right = tl.pos(p.targetDate) ?? left + 2;
          const width = Math.max(1.5, right - left);
          const bg = corDoEstado(p.state, p.color);
          return (
            <div
              key={p.id}
              className="grid h-9 items-center"
              style={{ gridTemplateColumns: `${LABEL} 1fr` }}
            >
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 truncate pr-2 text-xs font-medium text-fin-dark hover:underline"
                title={p.name}
              >
                <span className="truncate">{p.name}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
              </a>
              <div className="relative h-6">
                <div
                  className="absolute top-0 flex h-6 items-center rounded px-2 text-white"
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: bg }}
                  title={`${p.name}: ${dataCurta(p.startDate)} → ${dataCurta(p.targetDate)} • ${Math.round((p.progress ?? 0) * 100)}%`}
                >
                  <span className="truncate text-[10px] font-medium">
                    {dataCurta(p.startDate)} → {dataCurta(p.targetDate)} · {Math.round((p.progress ?? 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {tl.dentro(hojeIso) && (
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: LABEL, right: 0 }}
          >
            <div className="absolute inset-y-0" style={{ left: `${tl.pos(hojeIso)}%` }}>
              <div className="h-full w-0.5 bg-fin" />
              <span className="absolute -bottom-0.5 left-1 text-[10px] font-semibold text-fin">
                hoje
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IssuesList({ issues }: { issues: LinearIssue[] }) {
  const grupos = useMemo(() => {
    const map = new Map<string, LinearIssue[]>();
    issues.forEach((i) => {
      const key = i.state.name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    });
    const ordem = ["Todo", "In Progress", "In Review", "Backlog", "Done", "Canceled"];
    return Array.from(map.entries()).sort(
      ([a], [b]) => (ordem.indexOf(a) === -1 ? 99 : ordem.indexOf(a)) - (ordem.indexOf(b) === -1 ? 99 : ordem.indexOf(b)),
    );
  }, [issues]);

  if (issues.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhuma issue neste team.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {grupos.map(([estado, lista]) => (
        <div key={estado}>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: lista[0].state.color }}
            />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-fin-dark">
              {estado}
            </h4>
            <span className="text-[10px] text-muted-foreground">{lista.length}</span>
          </div>
          <ul className="divide-y divide-border rounded border border-border">
            {lista.map((i) => (
              <li key={i.id} className="flex items-center gap-2 px-2 py-1.5 text-xs">
                <a
                  href={i.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] text-muted-foreground hover:underline"
                >
                  {i.identifier}
                </a>
                <span className="flex-1 truncate text-fin-dark">{i.title}</span>
                {i.project && (
                  <Badge variant="outline" className="hidden text-[9px] md:inline-flex">
                    {i.project.name}
                  </Badge>
                )}
                {i.assignee && (
                  <span className="hidden text-[10px] text-muted-foreground md:inline">
                    {i.assignee.name}
                  </span>
                )}
                {i.dueDate && (
                  <span className="text-[10px] text-muted-foreground">
                    {dataCurta(i.dueDate)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function LinearRoadmap() {
  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [teamInput, setTeamInput] = useState(DEFAULT_TEAM);
  const { data, isLoading, isFetching, error, refetch } = useLinearData(team);

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-fin-dark">
              Linear · {data?.team.name ?? team}
            </h3>
            {data && (
              <Badge variant="outline" className="text-[10px]">
                {data.team.key}
              </Badge>
            )}
          </div>
          {data && (
            <p className="text-[10px] text-muted-foreground">
              Sincronizado {new Date(data.synced_at).toLocaleTimeString("pt-BR")} · somente leitura
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setTeam(teamInput);
            }}
            placeholder="Nome do team"
            className="h-8 w-40 text-xs"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{(error as Error).message}</span>
        </div>
      )}

      {isLoading && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Carregando dados do Linear…
        </p>
      )}

      {data && (
        <div className="space-y-6">
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fin-dark">
              Projects — linha do tempo
            </h4>
            <div className="overflow-x-auto">
              <ProjetosGantt projects={data.projects} />
            </div>
          </section>
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fin-dark">
              Issues
            </h4>
            <IssuesList issues={data.issues} />
          </section>
        </div>
      )}
    </Card>
  );
}
