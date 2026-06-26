# UseFin — Guia do Projeto (fonte da verdade)

> Este arquivo é **canônico**. Se qualquer prompt, conversa ou arquivo conflitar com ele,
> **este arquivo vence**. O nome do produto é **"UseFin"** em toda a interface e em todos
> os textos — nunca "Fin Center" nem "Fin Command Center".

---

## 1. Contexto

A **Fin** é um time financeiro de contas a pagar para o setor de alimentação — uma empresa
AI-Service-Native (Florianópolis, BR). O **UseFin** é a **ferramenta interna de Go-To-Market**
do time comercial: o painel onde a Sprint de Validação de Canais (16/jun → 24/ago/2026) é
planejada, executada e medida.

**Problema que o UseFin resolve:** hoje o GTM da Fin está espalhado em planilhas (CRM de
cafeterias, roadmap de canais, cronograma, tracking semanal). O UseFin unifica isso num só
lugar onde o **canal é a unidade central**: cada canal tem, no mesmo card, sua execução, seu
investimento, seus KPIs e seu prazo.

**A Sprint (resumo real):**
- **Janela:** 16/jun → 24/ago/2026 (10 semanas, S1–S10).
- **Baseline:** outbound frio histórico = **contato→reunião 2%**. Toda taxa de conversão no
  produto é comparada a essa baseline de 2%.
- **5 canais** testados em paralelo, cada um com hipótese, teste mínimo e gate.
- **2 gates de decisão:** Gate 1 (meio, **18/jul**) e Gate 2 (final, **22/ago**).
- **Universo inicial:** **139 cafeterias** de Florianópolis (base de prospecção real).

**Usuária principal:** Natalia (GTM/Comercial), com apoio de Henrique (CEO). Ferramenta interna,
poucos usuários, todos do mesmo time.

---

## 2. Stack (não-negociável)

| Camada | Tecnologia |
|---|---|
| Build/Front | **Vite + React + TypeScript** |
| Estilo | **Tailwind CSS + shadcn/ui** |
| Rotas | **React Router** |
| Dados/cache | **TanStack Query** |
| Gráficos | **Recharts** |
| Backend | **Supabase** — Postgres + Auth (e-mail/senha) + RLS + Storage |
| Tempo real | **Supabase Realtime** (invalida caches do TanStack Query no Dashboard) |

**Regras de stack:**
- Conexão Supabase **por variáveis de ambiente** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  A **anon/publishable key** (`sb_publishable_…`, protegida por RLS) e a URL são **públicas por
  design** (vão embutidas no bundle do cliente) e ficam no `.env` **versionado**. **Segredos
  reais (service_role / `sb_secret_…`) nunca** são commitados — vão em `.env.local` (ignorado).
  `.env.example` documenta as variáveis.
- A **service_role key nunca** vai ao front-end. Só a `anon key` (protegida por RLS).
- O app inteiro fica **atrás do login**. Sessão persiste (Supabase Auth + refresh).
- **WhatsApp não é enviado de verdade.** Existe uma edge function placeholder em
  `supabase/functions/whatsapp` (apenas stub/log). O módulo de Mensagens registra **status manual**.

---

## 3. Identidade visual da Fin (não-negociável)

**"Dark forest, lifted by mint"** (Fin Design System / `Fin_Design_System.pptx`).

| Token | Cor | Uso |
|---|---|---|
| `forest` (verde-escuro) | `#1B4332` | Títulos, marca, superfícies escuras |
| `verde-medio` | `#2D6A4F` | Ações primárias, botões |
| `mint` (verde-claro) | `#95D5B2` | Destaques, sucesso |
| `texto` | `#14241C` | Texto principal |
| `página` | `#F5F7F2` | Fundo da aplicação (cream) |
| `card` | `#FFFFFF` | Cards / superfícies |
| `ambar` | `#D9920A` | **Perto do prazo** (alerta funcional) |
| `vermelho` | `#C0392B` | **Atraso / perdido** (alerta funcional) |

Ramp de apoio: `#102A1E · #2D6A4F · #40916C · #74C69D · #D8F3DC`. Marca = óculos redondos
(forest em superfície clara, mint em superfície verde-escura).

