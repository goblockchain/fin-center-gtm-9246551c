-- ============================================================================
-- Fin Center — 0004_storage
-- Bucket privado 'voz' para imagens de Voz do Cliente. (CLAUDE.md §6.4)
-- Acesso só para authenticated; URLs assinadas no front.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('voz', 'voz', false)
on conflict (id) do nothing;

-- storage.objects já tem RLS habilitada no Supabase; criamos as políticas do bucket.
create policy "voz_auth_select" on storage.objects
  for select to authenticated using (bucket_id = 'voz');

create policy "voz_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'voz');

create policy "voz_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'voz') with check (bucket_id = 'voz');

create policy "voz_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'voz');
