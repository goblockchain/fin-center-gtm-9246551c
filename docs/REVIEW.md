---
phase: code-review-projetos-timeline
reviewed: 2026-06-20T00:00:00Z
depth: standard
diff_base: 42cef10
files_reviewed: 9
files_reviewed_list:
  - src/features/roadmap/projetos.ts
  - src/features/roadmap/ProjetosPanel.tsx
  - src/features/roadmap/Gantt.tsx
  - src/features/roadmap/timeline.ts
  - src/features/dashboard/receita.ts
  - src/features/dashboard/PerformanceCanais.tsx
  - src/features/dashboard/Recomendacoes.tsx
  - supabase/migrations/0013_projetos.sql
  - supabase/seed.sql
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: resolved
resolved_in: afed34f
---

# Code Review — Linha do tempo por projetos (0013) + consolidação de CAC

**Reviewed:** 2026-06-20
**Depth:** standard
**Diff:** `42cef10..HEAD`
**Files Reviewed:** 9 substantivos (28 alterados no total; o restante são edições de texto pt-BR sem lógica)
**Status:** resolved — os 3 warnings e os 4 info foram corrigidos no commit `afed34f`
(WR-01 fuso local via `urgencia`/`hojeISO`, WR-02 validação início≤prazo, WR-03 `ordem`
por máximo, IR-01 `DIA` centralizado, IR-02 cabeçalho por %, IR-03 override de cor,
IR-04 feedback de erro inline).

## Summary

A maior parte do change set é sólida. A nova feature de **projetos** (migration `0013`, hooks
`projetos.ts`, `ProjetosPanel.tsx`, reescrita do `Gantt.tsx`) está bem estruturada: a RLS segue o
padrão canônico (`auth_all_projetos`, só `authenticated`, anônimo bloqueado), o trigger
`set_updated_at` é aplicado corretamente, e os tipos hand-edited em `database.ts`/`db.ts` batem
1:1 com a coluna da migration. A consolidação de **CAC/ROI** em `receita.ts` (custo itemizado de
`canal_economia.custo_total` com fallback para `investimento_executado`, e ROI recomputado a partir
do mesmo custo) está **correta e consistente** com o CLAUDE.md §15. As duas remoções
(`HeatmapCanais`, `EconomiaCanais`) estão limpas — confirmei via `git grep` que **não há nenhuma
referência pendente** em `HEAD`. O `seed.sql` está correto: o `truncate` inclui `projetos`, o toggle
`disable/enable trigger trg_log_pipeline_evento` envolve o insert em massa de oportunidades de forma
balanceada e dentro da mesma transação, e o trigger referenciado existe (migration `0010`).

Encontrei **2 bugs reais de correção** (ambos na nova feature de timeline) e alguns pontos de
qualidade. Nenhum é bloqueador de segurança ou de perda de dados — daí 0 críticos —, mas o WR-01
(off-by-one de fuso no "hoje" do Gantt) e o WR-02 (falta de validação início ≤ prazo) afetam
diretamente a regra de prazo §10.5, que o projeto trata como não-negociável.

## Warnings

### WR-01: Gantt usa data UTC para "hoje" na regra de cor de prazo — off-by-one no fim do dia (UTC-3)

**File:** `src/features/roadmap/Gantt.tsx:35` (consumido em :17, :18, :140, :141)
**Issue:** `hojeIso` é derivado de `new Date().toISOString().slice(0, 10)`, que produz a data em
**UTC**. O resto da timeline (`corProjeto`, linha 18) compara/subtrai usando `ms(iso) = new
Date(\`${iso}T00:00:00\`)`, que é **meia-noite local**. Em Florianópolis (UTC-3), das ~21:00 às
23:59 locais o `toISOString()` já virou o dia seguinte — então `hojeIso` fica **um dia à frente** da
data local real. Consequências nesse intervalo:
- `p.prazo < hojeIso` (linha 17) marca como **atrasado (vermelho)** um projeto cujo prazo é
  exatamente hoje;
- `dias = ceil((ms(p.prazo) - ms(hojeIso)) / DIA)` (linha 18) fica deslocado em 1, mudando a
  fronteira do âmbar (≤ 2 dias);
- o marcador "hoje" (`tl.pos(hojeIso)`, linha 141) é desenhado na posição do dia seguinte.

Isso é inconsistente com `src/lib/datas.ts` (`diasAte`/`urgencia`), que faz certo usando
`new Date(); hoje.setHours(0,0,0,0)` (meia-noite **local**). A regra de cor de prazo (§10.5) é
canônica, então vale corrigir.
**Fix:** derivar o "hoje" em meia-noite local, alinhado ao resto do código:
```ts
// no topo do componente, no lugar de new Date().toISOString().slice(0,10)
const hojeIso = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // data local em yyyy-mm-dd (sem passar por UTC)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
})();
```
Idealmente extrair isso para um helper único em `lib/datas.ts` (ex.: `hojeIso()`) e reusar aqui e em
`timeline.ts`/`receita.ts` para evitar a divergência se repetir.

### WR-02: Editor inline de projeto não valida `data_inicio <= prazo` — gera barra invertida no Gantt

