
-- ============ ENUMS ============
CREATE TYPE public.temperatura AS ENUM ('sem_contato','frio','morno','quente');
CREATE TYPE public.estagio_oport AS ENUM ('cadastrado','contatado','qualificado','reuniao','proposta','negociacao','fechado_ganho','fechado_perdido');
CREATE TYPE public.status_tarefa AS ENUM ('a_fazer','fazendo','feito');
CREATE TYPE public.tipo_interacao AS ENUM ('whatsapp','ligacao','visita','reuniao','email','outro');
CREATE TYPE public.papel_contato AS ENUM ('decisor','gatekeeper','influenciador','outro');
CREATE TYPE public.tipo_voz AS ENUM ('depoimento','mensagem','narrativa','relatorio');
CREATE TYPE public.status_mensagem AS ENUM ('rascunho','enviado','respondido','sem_resposta');
CREATE TYPE public.status_gate AS ENUM ('pendente','concluido');
CREATE TYPE public.tipo_custo AS ENUM ('horas','ferramentas','midia','comissao','operacional');
CREATE TYPE public.status_projeto AS ENUM ('a_fazer','fazendo','feito');

-- ============ TRIGGER: updated_at ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ CANAIS ============
CREATE TABLE public.canais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'outbound',
  prioridade int NOT NULL DEFAULT 0,
  hipotese text,
  teste_minimo text,
  metrica_sucesso text,
  meta_vs_baseline text,
  dependencia text,
  responsavel text,
  gate_data date,
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canais TO authenticated;
GRANT ALL ON public.canais TO service_role;
ALTER TABLE public.canais ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_canais ON public.canais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_canais_updated BEFORE UPDATE ON public.canais FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ INVESTIMENTOS ============
CREATE TABLE public.investimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id uuid NOT NULL REFERENCES public.canais(id) ON DELETE CASCADE,
  planejado numeric(12,2) NOT NULL DEFAULT 0,
  executado numeric(12,2) NOT NULL DEFAULT 0,
  periodo text,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investimentos TO authenticated;
GRANT ALL ON public.investimentos TO service_role;
ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_investimentos ON public.investimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_investimentos_updated BEFORE UPDATE ON public.investimentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CONTAS ============
CREATE TABLE public.contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  endereco text,
  bairro text,
  telefone text,
  instagram text,
  canal_origem_id uuid NOT NULL REFERENCES public.canais(id),
  temperatura public.temperatura NOT NULL DEFAULT 'sem_contato',
  responsavel text,
  visitada boolean NOT NULL DEFAULT false,
  entrevista_agendada boolean NOT NULL DEFAULT false,
  gatekeeper text,
  data_primeiro_contato date,
  proxima_acao text,
  obs text,
  ref_externa text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contas TO authenticated;
GRANT ALL ON public.contas TO service_role;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_contas ON public.contas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_contas_updated BEFORE UPDATE ON public.contas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CONTATOS ============
CREATE TABLE public.contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id uuid NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  papel public.papel_contato NOT NULL DEFAULT 'outro',
  telefone text,
  instagram text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contatos TO authenticated;
GRANT ALL ON public.contatos TO service_role;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_contatos ON public.contatos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ INTERACOES ============
CREATE TABLE public.interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id uuid NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  canal_id uuid REFERENCES public.canais(id),
  tipo public.tipo_interacao NOT NULL DEFAULT 'whatsapp',
  data date NOT NULL DEFAULT current_date,
  resumo text,
  autor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interacoes TO authenticated;
GRANT ALL ON public.interacoes TO service_role;
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_interacoes ON public.interacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ OPORTUNIDADES ============
CREATE TABLE public.oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id uuid NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  canal_id uuid NOT NULL REFERENCES public.canais(id),
  estagio public.estagio_oport NOT NULL DEFAULT 'cadastrado',
  valor_mrr numeric(12,2) NOT NULL DEFAULT 0,
  probabilidade int,
  data_entrada_estagio date NOT NULL DEFAULT current_date,
  previsao_fechamento date,
  motivo_perda text,
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oportunidades TO authenticated;
GRANT ALL ON public.oportunidades TO service_role;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_oportunidades ON public.oportunidades FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_oportunidades_updated BEFORE UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ TAREFAS ============
CREATE TABLE public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  canal_id uuid REFERENCES public.canais(id),
  frente text NOT NULL,
  titulo text NOT NULL,
  responsavel text,
  data_inicio date,
  prazo date,
  status public.status_tarefa NOT NULL DEFAULT 'a_fazer',
  depende_de uuid REFERENCES public.tarefas(id),
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas TO authenticated;
GRANT ALL ON public.tarefas TO service_role;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_tarefas ON public.tarefas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_tarefas_updated BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ GATES ============
CREATE TABLE public.gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  data date NOT NULL,
  criterio text,
  decisao_possivel text,
  ordem int NOT NULL DEFAULT 0,
  status public.status_gate NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gates TO authenticated;
