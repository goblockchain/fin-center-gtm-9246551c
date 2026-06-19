-- ============================================================================
-- UseFin — 0008_economia (Centro de Receita, Fase 2)
-- Custos itemizados por canal + metas mensais. A "economia do canal" (CAC,
-- MRR por hora, ARR, ROI, Payback) é derivada na view canal_economia — nunca
-- em coluna. Estende o schema atual (sem entidades paralelas).
-- ============================================================================

-- Enum de tipo de custo (idempotente)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_custo') then
    create type tipo_custo as enum
      ('horas','ferramentas','midia','comissao','operacional');
  end if;
end $$;

-- ---------- Custos itemizados por canal ----------
create table if not exists custos (
  id          uuid primary key default gen_random_uuid(),
  canal_id    uuid not null references canais(id) on delete cascade,
  tipo        tipo_custo not null default 'operacional',
  descricao   text,
  valor       numeric(12,2) not null default 0,    -- custo em R$
  horas       numeric(8,2),                          -- qtde de horas (p/ MRR por hora)
  competencia date,                                  -- 1º dia do mês de competência
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Metas mensais (globais) ----------
create table if not exists metas (
  id            uuid primary key default gen_random_uuid(),
  competencia   date not null unique,                -- 1º dia do mês
  meta_mrr      numeric(12,2) not null default 0,
  meta_clientes int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- updated_at automático (set_updated_at já existe — 0001)
drop trigger if exists trg_custos_updated on custos;
create trigger trg_custos_updated before update on custos
  for each row execute function set_updated_at();
drop trigger if exists trg_metas_updated on metas;
create trigger trg_metas_updated before update on metas
  for each row execute function set_updated_at();

-- ---------- RLS (autenticado lê/escreve; anônimo bloqueado) ----------
alter table custos enable row level security;
alter table metas  enable row level security;
drop policy if exists "auth_all_custos" on custos;
create policy "auth_all_custos" on custos for all to authenticated
  using (true) with check (true);
drop policy if exists "auth_all_metas" on metas;
create policy "auth_all_metas" on metas for all to authenticated
  using (true) with check (true);

-- ---------- View: economia por canal (CAC/MRR-hora/ARR/ROI/Payback) ----------
create or replace view canal_economia
with (security_invoker = on) as
with c as (
  select canal_id,
    sum(valor)                                          as custo_total,
    sum(coalesce(horas,0))                              as horas_total,
    sum(valor) filter (where tipo = 'horas')            as custo_horas,
    sum(valor) filter (where tipo = 'ferramentas')      as custo_ferramentas,
    sum(valor) filter (where tipo = 'midia')            as custo_midia,
    sum(valor) filter (where tipo = 'comissao')         as custo_comissao,
    sum(valor) filter (where tipo = 'operacional')      as custo_operacional
  from custos group by canal_id
),
o as (
  select canal_id,
    count(*) filter (where estagio = 'fechado_ganho')                      as clientes,
    coalesce(sum(valor_mrr) filter (where estagio = 'fechado_ganho'), 0)   as mrr
  from oportunidades group by canal_id
)
select
  cn.id as canal_id, cn.nome, cn.tipo,
  coalesce(c.custo_total, 0)       as custo_total,
  coalesce(c.horas_total, 0)       as horas_total,
  coalesce(c.custo_horas, 0)       as custo_horas,
  coalesce(c.custo_ferramentas, 0) as custo_ferramentas,
  coalesce(c.custo_midia, 0)       as custo_midia,
  coalesce(c.custo_comissao, 0)    as custo_comissao,
  coalesce(c.custo_operacional, 0) as custo_operacional,
  coalesce(o.clientes, 0)          as clientes,
  coalesce(o.mrr, 0)               as mrr_ganho,
  coalesce(o.mrr, 0) * 12          as arr,
  case when coalesce(o.clientes,0) = 0 or coalesce(c.custo_total,0) = 0 then null
       else round(c.custo_total / o.clientes, 2) end          as cac,
  case when coalesce(c.horas_total,0) = 0 then null
       else round(o.mrr / c.horas_total, 2) end               as mrr_por_hora,
  case when coalesce(c.custo_total,0) = 0 then null
       else round((o.mrr - c.custo_total) / c.custo_total, 4) end as roi,
  case when coalesce(o.mrr,0) = 0 or coalesce(c.custo_total,0) = 0 then null
       else round(c.custo_total / o.mrr, 2) end               as payback_meses
from canais cn
left join c on c.canal_id = cn.id
left join o on o.canal_id = cn.id
order by cn.ordem;
