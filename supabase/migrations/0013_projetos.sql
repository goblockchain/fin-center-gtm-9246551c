-- ============================================================================
-- UseFin — 0013_projetos
-- Linha do tempo dirigida por PROJETOS próprios cadastrados (nome + início +
-- prazo + status), separados das tarefas da sprint. O Gantt do Roadmap passa a
-- desenhar uma barra por projeto; a janela se molda aos prazos cadastrados.
-- ============================================================================

create table if not exists projetos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  data_inicio date not null,
  prazo       date not null,
  status      status_tarefa not null default 'a_fazer',
  cor         text,                                   -- override opcional de cor
  ordem       int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table projetos enable row level security;
create policy "auth_all_projetos" on projetos
  for all to authenticated using (true) with check (true);

drop trigger if exists trg_projetos_updated on projetos;
create trigger trg_projetos_updated before update on projetos
  for each row execute function set_updated_at();