- **Tipografia:** **Bricolage Grotesque** (display 800 — títulos/marca), **Hanken Grotesk** (corpo e
  UI) e **JetBrains Mono** (figuras tabulares — valores/MRR). Layout **arejado**, **sem gradientes**
  nem sombras pesadas. **Mobile-first** (a usuária roda o GTM do celular em campo).

---

## 4. Princípios de UX (não-negociáveis)

1. **O canal é a unidade central.** Execução, investimento, KPI e prazo aparecem no **mesmo card**.
2. **KPI só aparece com dado real.** Nunca mostrar zeros como se fossem métrica. Um canal sem
   conversão medível não exibe bloco de KPI (ver `estado` derivado em §7).
3. **Tempo em linguagem humana relativa primeiro** ("em 2 dias", "atrasado há 1 dia"), com a data
   crua como secundária.
4. **Planejado e executado sempre lado a lado** (investimento, tarefas, metas).
5. **Prova vinculada à conta.** Voz do Cliente aparece também na ficha da conta de origem.
6. **O Dashboard abre com "Foco de hoje" (ação)** antes de qualquer gráfico.

---

## 5. Módulos / Rotas

| Rota | Módulo | O que é |
|---|---|---|
| `/` | **Dashboard** | Inteligente + tempo real. Abre com "Foco de hoje" + botão **Exportar PDF** (o antigo Relatório virou ação). Ver `docs/DASHBOARD.md`. |
| `/leads` | **Leads** | Pipeline + CRM unificados: toggle **Kanban/Tabela** sobre as mesmas contas, filtro por canal, **Importar base** e ficha do lead (fonte/canal + atribuição a parceiro/evento). `/pipeline` e `/crm` redirecionam aqui. |
| `/canais` | **Canais** | Visão geral (gráfico + CAC por canal) + card central por canal (anel de % execução, estado derivado, investimento×executado, KPIs só em "Gerando dados") + **input de investimento→CAC**. |
| `/roadmap` | **Roadmap** | Linha do tempo dirigida por **projetos cadastrados** (1 barra por projeto, editável inline; cor por status/prazo) + painel de gates com dias restantes. |
| `/tarefas` | **Tarefas** | Lista por canal com dependência (bloqueada se a dependência não está "feito") e prazos coloridos relativos a hoje. |
| `/mensagens` | **Mensagens** | Biblioteca de modelos por canal/estágio (variáveis `{nome}`, `{cafe}`, `{dor}`, variante A/B) + log manual. |
| `/voz` | **Voz do Cliente** | Registros (depoimento/mensagem/narrativa/relatório) + upload de imagem (Storage) + tags de uso + "fixar como prova". |
| `/crescimento` | **Crescimento** | Comunidade, Parcerias e Eventos — métricas **derivadas do pipe** (atribua o lead ao parceiro/evento na ficha); entrada manual só do que não vem do pipe. |

Top bar fixa (verde escuro) com **8 itens**: Dashboard · Leads · Canais · Roadmap ·
Tarefas · Mensagens · Voz do Cliente · Crescimento. (`/login` e `/definir-senha` ficam fora do app.)

---

## 6. Modelo de dados (Postgres / Supabase)

Princípios inegociáveis do schema:
- **`canal_origem` é SEMPRE FK para `canais`** — nunca texto livre. O mesmo vale para
  `oportunidades.canal_id` e `tarefas.canal_id`.
- **CAC e ROI nunca são colunas.** São calculados nas **views** `canal_kpis` e `canal_execucao`.
- **RLS ativa em todas as tabelas** antes de qualquer dado real.

### 6.1 Enums

```sql
create type temperatura      as enum ('sem_contato','frio','morno','quente');
create type estagio_oport    as enum (
  'cadastrado','contatado','qualificado','reuniao','proposta','negociacao',
  'fechado_ganho','fechado_perdido');
create type status_tarefa    as enum ('a_fazer','fazendo','feito');
create type tipo_interacao   as enum ('whatsapp','ligacao','visita','reuniao','email','outro');
create type papel_contato    as enum ('decisor','gatekeeper','influenciador','outro');
create type tipo_voz         as enum ('depoimento','mensagem','narrativa','relatorio');
create type status_mensagem  as enum ('rascunho','enviado','respondido','sem_resposta');
create type status_gate      as enum ('pendente','concluido');
```

> Nota: o **estado** do canal (Em preparação / Pronto / Em execução / Gerando dados) **não é
> coluna** — é derivado na view `canal_execucao` (§7.1).

