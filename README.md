# UseFin

Ferramenta interna de **Go-To-Market** da Fin. O **canal** é a unidade central:
execução, investimento, KPI e prazo no mesmo lugar.

> Fonte da verdade: [`CLAUDE.md`](CLAUDE.md) (spec + modelo de dados) e
> [`docs/DASHBOARD.md`](docs/DASHBOARD.md) (dashboard + tempo real). Em conflito, eles vencem.

## Stack

Vite + React + TypeScript · Tailwind + shadcn/ui · React Router · TanStack Query · Recharts ·
Supabase (Postgres + Auth + RLS + Storage + Realtime + Edge Functions + pg_cron).

## Rodar o front

```bash
npm install
cp .env.example .env   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
npm run build          # checa tipos (tsc -b) + gera dist/
npm run preview        # serve o build em http://localhost:4173
npm test               # Vitest
```

**Nunca** commite `.env`. Só a `anon key` vai ao front; a `service_role` **NUNCA**.

## Reproduzir o backend (Supabase) — projeto auto-contido

Todo o backend é reproduzível só com os arquivos deste repo. Para subir uma cópia do zero:

1. Crie um projeto no [Supabase](https://supabase.com) (free serve) e copie a **URL** e a
   **anon key** para o seu `.env`.
2. Rode as migrations **em ordem** (no SQL editor do Supabase ou via CLI), de
   `supabase/migrations/0001_schema.sql` até `0013_projetos.sql`:
   - `0001` enums + tabelas + triggers · `0002` RLS · `0003` views (CAC/ROI/% execução) ·
     `0004` storage (bucket `voz`) · `0005` realtime · `0006` snapshots + pg_cron ·
     `0007` `canais.tipo` · `0008` economia (custos/metas) · `0009` crescimento ·
     `0010` pipeline_eventos (tracking) · `0011` importar_base (RPC) ·
     `0012` tracking preciso · `0013` projetos.
3. Rode o [`supabase/seed.sql`](supabase/seed.sql) — recria os **5 canais**, gates, tarefas,
   modelos, a **base real (212 contas/oportunidades)** e os projetos da linha do tempo.
4. **Auth:** crie o primeiro usuário (e-mail/senha) no painel → Authentication. O app inteiro
   fica atrás do login. (Sem SMTP configurado, deixe `Confirm email` off para o usuário entrar
   na hora.)
5. *(Opcional)* Edge Function `criar-perfil` (criação de novos perfis) em
   [`supabase/functions/criar-perfil`](supabase/functions/criar-perfil).

Depois disso, o front aponta para o seu projeto via `.env` — nada fica preso à nuvem original.

## Estrutura

```
src/
  components/  ui/ (shadcn) · layout/ (Topbar, AppShell) · shared/ (PageHeader, EmptyState) · auth/
  features/    dashboard · pipeline · crm · canais · roadmap · tarefas · mensagens · voz ·
               crescimento · economia · auth   (cada um: hooks TanStack Query + componentes)
  lib/         supabase.ts · nav.ts · queryClient.ts · format.ts · datas.ts · baseline.ts · utils.ts
  pages/       Dashboard · Pipeline · CRM · Canais · Roadmap · Tarefas · Mensagens · Voz ·
               Crescimento · Relatório · Login
supabase/
  migrations/  0001…0013 (schema · rls · views · storage · realtime · snapshots · …)
  functions/   whatsapp (PLACEHOLDER, não envia) · criar-perfil (cria usuário, server-side)
  seed.sql     5 canais + base real (212) + projetos — sem dados fictícios
```

## Convenção de commits

`feat:` · `fix:` · `chore:` · `docs:` — commits pequenos e descritivos.
