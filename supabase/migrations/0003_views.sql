-- ============================================================================
-- UseFin — 0003_views
-- canal_execucao e canal_kpis. CAC e ROI vivem AQUI — nunca em coluna. (CLAUDE.md §7)
-- security_invoker = on => as views respeitam a RLS das tabelas-base.
-- Baseline de conversão (contato→reunião) = 2% (0.02).
-- ============================================================================

-- ---------- canal_execucao: % execução, estado derivado, variância ----------
create or replace view canal_execucao
with (security_invoker = on) as
with t as (
  select canal_id,
         count(*)                                  as total_tarefas,
         count(*) filter (where status = 'feito')  as tarefas_feitas
  from tarefas
  where canal_id is not null
  group by canal_id
),
o as (
  select canal_id,
         count(*)                                                          as total_oport,
         count(*) filter (where estagio <> 'cadastrado')                   as contatados,
         count(*) filter (where estagio in
            ('reuniao','proposta','negociacao','fechado_ganho'))           as reunioes_ou_mais,
         count(*) filter (where estagio = 'fechado_ganho')                 as ganhos
  from oportunidades
  group by canal_id
),
inv as (
  select canal_id, sum(planejado) as planejado, sum(executado) as executado
  from investimentos
  group by canal_id
)
select
  c.id as canal_id, c.slug, c.nome, c.prioridade, c.gate_data, c.ordem,
  coalesce(t.total_tarefas, 0)  as total_tarefas,
  coalesce(t.tarefas_feitas, 0) as tarefas_feitas,
  case when coalesce(t.total_tarefas, 0) = 0 then 0
       else round(t.tarefas_feitas::numeric / t.total_tarefas, 4) end as pct_execucao,
  coalesce(inv.planejado, 0) as investimento_planejado,
  coalesce(inv.executado, 0) as investimento_executado,
  coalesce(inv.executado, 0) - coalesce(inv.planejado, 0) as variancia,
  case when coalesce(inv.planejado, 0) = 0 then null
       else round((coalesce(inv.executado,0) - inv.planejado) / inv.planejado, 4) end as variancia_pct,
  coalesce(o.total_oport, 0)      as total_oport,
  coalesce(o.contatados, 0)       as contatados,
  coalesce(o.reunioes_ou_mais, 0) as reunioes_ou_mais,
  coalesce(o.ganhos, 0)           as ganhos,
  -- estado derivado (dado real ganha de execução de tarefa)
  case
    when coalesce(o.reunioes_ou_mais,0) > 0 or coalesce(o.ganhos,0) > 0 then 'Gerando dados'
    when coalesce(o.contatados,0) > 0                                   then 'Em execução'
    when coalesce(t.tarefas_feitas,0) > 0                               then 'Pronto'
    else 'Em preparação'
  end as estado
from canais c
left join t   on t.canal_id   = c.id
left join o   on o.canal_id   = c.id
left join inv on inv.canal_id = c.id;

-- ---------- canal_kpis: só faz sentido em 'Gerando dados' (a UI esconde fora disso) ----------
create or replace view canal_kpis
with (security_invoker = on) as
with o as (
  select canal_id,
         count(*)                                                  as oportunidades,
         count(*) filter (where estagio <> 'cadastrado')           as contatados,
         count(*) filter (where estagio in
            ('reuniao','proposta','negociacao','fechado_ganho'))   as reunioes,
         count(*) filter (where estagio = 'fechado_ganho')         as ganhos,
         count(*) filter (where estagio = 'fechado_perdido')       as perdidos,
         coalesce(sum(valor_mrr) filter (where estagio = 'fechado_ganho'), 0) as mrr_ganho
  from oportunidades
  group by canal_id
),
inv as (
  select canal_id, sum(executado) as executado
  from investimentos
  group by canal_id
)
select
  c.id as canal_id, c.slug, c.nome,
  coalesce(o.oportunidades, 0) as oportunidades,
  coalesce(o.contatados, 0)    as contatados,
  coalesce(o.reunioes, 0)      as reunioes,
  coalesce(o.ganhos, 0)        as ganhos,
  coalesce(o.perdidos, 0)      as perdidos,
  -- conversão contato→reunião (comparar com baseline 2%)
  case when coalesce(o.contatados,0) = 0 then null
       else round(o.reunioes::numeric / o.contatados, 4) end as taxa_conversao,
  case when coalesce(o.contatados,0) = 0 then null
       else round((o.reunioes::numeric / o.contatados) / 0.02, 2) end as multiplo_vs_baseline,
  coalesce(o.mrr_ganho, 0) as mrr_ganho,
  -- CAC = investimento executado / ganhos (calculado, nunca armazenado)
  case when coalesce(o.ganhos,0) = 0 then null
       else round(coalesce(inv.executado,0)::numeric / o.ganhos, 2) end as cac,
  -- ROI = (mrr ganho - investimento executado) / investimento executado
  case when coalesce(inv.executado,0) = 0 then null
       else round((coalesce(o.mrr_ganho,0) - inv.executado) / inv.executado, 4) end as roi
from canais c
left join o   on o.canal_id   = c.id
left join inv on inv.canal_id = c.id;
