-- ============================================================================
-- UseFin — 0010_pipeline_eventos
-- Rastreio automático da atividade do pipe: cada mudança de estágio de uma
-- oportunidade vira um EVENTO (via trigger). A partir daí derivamos, por semana
-- e por canal: contatos, reuniões e fechamentos. Nada manual — tudo a partir do
-- pipeline. View pipeline_semana faz a agregação (security_invoker).
-- ============================================================================

create table if not exists pipeline_eventos (
  id              uuid primary key default gen_random_uuid(),
  oportunidade_id uuid references oportunidades(id) on delete cascade,
  canal_id        uuid references canais(id),
  estagio         estagio_oport not null,
  data            date not null default current_date,  -- data do evento
  created_at      timestamptz not null default now()
);

create index if not exists idx_pipeline_eventos_data  on pipeline_eventos (data);
create index if not exists idx_pipeline_eventos_canal on pipeline_eventos (canal_id);
create index if not exists idx_pipeline_eventos_estagio on pipeline_eventos (estagio);

-- ---------- Trigger: registra cada entrada/mudança de estágio ----------
create or replace function log_pipeline_evento()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into pipeline_eventos (oportunidade_id, canal_id, estagio, data)
    values (new.id, new.canal_id, new.estagio, new.data_entrada_estagio);
  elsif (tg_op = 'UPDATE' and new.estagio is distinct from old.estagio) then
    insert into pipeline_eventos (oportunidade_id, canal_id, estagio, data)
    values (new.id, new.canal_id, new.estagio, new.data_entrada_estagio);
  end if;
  return new;
end $$;

drop trigger if exists trg_log_pipeline_evento on oportunidades;
create trigger trg_log_pipeline_evento
  after insert or update on oportunidades
  for each row execute function log_pipeline_evento();

-- ---------- Backfill: marcos já alcançados de cada oportunidade ----------
-- (na data de entrada do estágio atual; daqui pra frente o trigger é exato)
delete from pipeline_eventos;  -- idempotente: re-seed limpo se a migration rodar de novo
insert into pipeline_eventos (oportunidade_id, canal_id, estagio, data)
  select id, canal_id, 'contatado'::estagio_oport, data_entrada_estagio
    from oportunidades where estagio <> 'cadastrado'
  union all
  select id, canal_id, 'reuniao'::estagio_oport, data_entrada_estagio
    from oportunidades
    where estagio in ('reuniao','proposta','negociacao','fechado_ganho')
  union all
  select id, canal_id, 'fechado_ganho'::estagio_oport, data_entrada_estagio
    from oportunidades where estagio = 'fechado_ganho';

-- ---------- RLS ----------
alter table pipeline_eventos enable row level security;
drop policy if exists "auth_all_pipeline_eventos" on pipeline_eventos;
create policy "auth_all_pipeline_eventos" on pipeline_eventos for all to authenticated
  using (true) with check (true);

-- ---------- View: atividade por semana (segunda-feira) e canal ----------
create or replace view pipeline_semana
with (security_invoker = on) as
select
  (date_trunc('week', data)::date)                 as semana,
  canal_id,
  count(*) filter (where estagio = 'contatado')    as contatos,
  count(*) filter (where estagio = 'reuniao')       as reunioes,
  count(*) filter (where estagio = 'fechado_ganho') as fechamentos
from pipeline_eventos
group by 1, 2;
