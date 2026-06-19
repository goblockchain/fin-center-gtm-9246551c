-- ============================================================================
-- UseFin — 0002_rls
-- RLS ativa em TODAS as tabelas antes de qualquer dado real. (CLAUDE.md §8)
-- Ferramenta interna: todo usuário autenticado lê/escreve tudo; anônimo negado.
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'canais','investimentos','contas','contatos','interacoes','oportunidades',
    'tarefas','gates','modelos_mensagem','mensagens_log','voz_do_cliente'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    -- política única: acesso total para authenticated; sem política para anon => negado
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true);',
      'auth_all_' || t, t
    );
  end loop;
end $$;
