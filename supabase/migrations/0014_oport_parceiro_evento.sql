-- ============================================================================
-- UseFin — 0014_oport_parceiro_evento
-- P3 (fonte única no pipe): atribui a oportunidade a um parceiro/evento, para
-- derivar as métricas POR parceiro/evento direto do pipe (sem reentrada manual).
-- ============================================================================

alter table oportunidades
  add column if not exists parceiro_id uuid references parceiros(id) on delete set null,
  add column if not exists evento_id   uuid references eventos(id)   on delete set null;
