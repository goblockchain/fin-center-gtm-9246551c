# UseFin — Dashboard Inteligente + Tempo Real (canônico)

> Spec do módulo `/` (Dashboard). Implementado em **M9**. Complementa `CLAUDE.md`; em conflito,
> `CLAUDE.md` vence. Nome do produto: **UseFin**.

O Dashboard não é um amontoado de gráficos: é um **assistente de decisão de GTM**. Ele abre dizendo
**o que fazer hoje**, depois mostra **onde está o risco**, e só então os números. Tudo se atualiza
**em tempo real** (Supabase Realtime → invalida os caches do TanStack Query).

**Constante de produto:** `BASELINE_CONVERSAO = 0.02` (2%, contato→reunião do outbound frio).
Toda taxa de conversão exibida é comparada a essa baseline.

---

## 0. Ordem da tela (mobile-first — ação antes de gráfico)

1. **Foco de hoje** (ação) — §1
2. **Saúde dos canais** (frases de risco) — §2
3. **Funil ao vivo** (com gargalo destacado) — §3
4. **Investimento & ROI ao vivo** — §4
5. **Projeção transparente** (fim da janela) — §5

Nada de gráfico acima do "Foco de hoje". No mobile, cada bloco é full-width empilhado.

---

## 1. Foco de hoje (o herói)

Um cartão de destaque (verde escuro, texto claro) com **uma ação principal** e, abaixo, até 3 ações
secundárias. É calculado, não estático.

**Fontes:** `tarefas` (prazo, status, depende_de), `gates` (data), `canal_execucao` (estado),
`oportunidades` (estágios parados).

**Algoritmo de priorização** (escolhe a AÇÃO principal pela primeira regra que casar):
1. **Gate iminente** — se um `gate.status='pendente'` vence em ≤ 3 dias →
   *"Gate 1 em 2 dias (18/jul): revisar os 5 canais — matar / iterar / escalar."*
2. **Tarefa vencida** desbloqueada (dependência feita ou inexistente), ordenada pela mais atrasada →
   *"Atrasado há 1 dia: Rodar A/B de 2 mensagens com 30 decisores (Outbound)."*
3. **Tarefa que vence hoje/amanhã** desbloqueada.
4. **Canal "Pronto" parado** — execução pronta mas 0 contato → *"Outbound está pronto e parado: comece a abordar os 30 decisores."*
5. **Oportunidade quente parada** — `estagio in (reuniao,proposta,negociacao)` sem interação há ≥ 3 dias → *"Faça follow-up: Rede Café X está em negociação há 5 dias sem contato."*
6. Fallback: a próxima tarefa por prazo.

Cada ação é um **link** para o módulo certo (Tarefas/Roadmap/Pipeline/Canais). Tempo sempre em
**linguagem humana relativa** ("em 2 dias", "atrasado há 1 dia"), data crua como secundária.

---

## 2. Saúde dos canais (frases de risco)

Uma linha por canal (5), ordenada por prioridade. Cada linha = **chip de estado** + **frase de
risco/saúde gerada** + mini-indicadores (execução %, conversão vs 2%, dias até o gate).

**Fontes:** `canal_execucao` (estado, pct_execucao, dias_para_gate), `canal_kpis` (taxa_conversao,
ganhos) — KPI só lido quando `estado='Gerando dados'`.

**Geração da frase (primeira que casar):**
- **Sem dado ainda** (`estado ≠ 'Gerando dados'`): descreve execução, nunca inventa conversão.
  *"Em preparação — 0% executado. Setup pendente; gate em 32 dias."*
- **Abaixo da baseline** (`taxa_conversao < 0.02`):
  *"⚠️ Risco: conversão 1,2% (abaixo dos 2%). Candidato a **matar** no Gate 1 (em 12 dias)."*
- **Na média** (`0.02 ≤ taxa < 0.04`, < 2x):
  *"No nível do frio (2,1%). Iterar a mensagem antes do gate."*
- **Acima** (`≥ 2x baseline`):
  *"✅ Forte: 8,5% (4,3× a baseline). Candidato a **escalar**."*
- **Execução travada** (`pct_execucao` baixo perto do gate): acrescenta
  *"…mas só 20% das tarefas feitas a 5 dias do gate."*

