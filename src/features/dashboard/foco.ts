import { diasAte, relativo, prazoHumano, type Urgencia } from "@/lib/datas";
import type { TarefaComCanal } from "@/features/tarefas/api";
import type { Gate, CanalExecucao } from "@/types/db";

export type Acao = { texto: string; link: string; urgencia: Urgencia };

/**
 * "Foco de hoje" (docs/DASHBOARD.md §1): escolhe a ação principal pela primeira
 * regra que casar; o resto vira ações secundárias.
 */
export function calcularFoco(
  tarefas: TarefaComCanal[],
  gates: Gate[],
  execucoes: CanalExecucao[],
): { principal: Acao | null; secundarias: Acao[] } {
  const acoes: Acao[] = [];
  const statusPorId = new Map(tarefas.map((t) => [t.id, t.status]));
  const desbloqueada = (t: TarefaComCanal) =>
    !t.depende_de || statusPorId.get(t.depende_de) === "feito";

  // 1) Gate iminente (pendente, ≤ 3 dias)
  gates
    .filter((g) => g.status === "pendente")
    .map((g) => ({ g, d: diasAte(g.data) }))
    .filter((x) => x.d != null && x.d >= 0 && x.d <= 3)
    .sort((a, b) => (a.d ?? 0) - (b.d ?? 0))
    .forEach(({ g }) =>
      acoes.push({
        texto: `${g.nome} ${relativo(g.data)}: ${g.criterio ?? "revisar os 5 canais"}`,
        link: "/roadmap",
        urgencia: "perto",
      }),
    );

  // 2) Tarefa vencida, desbloqueada (mais atrasada primeiro)
  tarefas
    .filter(
      (t) =>
        t.status !== "feito" &&
        t.prazo &&
        (diasAte(t.prazo) ?? 0) < 0 &&
        desbloqueada(t),
    )
    .sort((a, b) => (diasAte(a.prazo) ?? 0) - (diasAte(b.prazo) ?? 0))
    .forEach((t) =>
      acoes.push({
        texto: `${prazoHumano(t.prazo)}: ${t.titulo} (${t.frente})`,
        link: "/tarefas",
        urgencia: "vencido",
      }),
    );

  // 3) Tarefa que vence em ≤ 2 dias, desbloqueada
  tarefas
    .filter((t) => {
      const d = diasAte(t.prazo);
      return t.status !== "feito" && d != null && d >= 0 && d <= 2 && desbloqueada(t);
    })
    .sort((a, b) => (diasAte(a.prazo) ?? 0) - (diasAte(b.prazo) ?? 0))
    .forEach((t) =>
      acoes.push({
        texto: `${relativo(t.prazo)}: ${t.titulo} (${t.frente})`,
        link: "/tarefas",
        urgencia: "perto",
      }),
    );

  // 4) Canal "Pronto" e parado (execução pronta, sem contato)
  execucoes
    .filter((e) => e.estado === "Pronto")
    .forEach((e) =>
      acoes.push({
        texto: `${e.nome} está pronto e parado — comece a abordar os leads`,
        link: "/canais",
        urgencia: "perto",
      }),
    );

  // 6) Fallback: próxima tarefa por prazo
  if (acoes.length === 0) {
    const prox = tarefas
      .filter((t) => t.status !== "feito" && t.prazo && desbloqueada(t))
      .sort((a, b) => (diasAte(a.prazo) ?? 9999) - (diasAte(b.prazo) ?? 9999))[0];
    if (prox)
      acoes.push({
        texto: `Próximo: ${prox.titulo} — ${relativo(prox.prazo)} (${prox.frente})`,
        link: "/tarefas",
        urgencia: "ok",
      });
  }

  return { principal: acoes[0] ?? null, secundarias: acoes.slice(1, 4) };
}
