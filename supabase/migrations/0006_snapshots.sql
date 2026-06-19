-- ============================================================================
-- Fin Center — 0006_snapshots
-- Rastreio semanal: grava um snapshot dos números na própria base toda sexta
-- (pg_cron, 18:00 BRT) para comparar a evolução semana a semana.
-- As métricas seguem os parâmetros canônicos: baseline 2% e CAC/ROI vindos das
-- views canal_execucao / canal_kpis. Nada fixo — tudo derivado do dado real.
-- ============================================================================

-- ---------- Tabela: 1 linha por dia (a sexta é a captura automática) ----------
create table if not exists snapshots_semanais (
  id           uuid primary key default gen_random_uuid(),
  ref_date     date not null unique
                 default (now() at time zone 'America/Sao_Paulo')::date,
  capturado_em timestamptz not null default now(),
  total_contas int not null default 0,
  total_oport  int not null default 0,
  contatados   int not null default 0,
  reunioes     int not null default 0,
  ganhos       int not null default 0,
  perdidos     int not null default 0,
  mrr_ganho    numeric(12,2) not null default 0,
  investido    numeric(12,2) not null default 0,
  conversao    numeric(6,4),                 -- contato→reunião global (vs 2%)
  por_canal    jsonb not null default '[]'::jsonb,
  origem       text not null default 'cron', -- 'cron' | 'manual'
  created_at   timestamptz not null default now()
);

alter table snapshots_semanais enable row level security;
drop policy if exists "auth_read_snapshots" on snapshots_semanais;
create policy "auth_read_snapshots" on snapshots_semanais
  for select to authenticated using (true);
-- Inserts/updates acontecem só pela função security definer (cron + RPC manual).

-- ---------- Função de captura (upsert por ref_date) ----------
create or replace function capturar_snapshot_semanal(p_origem text default 'cron')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id           uuid;
  v_total_contas int;
  v_total_oport  int;
  v_contatados   int;
  v_reunioes     int;
  v_ganhos       int;
  v_perdidos     int;
  v_mrr          numeric;
  v_invest       numeric;
  v_conv         numeric;
  v_por_canal    jsonb;
begin
  select count(*) into v_total_contas from contas;

  select
    count(*),
    count(*) filter (where estagio <> 'cadastrado'),
    count(*) filter (where estagio in ('reuniao','proposta','negociacao','fechado_ganho')),
    count(*) filter (where estagio = 'fechado_ganho'),
    count(*) filter (where estagio = 'fechado_perdido'),
    coalesce(sum(valor_mrr) filter (where estagio = 'fechado_ganho'), 0)
  into v_total_oport, v_contatados, v_reunioes, v_ganhos, v_perdidos, v_mrr
  from oportunidades;

  select coalesce(sum(executado), 0) into v_invest from investimentos;

  v_conv := case when v_contatados > 0
                 then round(v_reunioes::numeric / v_contatados, 4) else null end;

  -- detalhe por canal a partir das views canônicas (CAC/ROI já calculados lá)
  select coalesce(jsonb_agg(jsonb_build_object(
           'canal_id', e.canal_id, 'slug', e.slug, 'nome', e.nome, 'estado', e.estado,
           'total_oport', e.total_oport, 'contatados', e.contatados,
           'reunioes', e.reunioes_ou_mais, 'ganhos', e.ganhos,
           'investido', e.investimento_executado,
           'taxa_conversao', k.taxa_conversao, 'mrr_ganho', k.mrr_ganho,
           'cac', k.cac, 'roi', k.roi
         ) order by e.ordem), '[]'::jsonb)
  into v_por_canal
  from canal_execucao e
  left join canal_kpis k on k.canal_id = e.canal_id;

  insert into snapshots_semanais (
    ref_date, total_contas, total_oport, contatados, reunioes, ganhos, perdidos,
    mrr_ganho, investido, conversao, por_canal, origem
  ) values (
    (now() at time zone 'America/Sao_Paulo')::date,
    v_total_contas, v_total_oport, v_contatados, v_reunioes, v_ganhos, v_perdidos,
    v_mrr, v_invest, v_conv, v_por_canal, p_origem
  )
  on conflict (ref_date) do update set
    capturado_em = now(),
    total_contas = excluded.total_contas,
    total_oport  = excluded.total_oport,
    contatados   = excluded.contatados,
    reunioes     = excluded.reunioes,
    ganhos       = excluded.ganhos,
    perdidos     = excluded.perdidos,
    mrr_ganho    = excluded.mrr_ganho,
    investido    = excluded.investido,
    conversao    = excluded.conversao,
    por_canal    = excluded.por_canal,
    origem       = excluded.origem
  returning id into v_id;

  return v_id;
end $$;

grant execute on function capturar_snapshot_semanal(text) to authenticated;

-- ---------- Agendamento automático: toda sexta 18:00 BRT (21:00 UTC) ----------
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'snapshot-semanal-sexta') then
    perform cron.unschedule('snapshot-semanal-sexta');
  end if;
end $$;

select cron.schedule(
  'snapshot-semanal-sexta',
  '0 21 * * 5',
  $cron$ select public.capturar_snapshot_semanal('cron'); $cron$
);