GRANT ALL ON public.gates TO service_role;
ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_gates ON public.gates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ MODELOS DE MENSAGEM ============
CREATE TABLE public.modelos_mensagem (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id uuid REFERENCES public.canais(id),
  estagio public.estagio_oport,
  titulo text NOT NULL,
  corpo text NOT NULL,
  variante text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modelos_mensagem TO authenticated;
GRANT ALL ON public.modelos_mensagem TO service_role;
ALTER TABLE public.modelos_mensagem ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_modelos_mensagem ON public.modelos_mensagem FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_modelos_updated BEFORE UPDATE ON public.modelos_mensagem FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MENSAGENS LOG ============
CREATE TABLE public.mensagens_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id uuid REFERENCES public.modelos_mensagem(id),
  conta_id uuid REFERENCES public.contas(id) ON DELETE CASCADE,
  canal_id uuid REFERENCES public.canais(id),
  variante text,
  status_manual public.status_mensagem NOT NULL DEFAULT 'rascunho',
  enviado_em timestamptz,
  observacao text,
  autor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens_log TO authenticated;
GRANT ALL ON public.mensagens_log TO service_role;
ALTER TABLE public.mensagens_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_mensagens_log ON public.mensagens_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ VOZ DO CLIENTE ============
CREATE TABLE public.voz_do_cliente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id uuid REFERENCES public.contas(id) ON DELETE SET NULL,
  tipo public.tipo_voz NOT NULL DEFAULT 'depoimento',
  titulo text,
  conteudo text NOT NULL,
  autor_cliente text,
  resultado_mensuravel text,
  autorizado boolean NOT NULL DEFAULT false,
  imagem_url text,
  fixado_como_prova boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voz_do_cliente TO authenticated;
GRANT ALL ON public.voz_do_cliente TO service_role;
ALTER TABLE public.voz_do_cliente ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_voz ON public.voz_do_cliente FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_voz_updated BEFORE UPDATE ON public.voz_do_cliente FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CUSTOS (economia por canal) ============
CREATE TABLE public.custos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id uuid NOT NULL REFERENCES public.canais(id) ON DELETE CASCADE,
  tipo_custo public.tipo_custo NOT NULL,
  descricao text,
  valor numeric(12,2) NOT NULL DEFAULT 0,
  horas numeric(8,2),
  competencia date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custos TO authenticated;
GRANT ALL ON public.custos TO service_role;
ALTER TABLE public.custos ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_custos ON public.custos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_custos_updated BEFORE UPDATE ON public.custos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ METAS mensais ============
CREATE TABLE public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia date NOT NULL,
  mrr_meta numeric(12,2) NOT NULL DEFAULT 0,
  clientes_meta int NOT NULL DEFAULT 0,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competencia)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas TO authenticated;
GRANT ALL ON public.metas TO service_role;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_metas ON public.metas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_metas_updated BEFORE UPDATE ON public.metas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PROJETOS (linha do tempo do Roadmap) ============
CREATE TABLE public.projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  data_inicio date,
  prazo date,
  status public.status_projeto NOT NULL DEFAULT 'a_fazer',
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projetos TO authenticated;
GRANT ALL ON public.projetos TO service_role;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_projetos ON public.projetos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_projetos_updated BEFORE UPDATE ON public.projetos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ COMUNIDADE / PARCEIROS / EVENTOS ============
CREATE TABLE public.comunidade_metricas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia date NOT NULL,
  membros int NOT NULL DEFAULT 0,
  ativos int NOT NULL DEFAULT 0,
  conversas int NOT NULL DEFAULT 0,
  participacao_pct numeric(5,2),
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunidade_metricas TO authenticated;
GRANT ALL ON public.comunidade_metricas TO service_role;
ALTER TABLE public.comunidade_metricas ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_comunidade ON public.comunidade_metricas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_comunidade_updated BEFORE UPDATE ON public.comunidade_metricas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  contato text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parceiros TO authenticated;
GRANT ALL ON public.parceiros TO service_role;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_parceiros ON public.parceiros FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_parceiros_updated BEFORE UPDATE ON public.parceiros FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  data date,
  investido numeric(12,2) NOT NULL DEFAULT 0,
  leads_gerados int NOT NULL DEFAULT 0,
  clientes int NOT NULL DEFAULT 0,
  mrr numeric(12,2) NOT NULL DEFAULT 0,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_eventos ON public.eventos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_eventos_updated BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SNAPSHOTS SEMANAIS ============
CREATE TABLE public.snapshots_semanais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_date date NOT NULL,
  canal_id uuid REFERENCES public.canais(id),
  oportunidades int NOT NULL DEFAULT 0,
  reunioes int NOT NULL DEFAULT 0,
  ganhos int NOT NULL DEFAULT 0,
  mrr numeric(12,2) NOT NULL DEFAULT 0,
  investido numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.snapshots_semanais TO authenticated;
