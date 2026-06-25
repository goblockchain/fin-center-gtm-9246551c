-- ============================================================================
-- UseFin — 0015_parceiro_evento_kpis
-- Views de funil POR parceiro/evento, derivadas do pipe (oportunidades.parceiro_id
-- / evento_id). Fonte única — Crescimento lê daqui em vez de entrada manual.
-- security_invoker = herda a RLS das tabelas-base.
-- ============================================================================

create or replace view parceiro_kpis with (security_invoker=on) as
select p.id as parceiro_id, p.nome, p.ativo,
  count(o.id) as leads,
  count(o.id) filter (where o.estagio in ('reuniao','proposta','negociacao','fechado_ganho')) as reunioes,
  count(o.id) filter (where o.estagio='fechado_ganho') as clientes,
  coalesce(sum(o.valor_mrr) filter (where o.estagio='fechado_ganho'), 0)::numeric as mrr
from parceiros p
left join oportunidades o on o.parceiro_id = p.id
group by p.id, p.nome, p.ativo;

create or replace view evento_kpis with (security_invoker=on) as
select e.id as evento_id, e.nome, e.data, e.participantes, e.custo,
  count(o.id) as leads,
  count(o.id) filter (where o.estagio in ('reuniao','proposta','negociacao','fechado_ganho')) as reunioes,
  count(o.id) filter (where o.estagio='fechado_ganho') as clientes,
  coalesce(sum(o.valor_mrr) filter (where o.estagio='fechado_ganho'), 0)::numeric as mrr
from eventos e
left join oportunidades o on o.evento_id = e.id
group by e.id, e.nome, e.data, e.participantes, e.custo;
