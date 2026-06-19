-- ============================================================================
-- UseFin — 0005_realtime
-- Habilita Supabase Realtime (postgres_changes) nas tabelas que o Dashboard
-- assina para atualizar ao vivo (invalida caches do TanStack Query).
-- ============================================================================

alter publication supabase_realtime add table public.oportunidades;
alter publication supabase_realtime add table public.tarefas;
alter publication supabase_realtime add table public.gates;
alter publication supabase_realtime add table public.investimentos;
alter publication supabase_realtime add table public.voz_do_cliente;
alter publication supabase_realtime add table public.contas;
