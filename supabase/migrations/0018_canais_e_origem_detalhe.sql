-- ============================================================================
-- UseFin — 0018_canais_e_origem_detalhe
-- Reorganiza os canais e cria o detalhe da origem dentro do canal.
--
-- Decisão (§4.1 "o canal é a unidade central"): Instagram/LinkedIn/Reddit e
-- pesquisa/presencial NÃO viram canais próprios — viram detalhe do lead. Assim
-- CAC/ROI seguem inteiros por canal (um CAC de Inbound, não três) e o detalhe
-- serve para filtrar e segmentar.
--
-- Canais finais (7): ABF · Inbound · Meta Ads · Outbound · Base Yungas ·
--                    Indicações · Fin Light
--
-- Os SLUGS são preservados de propósito: o código referencia
-- 'member-get-member' (TarefaFormDialog) e 'outbound' (ImportarBaseDialog).
-- Renomear slug quebraria essas telas — aqui só muda o nome de exibição.
-- ============================================================================

-- Detalhe da origem dentro do canal. Um campo só, com significado por canal:
--   inbound    -> Instagram / LinkedIn / Reddit
--   outbound   -> Pesquisa / Presencial
--   indicacoes -> quem indicou (texto livre)
alter table public.contas add column if not exists origem_detalhe text;

comment on column public.contas.origem_detalhe is
  'Sub-origem dentro do canal: rede (inbound), abordagem (outbound) ou quem indicou (indicações). Nulo nos demais canais.';

-- Member-get-member passa a se chamar Fin Light. Slug preservado (ver acima).
update public.canais set nome = 'Fin Light' where slug = 'member-get-member';

-- Canais novos. on conflict do nothing => a migration é idempotente.
insert into public.canais (slug, nome, tipo, prioridade, ordem, responsavel)
values
  ('abf', 'ABF', 'parceria', 2, 6, 'Natalia'),
  ('meta-ads', 'Meta Ads', 'midia', 3, 7, 'Natalia')
on conflict (slug) do nothing;
