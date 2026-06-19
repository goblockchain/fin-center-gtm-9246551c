-- ============================================================================
-- UseFin — 0007_canais_tipo
-- Centro de Receita por Canal: canais ganham um `tipo` (malleável, texto livre)
-- para as visões por categoria (Comunidade / Parceria / Evento / Conteúdo…).
-- Mantém os 5 canais reais; a usuária cria novos canais reais com seus tipos.
-- ============================================================================

alter table canais add column if not exists tipo text not null default 'outro';

-- Tipos iniciais dos 5 canais da sprint (editáveis na tela de Canais).
update canais set tipo = case slug
  when 'outbound'          then 'outbound'
  when 'inbound'           then 'inbound'
  when 'indicacoes'        then 'indicacao'
  when 'base-yungas'       then 'parceria'
  when 'member-get-member' then 'comunidade'
  else tipo
end;
