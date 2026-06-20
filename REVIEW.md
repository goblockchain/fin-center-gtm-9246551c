---
phase: code-review-fase2
reviewed: 2026-06-19T00:00:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - src/features/crescimento/ComunidadeSecao.tsx
  - src/features/crescimento/EventosSecao.tsx
  - src/features/crescimento/ParceirosSecao.tsx
  - src/features/crescimento/api.ts
  - src/features/crm/ImportarBaseDialog.tsx
  - src/features/crm/import.ts
  - src/features/dashboard/AtividadeSemana.tsx
  - src/features/dashboard/VisaoExecutiva.tsx
  - src/features/dashboard/atividade.ts
  - src/features/dashboard/receita.ts
  - src/features/dashboard/snapshots.ts
  - src/features/economia/CustosCanais.tsx
  - src/features/economia/EconomiaCanais.tsx
  - src/features/economia/MetasMensais.tsx
  - src/features/economia/api.ts
  - src/features/pipeline/PipelineBoard.tsx
  - src/features/pipeline/api.ts
  - src/lib/nav.ts
  - src/pages/CrescimentoPage.tsx
  - src/pages/DashboardPage.tsx
  - src/pages/RelatorioPage.tsx
  - src/pages/RoadmapPage.tsx
  - src/pages/TarefasPage.tsx
  - src/types/db.ts
findings:
  critical: 0
  warning: 6
  info: 5
  total: 11
status: issues_found
---

# Fase 2: Code Review Report

**Reviewed:** 2026-06-19
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

Reviewed the Fase 2 surface (Centro de Receita): CSV/Excel import, pipeline drag+click board, dashboard receita/atividade helpers, economia (custos/metas/view), and crescimento (comunidade/parcerias/eventos). The code is generally solid: divide-by-zero and "investido = 0 → CAC/Payback/ROI = —" are handled consistently, the optimistic-update rollback in the pipeline is correct, and the dnd-kit click-vs-drag separation (drag handle + `stopPropagation`, activation distance/delay) is sound. RLS-backed `supabase.from(...)` usage is by-design and not flagged.

No BLOCKERs. The highest-value findings are in the **import** path (the highest-risk area): a header-matching collision that silently writes the account name into `ref_externa`, a date parser with no month/day range validation, and a non-transactional multi-step insert that can leave partial data + duplicates on any mid-batch failure. The rest are React state foot-guns and minor quality issues.

## Warnings

### WR-01: Column-matching collision writes the account name into `ref_externa`

**File:** `src/features/crm/import.ts:87-95, 180`
**Issue:** `pick()` matches a column when the normalized header **includes** the needle as a substring, and it tries needles in order, returning on the first hit. For `ref_externa` the call is `pick(row, "no", "nº", "numero")`. The first needle `"no"` is a substring of `"nome"` (`"nome".includes("no") === true`), so on any sheet where a "Nome" column exists (always, per §9), `pick` returns the **café name** before it ever reaches the `"nº"` needle. Result: every imported account gets its own name stored in `ref_externa` (the spreadsheet row number is lost), silently corrupting that field for the whole base.
**Fix:** Make the number needle specific and/or match on whole-token boundaries instead of loose substring. Minimal fix — drop the ambiguous `"no"` and rely on the unambiguous tokens:
```ts
ref_externa: pick(row, "nº", "numero", "ref") || null,
```
Better: have `pick` prefer an exact normalized-header equality before falling back to substring, so `"nº"` wins over `"nome"` regardless of needle order.

### WR-02: `dataBR` accepts out-of-range months/days and emits invalid ISO dates

**File:** `src/features/crm/import.ts:112-118`
**Issue:** `dataBR` only regex-extracts and zero-pads — it never validates ranges. Input like `"32/13/2026"` yields `"2026-13-32"`, which is then placed into `contas.data_primeiro_contato`, `oportunidades.data_entrada_estagio`, and `interacoes.data`. Postgres rejects the invalid date, failing the insert. Because the import runs as several sequential, non-transactional `insert` calls (`useImportContas` in `crm/api.ts`), a failure on the *oportunidades* or *interacoes* step happens **after** `contas` is already committed (see WR-03).
**Fix:** Validate the parsed components and return `null` on anything out of range:
```ts
function dataBR(v: string): string | null {
  const m = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const day = +d, mon = +mo;
  const yyyy = y.length === 2 ? 2000 + +y : +y;
  if (mon < 1 || mon > 12 || day < 1 || day > 31) return null;
  const iso = `${yyyy}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}
```

### WR-03: Import is not transactional — partial failure leaves orphaned/duplicate data

**File:** `src/features/crm/import.ts:139-228` (payload) → consumed by `useImportContas` (`src/features/crm/api.ts:81-114`)
**Issue:** The import performs four independent `insert` passes (contas → oportunidades → contatos → interacoes), each a separate PostgREST round-trip. If any later pass throws (a bad date from WR-02, a network blip, an RLS edge), the already-inserted `contas` stay committed. There is no dedup key on `contas` (no unique on `nome`/`ref_externa`), so the user's natural reaction — fix the file and re-import — **duplicates every previously inserted account**, and the orphaned contas now have no oportunidade. `buildImportPayload` is where the IDs are minted, so it's the right layer to make robust.
**Fix:** Either (a) wrap the whole insert in a single Postgres RPC/transaction so it's all-or-nothing, or (b) at minimum add a unique constraint + `upsert(..., { onConflict })` so re-imports are idempotent. Surface a clear "partial import — N accounts created before the error" message so the user isn't blind to committed rows.

### WR-04: `isSim` treats any value containing "x" as truthy

**File:** `src/features/crm/import.ts:97`
**Issue:** `const isSim = (v) => /sim|✓|true|x/i.test(v) && !/não|nao/i.test(v);` — the bare `x` token under the `/i` flag matches the letter "x" anywhere in the cell. Spreadsheet free-text such as `"Next week"`, `"Box"`, `"Marx"`, or `"max 2"` in a Visitada/Entrevista/Primeiro-Contato column is read as `true`, flipping the boolean and (for "primeiro contato") fabricating a WhatsApp interaction. The intent (a lone "x" mark) is reasonable, but the match is far too loose.
**Fix:** Anchor the "x" to a standalone mark and keep the explicit words:
```ts
const isSim = (v: string) =>
  (/(^|\s)(sim|✓|true|x)(\s|$)/i.test(v.trim())) && !/n[aã]o/i.test(v);