### 6.2 Tabelas

```sql
-- Canais (a unidade central). 5 linhas reais.
create table canais (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,            -- base-yungas, member-get-member, indicacoes, outbound, inbound
  nome            text not null,
  prioridade      int  not null,                   -- 1 = maior alavanca
  hipotese        text,
  teste_minimo    text,
  metrica_sucesso text,
  meta_vs_baseline text,                            -- ex.: "≥10x a conversão do frio"
  dependencia     text,
  responsavel     text,
  gate_data       date,                             -- data do gate de decisão do canal
  ordem           int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Investimento por canal: planejado vs executado (lado a lado). CAC/ROI NÃO ficam aqui.
create table investimentos (
  id           uuid primary key default gen_random_uuid(),
  canal_id     uuid not null references canais(id) on delete cascade,
  planejado    numeric(12,2) not null default 0,
  executado    numeric(12,2) not null default 0,
  periodo      text,                                -- ex.: "Sprint 16/jun–24/ago"
  descricao    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Contas = cafeterias / leads. canal_origem é FK obrigatória.
create table contas (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null,
  endereco              text,
  bairro                text,
  telefone              text,
  instagram             text,
  canal_origem_id       uuid not null references canais(id),  -- FK SEMPRE (nunca texto)
  temperatura           temperatura not null default 'sem_contato',
  responsavel           text,
  visitada              boolean not null default false,
  entrevista_agendada   boolean not null default false,
  gatekeeper            text,
  data_primeiro_contato date,
  proxima_acao          text,
  obs                   text,
  ref_externa           text,                       -- Nº da planilha de origem
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Contatos da conta (decisor, gatekeeper…).
create table contatos (
  id         uuid primary key default gen_random_uuid(),
  conta_id   uuid not null references contas(id) on delete cascade,
  nome       text not null,
  papel      papel_contato not null default 'outro',
  telefone   text,
  instagram  text,
  email      text,
  created_at timestamptz not null default now()
);

-- Interações registradas (timeline da ficha).
create table interacoes (
  id         uuid primary key default gen_random_uuid(),
  conta_id   uuid not null references contas(id) on delete cascade,
  canal_id   uuid references canais(id),
  tipo       tipo_interacao not null default 'whatsapp',
  data       date not null default current_date,
  resumo     text,
  autor      text,
  created_at timestamptz not null default now()
);

-- Oportunidades = o pipeline. 1 por conta. canal_id é FK obrigatória (atribuição GTM do deal).
create table oportunidades (
  id                   uuid primary key default gen_random_uuid(),
  conta_id             uuid not null references contas(id) on delete cascade,
  canal_id             uuid not null references canais(id),  -- FK SEMPRE
  estagio              estagio_oport not null default 'cadastrado',
  valor_mrr            numeric(12,2) not null default 0,     -- ticket mensal (R$250 essencial / R$850 full)
  probabilidade        int,                                  -- 0–100
  data_entrada_estagio date not null default current_date,
  previsao_fechamento  date,
  motivo_perda         text,
  responsavel          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Tarefas da sprint. canal_id nulo = frente transversal (Setup/Gates). Dependência opcional.
create table tarefas (
  id           uuid primary key default gen_random_uuid(),
  codigo       text unique not null,               -- S1, Y1, M1, I1, O1, N1, G1…
  canal_id     uuid references canais(id),
  frente       text not null,                      -- Setup, Yungas, Member-get-member, Indicações, Outbound, Inbound, Gates
  titulo       text not null,
  responsavel  text,
  data_inicio  date,
  prazo        date,
  status       status_tarefa not null default 'a_fazer',
  depende_de   uuid references tarefas(id),        -- bloqueada se a dependência não está 'feito' (derivado na UI)
  ordem        int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Gates de decisão. 2 linhas reais.
create table gates (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null,                  -- "Gate 1 — meio", "Gate 2 — final"
  data             date not null,                  -- 18/jul, 22/ago
  criterio         text,
  decisao_possivel text,
  ordem            int not null default 0,
  status           status_gate not null default 'pendente',
  created_at       timestamptz not null default now()
);

-- Biblioteca de modelos de mensagem (variáveis + A/B).
create table modelos_mensagem (
  id          uuid primary key default gen_random_uuid(),
  canal_id    uuid references canais(id),
  estagio     estagio_oport,                       -- estágio-alvo (nullable)
  titulo      text not null,
  corpo       text not null,                       -- usa {nome}, {cafe}, {dor}
  variante    text,                                -- 'A' | 'B' | null
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Log MANUAL de mensagens (sem envio real de WhatsApp).
create table mensagens_log (
  id            uuid primary key default gen_random_uuid(),
  modelo_id     uuid references modelos_mensagem(id),
  conta_id      uuid references contas(id) on delete cascade,
  canal_id      uuid references canais(id),
  variante      text,
  status_manual status_mensagem not null default 'rascunho',
  enviado_em    timestamptz,
  observacao    text,
  autor         text,
  created_at    timestamptz not null default now()
);

-- Voz do Cliente (prova). Vinculada à conta. Imagem no Storage.
create table voz_do_cliente (
  id                  uuid primary key default gen_random_uuid(),
  conta_id            uuid references contas(id) on delete set null,
  tipo                tipo_voz not null default 'depoimento',
  titulo              text,
  conteudo            text not null,               -- frase textual / narrativa
  autor_cliente       text,
  resultado_mensuravel text,                       -- ex.: "20h/semana economizadas"
  autorizado          boolean not null default false,
  imagem_url          text,                        -- caminho no bucket 'voz'
  fixado_como_prova   boolean not null default false,
  tags                text[] not null default '{}',-- tags de uso: pitch, site, linkedin…
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

### 6.3 `updated_at` automático

```sql
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
-- aplicar trigger em: canais, investimentos, contas, oportunidades, tarefas,
-- modelos_mensagem, voz_do_cliente.
```

### 6.4 Storage

- Bucket **`voz`** (privado) para imagens de Voz do Cliente. Acesso de leitura/escrita só para
  `authenticated`. URLs assinadas no front.

---

## 7. Views calculadas (CAC e ROI vivem AQUI — nunca em coluna)

### 7.1 `canal_execucao`

Uma linha por canal. Deriva **% de execução**, **estado** e **variância de investimento**.

- `total_tarefas`, `tarefas_feitas`, `pct_execucao = tarefas_feitas / NULLIF(total_tarefas,0)`
- `investimento_planejado`, `investimento_executado`,
  `variancia = executado - planejado`, `variancia_pct`
- contadores de oportunidades por marco: `total_oport`, `contatados`, `reunioes_ou_mais`, `ganhos`
- **`estado`** (derivado — avaliar **nesta ordem**, a primeira regra que casar vence; dado real
  ganha de execução de tarefa):
  1. **`Gerando dados`** — há **dado real de conversão**: `reunioes_ou_mais > 0` **ou** `ganhos > 0`.
     **Só neste estado o card mostra o bloco de KPIs.** (Ex.: um canal pode ter 0 tarefas feitas e já
     ter um fechamento via cliente ativo — conta como "Gerando dados".)
  2. **`Em execução`** — `contatados > 0` (houve contato), mas ainda sem reunião nem ganho.
  3. **`Pronto`** — alguma tarefa do canal já está `feito`, mas nenhum contato ainda.
  4. **`Em preparação`** — nada feito e nenhum contato (canal ainda sendo montado).

  Onde: `contatados` = oportunidades com `estagio` além de `cadastrado`; `reunioes_ou_mais` =
  `estagio in (reuniao, proposta, negociacao, fechado_ganho)`; `ganhos` = `fechado_ganho`.

### 7.2 `canal_kpis`

Uma linha por canal. Só faz sentido quando `estado = 'Gerando dados'` (a UI esconde KPI fora disso).

- `oportunidades`, `contatados`, `reunioes`, `ganhos`, `perdidos`
- `taxa_conversao = reunioes / NULLIF(contatados,0)` (contato→reunião) — **comparar com baseline 2%**
- `multiplo_vs_baseline = taxa_conversao / 0.02`
- `mrr_ganho = sum(valor_mrr) filter (estagio = 'fechado_ganho')`
- **`cac = investimento_executado / NULLIF(ganhos,0)`** — calculado, nunca armazenado
- **`roi = (mrr_ganho - investimento_executado) / NULLIF(investimento_executado,0)`** — calculado

> A baseline de **2%** é constante de produto. Centralizar em um único lugar no front
> (`const BASELINE_CONVERSAO = 0.02`) e na view.

---

## 8. RLS (ativa em todas as tabelas, antes de qualquer dado real)

Ferramenta interna de um time só → **todo usuário autenticado** lê e escreve tudo; **anônimo é
negado**. (Modelo de papéis por usuário pode vir depois; o schema já fica pronto para evoluir.)

```sql
alter table <cada_tabela> enable row level security;
create policy "auth_all_<tabela>" on <tabela>
  for all to authenticated using (true) with check (true);
