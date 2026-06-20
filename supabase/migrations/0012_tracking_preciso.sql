-- ============================================================================
-- UseFin — 0012_tracking_preciso
-- Tracking automático PRECISO: o evento de pipeline registra a DATA REAL da
-- mudança de estágio (BRT), independente de qualquer marcação manual. Assim que
-- o status muda, vai pro tracking semanal sozinho — relatório fiel das
-- movimentações comerciais.
--   INSERT: usa a data de entrada (preserva históricos do import).
--   UPDATE de estágio: usa o momento real da mudança (now() em America/Sao_Paulo).
-- ============================================================================

create or replace function log_pipeline_evento()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into pipeline_eventos (oportunidade_id, canal_id, estagio, data)
    values (
      new.id, new.canal_id, new.estagio,
      coalesce(new.data_entrada_estagio, (now() at time zone 'America/Sao_Paulo')::date)
    );
  elsif (tg_op = 'UPDATE' and new.estagio is distinct from old.estagio) then
    insert into pipeline_eventos (oportunidade_id, canal_id, estagio, data)
    values (
      new.id, new.canal_id, new.estagio,
      (now() at time zone 'America/Sao_Paulo')::date
    );
  end if;
  return new;
end $$;