GRANT ALL ON public.snapshots_semanais TO service_role;
ALTER TABLE public.snapshots_semanais ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_all_snapshots ON public.snapshots_semanais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ VIEWS ============

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
         COUNT(*) FILTER (WHERE estagio IN ('reuniao','proposta','negociacao','fechado_ganho')) AS reunioes_ou_mais,
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
GRANT SELECT ON public.canal_execucao TO authenticated;

CREATE OR REPLACE VIEW public.canal_kpis
WITH (security_invoker = on) AS
WITH o AS (
  SELECT canal_id,
    COUNT(*) AS oportunidades,
    COUNT(*) FILTER (WHERE estagio <> 'cadastrado') AS contatados,
    COUNT(*) FILTER (WHERE estagio IN ('reuniao','proposta','negociacao','fechado_ganho')) AS reunioes,
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
GRANT SELECT ON public.canal_kpis TO authenticated;

CREATE OR REPLACE VIEW public.canal_economia
WITH (security_invoker = on) AS
WITH cst AS (
  SELECT canal_id, COALESCE(SUM(valor),0) AS custo_total, COALESCE(SUM(horas),0) AS horas_total
  FROM public.custos GROUP BY canal_id
),
o AS (
  SELECT canal_id,
    COUNT(*) FILTER (WHERE estagio = 'fechado_ganho') AS ganhos,
    COALESCE(SUM(valor_mrr) FILTER (WHERE estagio = 'fechado_ganho'),0) AS mrr_ganho
  FROM public.oportunidades GROUP BY canal_id
),
i AS (
  SELECT canal_id, COALESCE(SUM(executado),0) AS investimento_executado
  FROM public.investimentos GROUP BY canal_id
)
SELECT c.id AS canal_id, c.slug, c.nome, c.tipo,
  COALESCE(cst.custo_total, i.investimento_executado, 0) AS custo_total,
  COALESCE(cst.horas_total,0) AS horas_total,
  COALESCE(o.ganhos,0) AS clientes,
  COALESCE(o.mrr_ganho,0) AS mrr_ganho,
  CASE WHEN COALESCE(o.ganhos,0) = 0 OR COALESCE(cst.custo_total, i.investimento_executado, 0) = 0 THEN NULL
       ELSE ROUND(COALESCE(cst.custo_total, i.investimento_executado, 0) / o.ganhos, 2) END AS cac,
  CASE WHEN COALESCE(o.mrr_ganho,0) = 0 THEN NULL
       ELSE ROUND(COALESCE(cst.custo_total, i.investimento_executado, 0) / o.mrr_ganho, 2) END AS payback_meses,
  CASE WHEN COALESCE(cst.custo_total, i.investimento_executado, 0) = 0 THEN NULL
       ELSE ROUND((o.mrr_ganho - COALESCE(cst.custo_total, i.investimento_executado, 0)) / COALESCE(cst.custo_total, i.investimento_executado, 0), 4) END AS roi
FROM public.canais c
LEFT JOIN cst ON cst.canal_id = c.id
LEFT JOIN o ON o.canal_id = c.id
LEFT JOIN i ON i.canal_id = c.id;
GRANT SELECT ON public.canal_economia TO authenticated;

CREATE OR REPLACE VIEW public.pipeline_semana
WITH (security_invoker = on) AS
SELECT date_trunc('week', created_at)::date AS semana,
  COUNT(*) AS oportunidades,
  COUNT(*) FILTER (WHERE estagio IN ('reuniao','proposta','negociacao','fechado_ganho')) AS reunioes,
  COUNT(*) FILTER (WHERE estagio = 'fechado_ganho') AS ganhos,
  COALESCE(SUM(valor_mrr) FILTER (WHERE estagio = 'fechado_ganho'),0) AS mrr_ganho
FROM public.oportunidades
GROUP BY 1
ORDER BY 1 DESC;
GRANT SELECT ON public.pipeline_semana TO authenticated;

-- ============ SEED: 5 canais + 2 gates ============
INSERT INTO public.canais (slug, nome, tipo, prioridade, ordem, gate_data) VALUES
  ('base-yungas',       'Base Yungas',        'parceria',   1, 1, DATE '2026-07-18'),
  ('member-get-member', 'Member-get-member',  'indicacao',  2, 2, DATE '2026-07-18'),
  ('indicacoes',        'Indicações',         'indicacao',  3, 3, DATE '2026-08-22'),
  ('outbound',          'Outbound',           'outbound',   4, 4, DATE '2026-08-22'),
  ('inbound',           'Inbound',            'inbound',    5, 5, DATE '2026-08-22');

INSERT INTO public.gates (nome, data, ordem, criterio) VALUES
  ('Gate 1 — meio',  DATE '2026-07-18', 1, 'Avaliar sinais iniciais de cada canal'),
  ('Gate 2 — final', DATE '2026-08-22', 2, 'Decidir quais canais escalar após a sprint');