-- nenhuma policy para 'anon' => anônimo bloqueado.
```

Aplicar a: `canais, investimentos, contas, contatos, interacoes, oportunidades, tarefas, gates,
modelos_mensagem, mensagens_log, voz_do_cliente`. As views herdam a segurança das tabelas-base
(`security_invoker = on`).

---

## 9. Importador de base (CSV) — mapeamento (módulo CRM, M3)

A base real vem da planilha `📋 Prospecção` (CRM Consolidado). Mapeamento coluna → campo:

| Coluna CSV | Campo `contas` | Transformação |
|---|---|---|
| Nº | `ref_externa` | texto |
| Responsável | `responsavel` | — |
| Nome | `nome` | obrigatório (linhas sem nome são ignoradas) |
| Endereço | `endereco` + `bairro` | `bairro` = trecho após o último " - " |
| Telefone | `telefone` | — |
| Instagram | `instagram` | — |
| entrevista agendada | `entrevista_agendada` | "✓ Sim" → true; "— Não"/vazio → false |
| Primeiro Contato (Whatsapp) | (gera `interacoes` tipo whatsapp) | "✓ Sim" → cria interação |
| Temperatura | `temperatura` | 🔥→quente · ☀→morno · ❄→frio · ⚫/vazio→sem_contato |
| Visitada? | `visitada` | "✓ Sim" → true |
| Gatekeeper | `contatos` (papel gatekeeper) | se preenchido |
| Decisor | `contatos` (papel decisor) | se preenchido |
| Data Contato | `data_primeiro_contato` | dd/mm/aaaa |
| Próx. Ação | `proxima_acao` | — |
| Obs / Notes | `obs` | — |
| **canal_origem** | `canal_origem_id` | escolhido na tela de importação (default: Outbound). **Sempre FK.** |

Ao importar, cada conta cria automaticamente **1 oportunidade** (`estagio` derivado da temperatura:
sem_contato/frio→`cadastrado`/`contatado`, morno→`qualificado`, quente→`reuniao`).

---

## 10. Regras de negócio

1. **canal_origem sempre FK.** Toda conta/oportunidade/tarefa-de-canal aponta para `canais.id`.
2. **CAC e ROI só nas views.** Proibido coluna `cac`/`roi`.
3. **KPI só com dado real.** Bloco de KPI escondido a menos que `estado = 'Gerando dados'`.
4. **Tarefa bloqueada** quando `depende_de` existe e sua tarefa-pai **não** está `feito`. A UI
   mostra "bloqueada" e impede marcar `feito`.
5. **Prazos relativos coloridos:** verde (folga), **âmbar** (≤ 2 dias para o prazo), **vermelho**
   (vencido). Texto humano ("em 2 dias", "atrasado há 1 dia") + data crua secundária.
6. **Mover oportunidade para `fechado_ganho`** recalcula KPIs do canal e o funil — refletido **em
   tempo real** no Dashboard (Realtime → invalida TanStack Query).
7. **Baseline = 2%.** Toda taxa de conversão é exibida em comparação a 2%.
8. **WhatsApp nunca é enviado.** Mensagens só registram status manual.

---

## 11. Estrutura de pastas (alvo)

```
Projeto UseFin/
├─ CLAUDE.md                       # este arquivo (canônico)
├─ docs/
│  └─ DASHBOARD.md                 # spec do dashboard + tempo real (canônico)
├─ .env.example                    # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
├─ index.html
├─ package.json
├─ vite.config.ts · tailwind.config.ts · tsconfig.json · components.json
├─ supabase/
│  ├─ migrations/                  # 0001_schema, 0002_rls, 0003_views, 0004_storage
│  ├─ functions/whatsapp/          # edge function PLACEHOLDER (sem envio real)
│  └─ seed.sql                     # dados reais + bloco de DEMONSTRAÇÃO (canônico)
└─ src/
   ├─ main.tsx · App.tsx · index.css
   ├─ lib/         supabase.ts, queryClient.ts, utils.ts, baseline.ts
   ├─ components/  ui/ (shadcn), layout/ (Sidebar, Shell), shared/
   ├─ features/    canais/ pipeline/ crm/ roadmap/ tarefas/ mensagens/ voz/ dashboard/
   │               (cada um: api hooks TanStack Query + componentes)
   ├─ hooks/       useRealtime.ts, useRelativeTime.ts
   ├─ pages/       Dashboard, Pipeline, CRM, Canais, Roadmap, Tarefas, Mensagens, Voz, Login
   └─ types/       database.ts (tipos gerados do Supabase)