**File:** `src/features/roadmap/ProjetosPanel.tsx:52-67` (efeito visível em `Gantt.tsx:91-93`)
**Issue:** Os campos de data salvam de forma independente
(`onChange={(e) => e.target.value && salvar({ data_inicio: e.target.value })}` e idem para `prazo`),
sem nenhuma checagem de que o início não fica depois do prazo. Nada impede a usuária de cadastrar um
projeto com `data_inicio > prazo` (no `adicionar` da linha 108 também não há essa validação). Quando
isso acontece, no Gantt `left = tl.pos(data_inicio)` fica maior que `right = tl.pos(prazo)`, e
`width = Math.max(1.5, right - left)` cai no piso de `1.5%` — a barra renderiza com início e fim
trocados e largura mínima, comunicando uma duração errada. Não quebra (o `Math.max` evita largura
negativa), mas exibe dado incorreto silenciosamente, o que conflita com o princípio "nunca mostrar
métrica enganosa".
**Fix:** validar na escrita. No `salvar` da linha, recusar/normalizar quando inverter; no
`adicionar`, bloquear o submit:
```ts
// adicionar()
if (!nome.trim() || !inicio || !prazo) return;
if (prazo < inicio) return; // ISO yyyy-mm-dd compara lexicograficamente

// ProjetoRow — ao mudar uma das datas
onChange={(e) => {
  const v = e.target.value;
  if (v && v <= p.prazo) salvar({ data_inicio: v });
}}
// e no campo de prazo:
onChange={(e) => {
  const v = e.target.value;
  if (v && v >= p.data_inicio) salvar({ prazo: v });
}}
```
(Idealmente com feedback visual de por que não salvou, mas no mínimo não persistir o estado inválido.)

### WR-03: `ordem` de novo projeto pode colidir após exclusões

**File:** `src/features/roadmap/ProjetosPanel.tsx:110`
**Issue:** `const ordem = (projetos ?? []).length + 1;`. `ordem` é derivado da **contagem** da lista,
não do máximo existente. Depois de excluir um projeto do meio, a contagem cai e o próximo
`adicionar` reusa um valor de `ordem` que já existe (ex.: lista [1,2,3] → exclui o de ordem 2 →
`length+1 = 3` → colide com o que já tem ordem 3). Como o `useProjetos` ordena por `ordem` e depois
por `data_inicio`, o desempate fica indefinido entre os dois itens de mesma ordem — a posição na
tabela e no Gantt pode "pular" de forma confusa. Não corrompe dados, mas a ordenação fica instável.
**Fix:** usar o máximo de `ordem` existente, não a contagem:
```ts
const ordem = Math.max(0, ...(projetos ?? []).map((p) => p.ordem)) + 1;
```

## Info

### IR-01: Helpers `DIA`/`ms` duplicados entre `timeline.ts` e `Gantt.tsx`

**File:** `src/features/roadmap/Gantt.tsx:10-11` e `src/features/roadmap/timeline.ts:3-4`
**Issue:** `const DIA = 86_400_000;` e `const ms = (iso) => new Date(\`${iso}T00:00:00\`).getTime();`
estão definidos identicamente nos dois arquivos (e `DIA` também em `lib/datas.ts`). Duplicação pequena,
mas é exatamente o tipo de helper de data cuja divergência causou o WR-01. Centralizar reduz o risco.
**Fix:** exportar `DIA` e um `msLocal(iso)` de `lib/datas.ts` (ou de `timeline.ts`) e importar nos dois.

### IR-02: Cabeçalho de semanas (S1..Sn) não alinha com a posição percentual das barras

**File:** `src/features/roadmap/Gantt.tsx:65-80` vs `timeline.ts:39`
**Issue:** O cabeçalho desenha `tl.semanas` colunas de largura igual (`minmax(0,1fr)`), mas as barras
e os marcadores são posicionados por **porcentagem** via `tl.pos()` sobre o `span` real. Como
`semanas = ceil(span / 7dias)`, a última coluna quase sempre representa uma semana parcial, então os
rótulos "S1..Sn" ficam levemente deslocados das linhas de grade reais. É puramente cosmético (os
rótulos são aproximados), mas dá a impressão de que as barras "não batem" com as semanas.
**Fix (opcional):** ou aceitar como aproximação (documentar), ou posicionar os divisores de semana
também por porcentagem (`left: (i*7dias/span)*100%`) para casar com as barras.

### IR-03: `descricao`/`cor` existem no schema e nos tipos, mas não há UI para editá-los

**File:** `supabase/migrations/0013_projetos.sql:11,15`; `src/features/roadmap/ProjetosPanel.tsx`
**Issue:** A tabela `projetos` tem `descricao` e `cor` (override de cor), e o seed popula `descricao`.
O `ProjetosPanel` não expõe nenhum dos dois e o `Gantt` ignora `p.cor` (sempre deriva a cor de
status/prazo em `corProjeto`). Não é bug — só colunas atualmente mortas do ponto de vista da UI.
**Fix:** ou usar `p.cor` como override em `corProjeto` quando presente (`if (p.cor) return {...}`), ou
remover as colunas se não forem entrar no roadmap de UI, para não acumular schema sem dono.

### IR-04: `useProjetos` (e os hooks de mutação) não tratam erro na UI

**File:** `src/features/roadmap/projetos.ts:7-56`; consumido em `ProjetosPanel.tsx`/`Gantt.tsx`
**Issue:** Os hooks fazem `throw error` corretamente, mas os componentes só leem `data` (ex.:
`const { data: projetos } = useProjetos();`) — não há tratamento de `isError`/`onError`. Se um
`update`/`insert`/`delete` falhar (ex.: RLS por sessão expirada), a mutação some sem feedback e a
edição inline parece "não ter pego". Consistente com o resto do app? Vale ao menos um toast de erro
nas mutações de escrita, dado que a edição é otimisticamente silenciosa (salva no blur/change).
**Fix:** adicionar `onError` (toast) nos `useMutation` de `projetos.ts`, ou tratar `mutation.isError`
no `ProjetosPanel`.

---

_Reviewed: 2026-06-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
