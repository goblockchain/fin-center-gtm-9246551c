# REFACTOR.md — Consolidação do UseFin

> Plano de consolidação das 10 seções → ~6 com função única + Dashboard como
> camada de leitura. Priorizado, com antes→depois e decisões marcadas **[D#]**.
> Baseado na auditoria de 10 seções (jun/2026).

## Diagnóstico (validado)

Poucas entidades reais — **Conta/Lead** (212 cafeterias), **Canal**, **Tarefa**,
**Snapshot semanal** — apresentadas em várias telas. A maior parte da redundância é de
**apresentação** (mesmo dado, várias vistas — gerenciável). O grave são os pontos com
**definição divergente** ou **entrada duplicada**, onde os números podem se contradizer.

**Status não são 3 taxonomias, são 2 campos:**
- `oportunidades.estagio` (8 etapas) → o funil. Pipeline (kanban) e a rosca
  "Distribuição de contatos" saem **os dois daqui**, mas com **rótulos diferentes**
  (a rosca renomeia). O "Funil ao vivo" (barras) também — ou seja, o funil aparece 2×
  no próprio Dashboard, com vocabulários distintos.
- `contas.temperatura` (4 níveis) → aquecimento, conceito do CRM, campo **separado**.

## Alvo

| Hoje (10) | Depois (~6 + leitura) |
|---|---|
| Pipeline, CRM | **Leads** (uma superfície, toggle Kanban/Tabela) |
| Canais, (input de investimento do Roadmap) | **Canais** (KPIs + investimento→CAC juntos) |
| Roadmap | **Roadmap** (só gates + timeline) |
| Tarefas | **Tarefas** |
| Mensagens | **Mensagens** |
| Voz do Cliente | **Voz do Cliente** |
| Dashboard, Relatório | **Dashboard** (leitura; PDF vira botão) |
| Crescimento | dobrado em Canais/Leads (ver P3) |

## Plano priorizado

### P0 — Keystone: status único *(destrava a confiança nos números)*
- **Unificar rótulos do funil** [pequeno, faço já]: rosca + barras + Pipeline usam **os
  mesmos rótulos** (`ESTAGIO_META`). Hoje a rosca de "Distribuição de contatos" usa
  outro vocabulário.
- **Papel da `temperatura`** **[D1]**: (a) manter como aquecimento separado do estágio;
  (b) derivar do estágio (sem_contato→cadastrado, etc.); (c) aposentar e usar só estágio.
- **Dedup do CRM** [pequeno-médio]: "440 Bebida Café" aparece 2× (uma "Sem contato",
  outra "Frio"). A base de planilha provavelmente tem mais. Mesclar por nome+telefone.

### P1 — Unificar Leads (Pipeline + CRM) **[D2]**
- Uma seção **Leads** com toggle **Kanban / Tabela** sobre os mesmos dados.
- **Kanban só etapas ativas** (Qualificado→Fechado, ~11 cards). O grosso "sem contato"
  (161) vive na **tabela filtrável** — ninguém arrasta 161 cards.
- **Ação em massa** (mudar etapa/canal de vários de uma vez).

### P2 — Relatório → botão "Exportar PDF" no Dashboard **[D3]**
- O "Resumo executivo" do Relatório = os mesmos cards/tabelas do Dashboard. Remove a
  seção; o PDF vira **uma ação do Dashboard** (a aba Relatório já é `print:`-friendly).

### P3 — Sistema único de canal **[D4]**
- Comunidade/Parcerias/Eventos **são canais** (Base Yungas=parceria, MGM=comunidade).
  Já existe `canais.tipo`. Decisão: os leads/clientes/R$ dessas frentes entram como
  **oportunidades no pipe** (uma fonte só); **Crescimento** fica apenas com métricas que
  **não** vêm do pipe (membros, conversas, participação) — sem reentrada de receita.
- Evita **contagem dupla** (lead de parceria no pipe **e** agregado em Crescimento).

### P4 — Investimento dentro de Canais **[D5]**
- O input "Modelo dos canais — Investimento→CAC" hoje vive no **Roadmap** mas é exibido
  em Canais/Dashboard. Mover o input pra **Canais** (editar e ver no mesmo lugar).
  Roadmap = gates + timeline + custos/metas.

### P5 — Eficiência de operação
- **Captura semanal**: o snapshot já roda no pg_cron (sexta 18h); garantir que um buraco
  de semana não quebre a série (preencher 0 vs. pular).

## Decisões que preciso de você
- **[D1]** Temperatura: aquecimento separado · derivar do estágio · aposentar?
- **[D2]** Unir Pipeline + CRM numa seção "Leads" (toggle Kanban/Tabela)?
- **[D3]** Relatório vira botão "Exportar PDF" no Dashboard (remove a seção)?
- **[D4]** Frentes de Crescimento entram como canais no pipe (fonte única)?
- **[D5]** Mover input de investimento do Roadmap para Canais?

## Ordem de execução sugerida
P0 (keystone) → P2 (Relatório→botão, rápido) → P4 (investimento, rápido) → P1 (Leads,
maior) → P3 (canal único, maior). Cada um em commit pequeno, com checkpoint.
