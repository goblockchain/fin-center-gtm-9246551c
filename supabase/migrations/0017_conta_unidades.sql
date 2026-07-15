-- ============================================================================
-- UseFin — 0017_conta_unidades
-- Diferenciação de preço por tipo de negócio no cadastro do lead:
--   • franqueado    → sempre Essencial (R$250). Não usa `unidades`.
--   • franqueador   → MRR negociado conforme o tamanho da rede. `unidades` é o
--                     nº de unidades da rede, registrado no cadastro.
--   • independente  → escolha livre entre Essencial e Completo.
-- O valor continua em `oportunidades.valor_mrr` (fonte única do MRR); aqui só
-- entra o dado da conta que justifica o valor negociado.
-- ============================================================================

alter table contas add column if not exists unidades int;

comment on column contas.unidades is
  'Nº de unidades da rede (só para tipo_negocio = franqueador). Nulo nos demais tipos.';

-- Nº de unidades, quando informado, é sempre positivo.
alter table contas drop constraint if exists contas_unidades_positivo;
alter table contas add constraint contas_unidades_positivo
  check (unidades is null or unidades > 0);
