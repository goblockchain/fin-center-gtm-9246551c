-- ============================================================================
-- UseFin — 0019_views_piloto_contrato
--
-- BUG: 'piloto' e 'envio_contrato' entraram no enum (0016) mas as views ficaram
-- paradas em ('reuniao','proposta','negociacao','fechado_ganho'). Um lead em
-- Envio de Contrato (praticamente fechado) não contava em reunioes_ou_mais /
-- reunioes: derrubava a taxa_conversao vs. baseline de 2% (§7.2) e podia
-- esconder o estado 'Gerando dados' do canal (§7.1).
--
-- Ordem real do pipe:
--   proposta -> negociacao -> envio_contrato -> piloto -> fechado_ganho
--
-- ATENÇÃO — duas linhagens de migration:
-- Este arquivo reproduz a linhagem GERADA (20260715013830), que é a que está
-- VIVA no banco — e não a 0003_views.sql manual, que tem outra lista e outra
-- ORDEM de colunas (0003 traz prioridade/gate_data e pct_execucao como razão
-- 0–1; a viva traz 'ordem' e pct_execucao como percentual 0–100).
-- `create or replace view` exige nomes e ordem de coluna idênticos, então
-- reproduzir a 0003 aqui falha com 42P16. A 0003 está desatualizada em relação
-- ao banco — resolver essa divergência é trabalho à parte.
--
-- Só as duas listas de estágio mudam em relação à linhagem gerada.
-- ============================================================================

CREATE OR REPLACE VIEW public.canal_execucao
WITH (security_invoker = on) AS
WITH t AS (
  SELECT canal_id,
         COUNT(*) AS total_tarefas,
         COUNT(*) FILTER (WHERE status = 'feito') AS tarefas_feitas
  FROM public.tarefas WHERE canal_id IS NOT NULL GROUP BY canal_id
),
i AS (
  SELECT canal_id,
         COALESCE(SUM(planejado),0) AS investimento_planejado,
         COALESCE(SUM(executado),0) AS investimento_executado
  FROM public.investimentos GROUP BY canal_id
),
o AS (
  SELECT canal_id,
         COUNT(*) AS total_oport,
         COUNT(*) FILTER (WHERE estagio <> 'cadastrado') AS contatados,
         COUNT(*) FILTER (WHERE estagio IN
            ('reuniao','proposta','negociacao','envio_contrato','piloto',
             'fechado_ganho')) AS reunioes_ou_mais,
         COUNT(*) FILTER (WHERE estagio = 'fechado_ganho') AS ganhos
  FROM public.oportunidades GROUP BY canal_id
)
SELECT c.id AS canal_id, c.slug, c.nome, c.ordem,
  COALESCE(t.total_tarefas,0) AS total_tarefas,
  COALESCE(t.tarefas_feitas,0) AS tarefas_feitas,
  CASE WHEN COALESCE(t.total_tarefas,0) = 0 THEN 0
       ELSE ROUND((t.tarefas_feitas::numeric / t.total_tarefas) * 100, 1) END AS pct_execucao,
  COALESCE(i.investimento_planejado,0) AS investimento_planejado,
  COALESCE(i.investimento_executado,0) AS investimento_executado,
  COALESCE(i.investimento_executado,0) - COALESCE(i.investimento_planejado,0) AS variancia,
  CASE WHEN COALESCE(i.investimento_planejado,0) = 0 THEN NULL
       ELSE ROUND(((i.investimento_executado - i.investimento_planejado) / i.investimento_planejado) * 100, 1) END AS variancia_pct,
  COALESCE(o.total_oport,0) AS total_oport,
  COALESCE(o.contatados,0) AS contatados,
  COALESCE(o.reunioes_ou_mais,0) AS reunioes_ou_mais,
  COALESCE(o.ganhos,0) AS ganhos,
  CASE
    WHEN COALESCE(o.reunioes_ou_mais,0) > 0 OR COALESCE(o.ganhos,0) > 0 THEN 'Gerando dados'
    WHEN COALESCE(o.contatados,0) > 0 THEN 'Em execução'
    WHEN COALESCE(t.tarefas_feitas,0) > 0 THEN 'Pronto'
    ELSE 'Em preparação'
  END AS estado
FROM public.canais c
LEFT JOIN t ON t.canal_id = c.id
LEFT JOIN i ON i.canal_id = c.id
LEFT JOIN o ON o.canal_id = c.id;

CREATE OR REPLACE VIEW public.canal_kpis
WITH (security_invoker = on) AS
WITH o AS (
  SELECT canal_id,
    COUNT(*) AS oportunidades,
    COUNT(*) FILTER (WHERE estagio <> 'cadastrado') AS contatados,
    COUNT(*) FILTER (WHERE estagio IN
       ('reuniao','proposta','negociacao','envio_contrato','piloto',
        'fechado_ganho')) AS reunioes,
    COUNT(*) FILTER (WHERE estagio = 'fechado_ganho') AS ganhos,
    COUNT(*) FILTER (WHERE estagio = 'fechado_perdido') AS perdidos,
    COALESCE(SUM(valor_mrr) FILTER (WHERE estagio = 'fechado_ganho'),0) AS mrr_ganho
  FROM public.oportunidades GROUP BY canal_id
),
i AS (
  SELECT canal_id, COALESCE(SUM(executado),0) AS investimento_executado
  FROM public.investimentos GROUP BY canal_id
)
SELECT c.id AS canal_id, c.slug, c.nome,
  COALESCE(o.oportunidades,0) AS oportunidades,
  COALESCE(o.contatados,0) AS contatados,
  COALESCE(o.reunioes,0) AS reunioes,
  COALESCE(o.ganhos,0) AS ganhos,
  COALESCE(o.perdidos,0) AS perdidos,
  COALESCE(o.mrr_ganho,0) AS mrr_ganho,
  CASE WHEN COALESCE(o.contatados,0) = 0 THEN NULL
       ELSE ROUND(o.reunioes::numeric / o.contatados, 4) END AS taxa_conversao,
  CASE WHEN COALESCE(o.contatados,0) = 0 THEN NULL
       ELSE ROUND((o.reunioes::numeric / o.contatados) / 0.02, 2) END AS multiplo_vs_baseline,
  CASE WHEN COALESCE(o.ganhos,0) = 0 THEN NULL
       ELSE ROUND(COALESCE(i.investimento_executado,0) / o.ganhos, 2) END AS cac,
  CASE WHEN COALESCE(i.investimento_executado,0) = 0 THEN NULL
       ELSE ROUND((COALESCE(o.mrr_ganho,0) - i.investimento_executado) / i.investimento_executado, 4) END AS roi
FROM public.canais c
LEFT JOIN o ON o.canal_id = c.id
LEFT JOIN i ON i.canal_id = c.id;
