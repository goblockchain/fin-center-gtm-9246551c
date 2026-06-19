# UseFin

Ferramenta interna de **Go-To-Market** da Fin. O **canal** é a unidade central:
execução, investimento, KPI e prazo no mesmo lugar.

> Fonte da verdade: [`CLAUDE.md`](CLAUDE.md) (spec + modelo de dados) e
> [`docs/DASHBOARD.md`](docs/DASHBOARD.md) (dashboard + tempo real). Em conflito, eles vencem.

## Stack

Vite + React + TypeScript · Tailwind + shadcn/ui · React Router · TanStack Query · Recharts ·
Supabase (Postgres + Auth + RLS + Storage + Realtime).

## Rodar

```bash
npm install
cp .env.example .env   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (M2+)
npm run dev            # http://localhost:5173
npm run build          # checa tipos (tsc -b) e gera dist/
```

Nunca commite `.env`. Só a `anon key` vai ao front; a `service_role` NUNCA.

## Estrutura

```
src/
  components/  ui/ (shadcn) · layout/ (Sidebar, AppShell) · shared/ (PageHeader, EmptyState)
  lib/         nav.ts · queryClient.ts · utils.ts
  pages/       Dashboard, Pipeline, CRM, Canais, Roadmap, Tarefas, Mensagens, Voz
supabase/
  migrations/  schema · rls · views (M2)
  functions/whatsapp/  PLACEHOLDER — não envia WhatsApp
  seed.sql     dados reais + bloco de DEMONSTRAÇÃO
```

## Milestones

M1 Scaffold · M2 Supabase · M3 CRM+Importador · M4 Pipeline · M5 Canais ·
M6 Roadmap+Tarefas · M7 Mensagens · M8 Voz do Cliente · M9 Dashboard+tempo real · M10 QA.
Detalhe e critério de aceite em [`CLAUDE.md`](CLAUDE.md).
