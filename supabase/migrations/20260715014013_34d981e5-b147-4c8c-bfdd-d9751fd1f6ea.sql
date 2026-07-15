
ALTER TABLE public.oportunidades
  ADD COLUMN parceiro_id uuid REFERENCES public.parceiros(id) ON DELETE SET NULL,
  ADD COLUMN evento_id   uuid REFERENCES public.eventos(id)   ON DELETE SET NULL;

CREATE OR REPLACE VIEW public.parceiro_kpis
WITH (security_invoker = on) AS
WITH o AS (
  SELECT parceiro_id,
    COUNT(*) AS leads,
    COUNT(*) FILTER (WHERE estagio IN ('reuniao','proposta','negociacao','fechado_ganho')) AS reunioes,
    COUNT(*) FILTER (WHERE estagio = 'fechado_ganho') AS clientes,
    COALESCE(SUM(valor_mrr) FILTER (WHERE estagio = 'fechado_ganho'),0) AS mrr
  FROM public.oportunidades
  WHERE parceiro_id IS NOT NULL
  GROUP BY parceiro_id
)
SELECT p.id AS parceiro_id, p.nome, p.ativo,
  COALESCE(o.leads,0)    AS leads,
  COALESCE(o.reunioes,0) AS reunioes,
  COALESCE(o.clientes,0) AS clientes,
  COALESCE(o.mrr,0)      AS mrr
FROM public.parceiros p
LEFT JOIN o ON o.parceiro_id = p.id;
GRANT SELECT ON public.parceiro_kpis TO authenticated;

CREATE OR REPLACE VIEW public.evento_kpis
WITH (security_invoker = on) AS
WITH o AS (
  SELECT evento_id,
    COUNT(*) AS leads,
    COUNT(*) FILTER (WHERE estagio IN ('reuniao','proposta','negociacao','fechado_ganho')) AS reunioes,
    COUNT(*) FILTER (WHERE estagio = 'fechado_ganho') AS clientes,
    COALESCE(SUM(valor_mrr) FILTER (WHERE estagio = 'fechado_ganho'),0) AS mrr
  FROM public.oportunidades
  WHERE evento_id IS NOT NULL
  GROUP BY evento_id
)
SELECT e.id AS evento_id, e.nome, e.data,
  e.investido AS custo,
  e.leads_gerados AS participantes,
  COALESCE(o.leads,0)    AS leads,
  COALESCE(o.reunioes,0) AS reunioes,
  COALESCE(o.clientes,0) AS clientes,
  COALESCE(o.mrr,0)      AS mrr
FROM public.eventos e
LEFT JOIN o ON o.evento_id = e.id;
GRANT SELECT ON public.evento_kpis TO authenticated;