```

---

## 12. Milestones (ordem fixa; checkpoint ao fim de cada um)

| M | Entrega | Critério de aceite |
|---|---|---|
| **M1 Scaffold** | Projeto Vite, design system Fin, sidebar + 8 rotas com estados vazios. Sem backend. | App roda, navega entre as 8 rotas, identidade visual aplicada, responsivo. |
| **M2 Supabase** | Env vars, auth e-mail/senha (app atrás do login), migrations (schema + RLS + views), `seed.sql` rodado. | Login persiste sessão. Contagens: **5 canais, ~139 contas, ~141 oportunidades, 29 tarefas, 2 gates**. RLS ativa. |
| **M3 CRM + Importador** | Tabela de contas (filtro temperatura + canal), ficha (contatos, interações), **Importar base** (CSV) com o mapeamento da §9. | Base importada aparece no CRM; filtros funcionam; ficha mostra contatos/interações. |
| **M4 Pipeline** | Kanban (8 estágios) com drag-and-drop + filtro por canal. | Arrastar card muda o estágio no banco; filtro por canal funciona. |
| **M5 Canais** | Card central: anel de % execução (`canal_execucao`), estado derivado, investimento planejado×executado + variância, KPIs (`canal_kpis`) **só em "Gerando dados"**. | Cada card mostra estado correto; KPI aparece só quando há dado real. |
| **M6 Roadmap + Tarefas** | Gantt 16/jun–24/ago + painel de gates (dias restantes); tarefas com dependência (bloqueio) e prazos coloridos relativos a hoje. | Tarefa bloqueada enquanto dependência ≠ feito; cores mudam conforme a data de hoje. |
| **M7 Mensagens** | Biblioteca de modelos por canal/estágio (variáveis `{nome}`/`{cafe}`/`{dor}`, A/B) + log manual. | Modelos filtram por canal/estágio; variáveis preenchem; log registra status manual. |
| **M8 Voz do Cliente** | Registros (4 tipos) + upload de imagem (Storage) + tags + "fixar como prova"; aparecem na ficha da conta. | Upload funciona; prova fixada aparece na conta vinculada. |
| **M9 Dashboard + tempo real** | Implementa `docs/DASHBOARD.md`: Foco de hoje, saúde dos canais (frases de risco), funil ao vivo (detecção de gargalo), investimento/ROI ao vivo, projeção transparente — tudo via Realtime. | Mover oportunidade p/ `fechado_ganho` atualiza KPIs e funil **em tempo real**; conversões comparadas a 2%. |
| **M10 QA** | Roda o checklist de aceite (§13). | Todos os itens passam. |

**Migrations (ordem):** `0001_schema.sql` (enums+tabelas+triggers) → `0002_rls.sql` →
`0003_views.sql` (canal_execucao, canal_kpis) → `0004_storage.sql` (bucket voz). `seed.sql` roda
depois das migrations.

---

## 13. Critério de PRONTO (checklist final — M10)

- [ ] Login persiste sessão; todo o app fica atrás do login.
- [ ] Base importada aparece no CRM **e** no Pipeline.
- [ ] Mover uma oportunidade para `fechado_ganho` atualiza os KPIs do canal **e** o funil **em tempo real**.
- [ ] O card de canal **desbloqueia KPIs no estado certo** ("Gerando dados").
- [ ] Prazos **mudam de cor** conforme a data de hoje (verde/âmbar/vermelho) com texto humano.
- [ ] Voz do Cliente **vinculada à conta** (aparece na ficha).
- [ ] **RLS ativa** em todas as tabelas; anônimo bloqueado; nenhuma chave no front além da anon.
- [ ] **Sem erros de console.**
- [ ] **Responsivo no mobile.**
- [ ] Nome **"UseFin"** em toda a interface.

---

## 14. Convenção de commits

```
feat:  nova funcionalidade        fix:   correção
chore: setup/config/tooling       docs:  documentação
```
Commits pequenos e descritivos, **um conjunto por milestone**. Checkpoint com a usuária ao fim de
cada milestone antes de seguir. Nunca pedir ação destrutiva sem confirmação.

---

## 15. Centro de Receita por Canal (M11 — evolução do Dashboard)

O Dashboard evoluiu de "acompanhamento da sprint" para **centro de decisão de receita**: prioriza
receita/MRR sobre volume de leads e compara a economia de cada canal. Decisões canônicas:

- **`canais.tipo`** (texto livre, malleável) — categoriza o canal: `outbound`, `inbound`,
  `comunidade`, `parceria`, `evento`, `conteudo`, `indicacao`, `outro`. Os 5 canais reais seguem
  existindo; a usuária cria novos canais reais com seus tipos. As visões por categoria
  (Comunidade/Parcerias/Eventos) filtram por `tipo`.
- **Funil de receita** (mapeado sobre os estágios canônicos §6.1, em `features/dashboard/receita.ts`):
  `Lead` = toda oportunidade · `MQL` = qualificado+ · `SQL` = reunião+ · `Proposta` = proposta+ ·
  `Cliente` = `fechado_ganho`.
- **Fórmulas** (continuam derivadas, nunca em coluna): `Pipeline Ponderado` = Σ(valor_mrr ×
  probabilidade) das oportunidades abertas (probabilidade default por estágio quando ausente);
  `Payback` (meses) = investido ÷ MRR ganho. O **custo do CAC** vem dos **custos itemizados**
  (`canal_economia.custo_total`) quando houver; senão cai no investimento executado
  (`canal_execucao`). CAC/Payback/ROI derivam todos desse mesmo custo. Canal **sem custo registrado**
  (investido = 0) exibe CAC/Payback/ROI como "—" (não "R$0").
- **Seções implementadas (dado real):** 1 Visão Executiva (cards de receita com período
  Semana/Mês/Trimestre + variação/tendência + origem dos clientes + Meta do mês), 2 **Performance
  por canal** — a **visão ÚNICA** de CAC/MRR/ROI por canal (alimentada pelos custos itemizados),
  8 Tendências (séries dos snapshots), 10 Recomendações automáticas. *(O heatmap e a tabela
  "Economia por canal" foram consolidados nessa visão única — evitar 3 leituras quase iguais.)*
- **Schema da Fase 2 (0008):** tabela `custos` (`tipo_custo`: horas/ferramentas/mídia/comissão/
  operacional, com `valor` e `horas`), tabela `metas` (MRR/clientes por mês), view `canal_economia`.
  Lançamento em **Roadmap → "Custos por canal" e "Metas mensais"**. A "Meta do mês" compara o MRR
  fechado no mês calendário com a meta cadastrada.
- **Seções da Fase 3 (0009), na página `/crescimento`:** 5 Comunidade, 6 Parcerias, 7 Eventos.
  Tabelas `comunidade_metricas` (membros/ativos/conversas/participação por mês), `parceiros`
  (ranking por receita) e `eventos` (CAC/ROI por evento). Entrada manual; o funil (Lead/Cliente/
  MRR) das frentes continua vindo das oportunidades por `canais.tipo` — sem entidades paralelas.
- **Linha do tempo por projetos (0013):** tabela `projetos` (`nome`, `data_inicio`, `prazo`,
  `status` a_fazer/fazendo/feito, `ordem`). O Gantt do Roadmap desenha **1 barra por projeto**
  (cor por status + regra de prazo §10.5: âmbar ≤2 dias, vermelho vencido); a janela se molda aos
  prazos cadastrados. Edição **inline** (sem lápis) em **Roadmap → Linha do tempo**. Os gates seguem
  como marcadores tracejados sobre a faixa; tarefas da sprint são coisa separada.
- Princípio mantido (§4.2): **KPI só com dado real** — nada de métrica de vaidade nem zero disfarçado.