```

### WR-05: Form pre-fill effect can clobber in-progress input on refetch

**File:** `src/features/economia/MetasMensais.tsx:15-23`; same pattern in `src/features/crescimento/ComunidadeSecao.tsx:31-40`
**Issue:** `existente` is a `useMemo(() => (metas ?? []).find(...))` and the pre-fill `useEffect` depends on `[existente]`. `Array.prototype.find` returns a **new object reference** every time `metas` is re-created (e.g., after the upsert invalidates `["metas"]`, or any background refetch). The effect then re-runs and overwrites the controlled `mrr`/`clientes` (or comunidade) inputs with the persisted values, discarding edits the user is mid-typing if a refetch lands before they save.
**Fix:** Depend on stable primitives instead of the object identity, e.g. key the effect on the resolved values and the selected month:
```ts
useEffect(() => {
  setMrr(existente ? String(Number(existente.meta_mrr)) : "");
  setClientes(existente ? String(existente.meta_clientes) : "");
  // re-sync only when the *selected month* or its stored values change
}, [comp, existente?.meta_mrr, existente?.meta_clientes]);
```

### WR-06: `useRealtime` subscribes once but closes over the initial `queryKeys`

**File:** `src/hooks/useRealtime.ts:15-32`
**Issue:** The effect runs with `[]` deps (intentionally, to subscribe once) but its handler closes over `tabelas`/`queryKeys` from the first render. This is safe *today* only because every caller passes module-level constants (`RT_KEYS` in `DashboardPage.tsx`, inline literals in `CrescimentoPage.tsx`). If any future caller passes a value derived from props/state, the subscription will silently keep invalidating the **stale** key set with no warning. The `eslint-disable` hides the footgun.
**Fix:** Either document the hard contract (callers MUST pass stable module constants) and assert it, or store `queryKeys` in a ref updated each render so the handler always reads the latest without re-subscribing:
```ts
const keysRef = useRef(queryKeys); keysRef.current = queryKeys;
// inside handler: for (const key of keysRef.current) qc.invalidateQueries({ queryKey: key });
```

## Info

### IN-01: `crypto.randomUUID()` may be undefined in non-secure browser contexts

**File:** `src/features/crm/import.ts:158`
**Issue:** `crypto.randomUUID` is only available in secure contexts (HTTPS / localhost). If the internal tool is ever served over plain HTTP on a LAN IP, the import throws `crypto.randomUUID is not a function` for the first row.
**Fix:** Guard with a fallback (`uuid` lib or a `getRandomValues`-based polyfill) when `crypto.randomUUID` is absent.

### IN-02: Origem/parceiro list keys use non-unique fields

**File:** `src/features/dashboard/VisaoExecutiva.tsx:251` (`key={o.nome}`)
**Issue:** The "De onde vieram os clientes" chips key on channel `nome`. Channel names are unique in practice, but keying on the already-available `canal_id` is collision-proof and cheaper to reason about. (`ParceirosSecao` keys on `p.id` — good; this is the only soft spot.)
**Fix:** Carry `canal_id` into the `origem` entries and use it as the React `key`.

### IN-03: `comunidade` conversion mixes all-time clients with current-month members

**File:** `src/features/crescimento/ComunidadeSecao.tsx:61-64`
**Issue:** `taxa = funil.clientes / ativosN` and `mrrPorMembro = funil.mrr / ativosN` divide **all-time** clients/MRR of comunidade-type channels by the **most recent month's** active members (`metricas?.[0]`). As months accumulate, the numerator grows while the denominator is a single month, so "Conv. comunidade" and "MRR/membro ativo" drift upward and can exceed 100%. Likely a product simplification, but worth confirming it's intended.
**Fix:** Either scope clients/MRR to the same competência as the members snapshot, or relabel the tiles to make the all-time-vs-month basis explicit.

### IN-04: `EconomiaCanais` empty-state flag is true even with zero channels

**File:** `src/features/economia/EconomiaCanais.tsx:8`
**Issue:** `const semCusto = linhas.every((e) => Number(e.custo_total ?? 0) === 0);` — `Array.every` on an empty array returns `true`, so the "lance custos…" hint shows even before any canal exists. Cosmetic only.
**Fix:** `const semCusto = linhas.length > 0 && linhas.every(...)`.

### IN-05: `parceiros.sqls` / `eventos.leads`/`sqls` captured in schema but not in the forms

**File:** `src/features/crescimento/ParceirosSecao.tsx:33-51`, `src/features/crescimento/EventosSecao.tsx:23-45`
**Issue:** The `parceiros` table has `sqls`, and `eventos` has `leads`/`sqls` (0009 migration), but the create forms never collect them (they default to 0). Not a bug — just dead schema surface relative to the UI; flagging so it's a conscious gap, not an oversight.
**Fix:** Add the inputs if those funnel stages are meant to be tracked, or drop the columns to keep schema and UI in sync.

---

_Reviewed: 2026-06-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
