-- ============================================================================
-- UseFin — 0011_importar_base
-- Importação ATÔMICA (WR-03): uma função plpgsql roda numa única transação, então
-- se qualquer insert falhar (FK, data inválida, enum) tudo volta atrás — sem contas
-- órfãs nem oportunidades pela metade. Substitui os 4 inserts soltos do front.
-- security invoker: respeita a RLS (authenticated insere; anônimo bloqueado).
-- ============================================================================

create or replace function importar_base(
  p_contas        jsonb,
  p_oportunidades jsonb,
  p_contatos      jsonb,
  p_interacoes    jsonb
) returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count int := 0;
begin
  insert into contas (
    id, nome, endereco, bairro, telefone, instagram, canal_origem_id,
    temperatura, responsavel, visitada, entrevista_agendada,
    data_primeiro_contato, proxima_acao, obs, ref_externa
  )
  select id, nome, endereco, bairro, telefone, instagram, canal_origem_id,
         temperatura, responsavel,
         coalesce(visitada, false), coalesce(entrevista_agendada, false),
         data_primeiro_contato, proxima_acao, obs, ref_externa
  from jsonb_to_recordset(coalesce(p_contas, '[]'::jsonb)) as x(
    id uuid, nome text, endereco text, bairro text, telefone text, instagram text,
    canal_origem_id uuid, temperatura temperatura, responsavel text,
    visitada boolean, entrevista_agendada boolean, data_primeiro_contato date,
    proxima_acao text, obs text, ref_externa text
  );
  get diagnostics v_count = row_count;

  insert into oportunidades (
    conta_id, canal_id, estagio, valor_mrr, probabilidade,
    data_entrada_estagio, responsavel
  )
  select conta_id, canal_id, estagio, valor_mrr, probabilidade,
         coalesce(data_entrada_estagio, current_date), responsavel
  from jsonb_to_recordset(coalesce(p_oportunidades, '[]'::jsonb)) as x(
    conta_id uuid, canal_id uuid, estagio estagio_oport, valor_mrr numeric,
    probabilidade int, data_entrada_estagio date, responsavel text
  );

  insert into contatos (conta_id, nome, papel)
  select conta_id, nome, papel
  from jsonb_to_recordset(coalesce(p_contatos, '[]'::jsonb)) as x(
    conta_id uuid, nome text, papel papel_contato
  );

  insert into interacoes (conta_id, canal_id, tipo, data, resumo, autor)
  select conta_id, canal_id, tipo, coalesce(data, current_date), resumo, autor
  from jsonb_to_recordset(coalesce(p_interacoes, '[]'::jsonb)) as x(
    conta_id uuid, canal_id uuid, tipo tipo_interacao, data date, resumo text, autor text
  );

  return v_count;
end $$;

grant execute on function importar_base(jsonb, jsonb, jsonb, jsonb) to authenticated;
