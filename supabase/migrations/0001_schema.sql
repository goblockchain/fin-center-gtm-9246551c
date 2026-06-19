-- ============================================================================
-- UseFin — 0001_schema
-- Enums, tabelas, triggers de updated_at. (CLAUDE.md §6)
-- canal_origem é SEMPRE FK para canais. CAC/ROI NUNCA são colunas (ver 0003_views).
-- ============================================================================

-- ---------- Enums ----------
create type temperatura     as enum ('sem_contato','frio','morno','quente');
create type estagio_oport   as enum (
  'cadastrado','contatado','qualificado','reuniao','proposta','negociacao',
  'fechado_ganho','fechado_perdido');
create type status_tarefa   as enum ('a_fazer','fazendo','feito');
create type tipo_interacao  as enum ('whatsapp','ligacao','visita','reuniao','email','outro');
create type papel_contato   as enum ('decisor','gatekeeper','influenciador','outro');
create type tipo_voz        as enum ('depoimento','mensagem','narrativa','relatorio');
create type status_mensagem as enum ('rascunho','enviado','respondido','sem_resposta');
create type status_gate     as enum ('pendente','concluido');

-- ---------- updated_at automático ----------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Canais (unidade central) ----------
create table canais (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  nome             text not null,
  prioridade       int  not null,
  hipotese         text,
  teste_minimo     text,
  metrica_sucesso  text,
  meta_vs_baseline text,
  dependencia      text,
  responsavel      text,
  gate_data        date,
  ordem            int  not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- Investimento por canal ----------
create table investimentos (
  id         uuid primary key default gen_random_uuid(),
  canal_id   uuid not null references canais(id) on delete cascade,
  planejado  numeric(12,2) not null default 0,
  executado  numeric(12,2) not null default 0,
  periodo    text,
  descricao  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Contas (cafeterias / leads) ----------
create table contas (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null,
  endereco              text,
  bairro                text,
  telefone              text,
  instagram             text,
  canal_origem_id       uuid not null references canais(id),
  temperatura           temperatura not null default 'sem_contato',
  responsavel           text,
  visitada              boolean not null default false,
  entrevista_agendada   boolean not null default false,
  gatekeeper            text,
  data_primeiro_contato date,
  proxima_acao          text,
  obs                   text,
  ref_externa           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on contas (canal_origem_id);
create index on contas (temperatura);

-- ---------- Contatos da conta ----------
create table contatos (
  id         uuid primary key default gen_random_uuid(),
  conta_id   uuid not null references contas(id) on delete cascade,
  nome       text not null,
  papel      papel_contato not null default 'outro',
  telefone   text,
  instagram  text,
  email      text,
  created_at timestamptz not null default now()
);
create index on contatos (conta_id);

-- ---------- Interações ----------
create table interacoes (
  id         uuid primary key default gen_random_uuid(),
  conta_id   uuid not null references contas(id) on delete cascade,
  canal_id   uuid references canais(id),
  tipo       tipo_interacao not null default 'whatsapp',
  data       date not null default current_date,
  resumo     text,
  autor      text,
  created_at timestamptz not null default now()
);
create index on interacoes (conta_id);

-- ---------- Oportunidades (pipeline) ----------
create table oportunidades (
  id                   uuid primary key default gen_random_uuid(),
  conta_id             uuid not null references contas(id) on delete cascade,
  canal_id             uuid not null references canais(id),
  estagio              estagio_oport not null default 'cadastrado',
  valor_mrr            numeric(12,2) not null default 0,
  probabilidade        int,
  data_entrada_estagio date not null default current_date,
  previsao_fechamento  date,
  motivo_perda         text,
  responsavel          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index on oportunidades (canal_id);
create index on oportunidades (estagio);
create index on oportunidades (conta_id);

-- ---------- Tarefas ----------
create table tarefas (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,
  canal_id    uuid references canais(id),
  frente      text not null,
  titulo      text not null,
  responsavel text,
  data_inicio date,
  prazo       date,
  status      status_tarefa not null default 'a_fazer',
  depende_de  uuid references tarefas(id),
  ordem       int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on tarefas (canal_id);
create index on tarefas (depende_de);

-- ---------- Gates ----------
create table gates (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null,
  data             date not null,
  criterio         text,
  decisao_possivel text,
  ordem            int not null default 0,
  status           status_gate not null default 'pendente',
  created_at       timestamptz not null default now()
);

-- ---------- Modelos de mensagem ----------
create table modelos_mensagem (
  id         uuid primary key default gen_random_uuid(),
  canal_id   uuid references canais(id),
  estagio    estagio_oport,
  titulo     text not null,
  corpo      text not null,
  variante   text,
  ativo      boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on modelos_mensagem (canal_id);

-- ---------- Log manual de mensagens (sem envio real) ----------
create table mensagens_log (
  id            uuid primary key default gen_random_uuid(),
  modelo_id     uuid references modelos_mensagem(id),
  conta_id      uuid references contas(id) on delete cascade,
  canal_id      uuid references canais(id),
  variante      text,
  status_manual status_mensagem not null default 'rascunho',
  enviado_em    timestamptz,
  observacao    text,
  autor         text,
  created_at    timestamptz not null default now()
);
create index on mensagens_log (conta_id);

-- ---------- Voz do Cliente ----------
create table voz_do_cliente (
  id                   uuid primary key default gen_random_uuid(),
  conta_id             uuid references contas(id) on delete set null,
  tipo                 tipo_voz not null default 'depoimento',
  titulo               text,
  conteudo             text not null,
  autor_cliente        text,
  resultado_mensuravel text,
  autorizado           boolean not null default false,
  imagem_url           text,
  fixado_como_prova    boolean not null default false,
  tags                 text[] not null default '{}',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index on voz_do_cliente (conta_id);

-- ---------- Triggers updated_at ----------
create trigger trg_canais_updated     before update on canais           for each row execute function set_updated_at();
create trigger trg_invest_updated      before update on investimentos    for each row execute function set_updated_at();
create trigger trg_contas_updated      before update on contas           for each row execute function set_updated_at();
create trigger trg_oport_updated       before update on oportunidades    for each row execute function set_updated_at();
create trigger trg_tarefas_updated     before update on tarefas          for each row execute function set_updated_at();
create trigger trg_modelos_updated     before update on modelos_mensagem for each row execute function set_updated_at();
create trigger trg_voz_updated         before update on voz_do_cliente   for each row execute function set_updated_at();
