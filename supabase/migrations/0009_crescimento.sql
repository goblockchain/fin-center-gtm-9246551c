-- ============================================================================
-- UseFin — 0009_crescimento (Centro de Receita, Fase 3)
-- Comunidade (5), Parcerias (6) e Eventos (7). Estende o schema atual: o funil
-- (Lead/Cliente) continua nas oportunidades por canal (filtradas por canais.tipo);
-- aqui ficam só os dados próprios de cada frente (membros, parceiros, eventos).
-- ============================================================================

-- ---------- Comunidade: métricas mensais (manuais) ----------
create table if not exists comunidade_metricas (
  id                   uuid primary key default gen_random_uuid(),
  competencia          date not null unique,             -- 1º dia do mês
  membros_totais       int not null default 0,
  membros_ativos       int not null default 0,
  conversas_iniciadas  int not null default 0,
  participacao_semanal int not null default 0,           -- pessoas ativas/semana
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------- Parcerias: um registro por parceiro ----------
create table if not exists parceiros (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  canal_id       uuid references canais(id) on delete set null,
  ativo          boolean not null default true,
  leads_enviados int not null default 0,
  sqls           int not null default 0,
  clientes       int not null default 0,
  receita        numeric(12,2) not null default 0,       -- MRR/receita gerada
  obs            text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- Eventos: um registro por evento ----------
create table if not exists eventos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  data          date,
  participantes int not null default 0,
  leads         int not null default 0,
  sqls          int not null default 0,
  clientes      int not null default 0,
  custo         numeric(12,2) not null default 0,
  receita       numeric(12,2) not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- updated_at automático
drop trigger if exists trg_comunidade_updated on comunidade_metricas;
create trigger trg_comunidade_updated before update on comunidade_metricas
  for each row execute function set_updated_at();
drop trigger if exists trg_parceiros_updated on parceiros;
create trigger trg_parceiros_updated before update on parceiros
  for each row execute function set_updated_at();
drop trigger if exists trg_eventos_updated on eventos;
create trigger trg_eventos_updated before update on eventos
  for each row execute function set_updated_at();

-- RLS (autenticado lê/escreve; anônimo bloqueado)
alter table comunidade_metricas enable row level security;
alter table parceiros           enable row level security;
alter table eventos             enable row level security;
drop policy if exists "auth_all_comunidade" on comunidade_metricas;
create policy "auth_all_comunidade" on comunidade_metricas for all to authenticated
  using (true) with check (true);
drop policy if exists "auth_all_parceiros" on parceiros;
create policy "auth_all_parceiros" on parceiros for all to authenticated
  using (true) with check (true);
drop policy if exists "auth_all_eventos" on eventos;
create policy "auth_all_eventos" on eventos for all to authenticated
  using (true) with check (true);