Cores: verde (forte), âmbar (na média / prazo curto), vermelho (abaixo da baseline ou atrasado).

---

## 3. Funil ao vivo (detecção automática de gargalo)

Funil dos estágios de `oportunidades`, agregado (com filtro opcional por canal). Recharts (funnel ou
barras horizontais). Atualiza em tempo real.

**Estágios:** cadastrado → contatado → qualificado → reunião → proposta → negociação →
fechado_ganho (com fechado_perdido fora do fluxo principal).

**Detecção de gargalo:** para cada passo i→i+1, calcular a **taxa de passagem** = `n[i+1]/n[i]`.
O **gargalo** é o passo com menor taxa de passagem (ignorando passos com `n[i]=0`). Destacar em
âmbar/vermelho e escrever a frase:
> *"Gargalo: 139 cadastradas → 50 contatadas (36%). 64% travam no 1º contato."*

Exibir, ao lado do funil, a **conversão geral contato→reunião** comparada à baseline:
> *"Contato→reunião: 4% — 2× a baseline de 2%."*

(Os números do exemplo refletem o seed real: 139 cadastradas, 50 contatadas, 6 com decisor.)

---

## 4. Investimento & ROI ao vivo

Tabela/cards por canal a partir de `canal_execucao` (investimento planejado×executado, variância) +
`canal_kpis` (CAC, ROI, MRR ganho). **CAC e ROI vêm das views — nunca de coluna.**

Por canal:
- **Planejado × Executado** lado a lado + **variância** (âmbar se estourou o plano).
- **CAC** = investimento executado / ganhos (só exibe se `ganhos > 0`; senão "—").
- **ROI** = (MRR ganho − investimento executado) / investimento executado (só com dado real).
- Total da sprint no topo (soma dos canais).

Nunca mostrar CAC/ROI como "R$ 0" ou "0%": sem dado real, exibir "—" com tooltip
*"sem fechamento ainda neste canal"*.

---

## 5. Projeção transparente (fim da janela)

Projeção honesta de **reuniões e fechamentos até 24/ago**, **mostrando a conta** (nunca um número
mágico).

**Método (por canal e total):**
- `pipeline_ativo` = oportunidades não fechadas.
- `taxa_atual` = conversão observada do canal (contato→reunião) — se `estado='Gerando dados'`;
  senão usar a **baseline 2%** e **rotular** "usando baseline (sem dado próprio ainda)".
- `semanas_restantes` = (24/ago − hoje) em semanas.
- Projeção = `pipeline_ativo × taxa_atual` (reuniões) e, com a taxa reunião→ganho observada,
  os fechamentos.

Exibir o racional em texto:
> *"Projeção: ~6 reuniões até 24/ago. Base: 150 contas ativas × 4% (sua conversão atual). Se cair
> para a baseline de 2%, ~3 reuniões."*

Sempre mostrar o **cenário baseline (2%)** ao lado do cenário com a taxa real, para transparência.
Marcar claramente como **projeção**, não fato.

---

## 6. Tempo real (Realtime → TanStack Query)

- Assinar canais Realtime do Postgres para: `oportunidades`, `tarefas`, `gates`, `investimentos`,
  `voz_do_cliente`, `contas`.
- Em cada evento (`INSERT/UPDATE/DELETE`), **invalidar as query keys** afetadas do TanStack Query
  (`['canal_execucao']`, `['canal_kpis']`, `['funil']`, `['foco-hoje']`, `['oportunidades']`…),
  disparando refetch. Sem websocket manual de estado: a fonte da verdade é o Postgres + cache do
  TanStack Query.
- Hook único `useRealtime(tabelas, queryKeys)` montado no layout do Dashboard.
- **Critério visível:** arrastar uma oportunidade para `fechado_ganho` no Pipeline (outra aba/janela)
  faz o **funil**, os **KPIs do canal** e a **projeção** do Dashboard mudarem **sem refresh**.

---

## 7. Estados vazios e honestos

- Canal sem dado → blocos de KPI/ROI escondidos ou "—", nunca zeros disfarçados de métrica.
- Funil sem oportunidades → ilustração + CTA "Importe a base no CRM".
- "Foco de hoje" sem pendências → mensagem positiva + próxima tarefa futura.
- Toda data: **humano relativo primeiro**, data crua como apoio.
