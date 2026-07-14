-- Novas raias do pipeline: estende o enum estagio_oport.
-- 'proposta' e 'fechado_ganho' já existem — não são readicionados.
-- A ordem de exibição das colunas é controlada no front (features/pipeline/estagios.ts),
-- então a ordem do enum aqui é irrelevante; usamos ADD VALUE IF NOT EXISTS (idempotente).
--
-- Observação Postgres: ALTER TYPE ... ADD VALUE não pode ser usado na MESMA transação
-- em que o novo valor é referenciado. Este script só ADICIONA valores (não os usa),
-- então roda sem problemas. Rode no SQL Editor do Supabase.

alter type estagio_oport add value if not exists 'piloto';
alter type estagio_oport add value if not exists 'envio_contrato';
alter type estagio_oport add value if not exists 'setup_onboarding';
alter type estagio_oport add value if not exists 'ticket_aberto';
alter type estagio_oport add value if not exists 'nps_recolhido';
alter type estagio_oport add value if not exists 'indicacao';
alter type estagio_oport add value if not exists 'up_cross_sell';
alter type estagio_oport add value if not exists 'retencao';
