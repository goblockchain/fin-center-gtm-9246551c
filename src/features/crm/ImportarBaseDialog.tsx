import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/format";
import { PLANOS, PLANO_PADRAO } from "@/lib/planos";
import { useCanais } from "@/features/canais/api";
import { useImportContas } from "./api";
import {
  parseImportFile,
  buildImportPayload,
  inspecionarColunas,
  type CsvRow,
} from "./import";

function Detectada({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]",
        ok ? "bg-fin-light/40 text-fin-dark" : "bg-muted text-muted-foreground",
      )}
    >
      <span>{ok ? "✓" : "—"}</span>
      {label}
    </span>
  );
}

export function ImportarBaseDialog() {
  const { data: canais } = useCanais();
  const importMut = useImportContas();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CsvRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [canalId, setCanalId] = useState("");
  const [valor, setValor] = useState(PLANO_PADRAO.valor);
  const [responsavel, setResponsavel] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState<number | null>(null);

  useEffect(() => {
    if (canais && !canalId) {
      const out = canais.find((c) => c.slug === "outbound");
      setCanalId(out?.id ?? canais[0]?.id ?? "");
    }
  }, [canais, canalId]);

  const colunas = useMemo(
    () => (rows ? inspecionarColunas(rows) : null),
    [rows],
  );
  const payload = useMemo(
    () =>
      rows && canalId
        ? buildImportPayload(rows, canalId, valor, responsavel.trim() || undefined)
        : null,
    [rows, canalId, valor, responsavel],
  );

  function reset() {
    setRows(null);
    setFileName("");
    setErro(null);
    setFeito(null);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setErro(null);
    setFeito(null);
    try {
      setRows(await parseImportFile(f));
    } catch {
      setErro("Não consegui ler esse arquivo. Confira se é um Excel ou CSV válido.");
      setRows(null);
    }
  }

  async function onImport() {
    if (!payload) return;
    setErro(null);
    try {
      const r = await importMut.mutateAsync(payload);
      setFeito(r.inseridas);
      setRows(null);
      setFileName("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao importar.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-fin-dark">
          <Upload className="h-4 w-4" /> Importar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar leads (Excel ou CSV)</DialogTitle>
          <DialogDescription>
            Suba um `.xlsx`, `.xls` ou `.csv`. As colunas são mapeadas
            automaticamente (Nome, Endereço, Temperatura, Decisor…) e o sistema
            pergunta o que faltar — começando pelo canal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-secondary/40 px-4 py-6 text-center text-sm hover:bg-secondary/70">
            <FileSpreadsheet className="h-5 w-5 text-fin" />
            <span className="font-medium text-fin-dark">
              {fileName || "Escolher arquivo .xlsx, .xls ou .csv"}
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={onFile}
            />
          </label>

          {/* Revisão: colunas detectadas (o que faltar fica visível) */}
          {colunas && (
            <div className="space-y-1.5 rounded-md border border-border p-3">
              <p className="text-xs font-medium text-fin-dark">
                Colunas detectadas
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Detectada ok={colunas.nome} label="Nome" />
                <Detectada ok={colunas.telefone} label="Telefone" />
                <Detectada ok={colunas.decisor} label="Decisor" />
                <Detectada ok={colunas.temperatura} label="Temperatura" />
                <Detectada ok={colunas.endereco} label="Endereço" />
              </div>
              {!colunas.nome && (
                <p className="flex items-center gap-1.5 text-xs text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" /> Não encontrei a coluna
                  “Nome” — linhas sem nome são ignoradas.
                </p>
              )}
            </div>
          )}

          {/* Perguntas: canal (obrigatório) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fin-dark">
              De qual canal? <span className="text-destructive">*</span>
            </label>
            <Select value={canalId} onValueChange={setCanalId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha o canal" />
              </SelectTrigger>
              <SelectContent>
                {(canais ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Todo lead importado nasce com este canal (FK). Padrão: Outbound.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fin-dark">Plano</label>
              <Select
                value={String(valor)}
                onValueChange={(v) => setValor(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANOS.map((p) => (
                    <SelectItem key={p.id} value={String(p.valor)}>
                      {p.nome} · {brl(p.valor)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fin-dark">
                Responsável padrão
              </label>
              <Input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="ex.: Natalia"
              />
            </div>
          </div>

          {payload && (
            <div className="rounded-md bg-accent/30 p-3 text-sm text-fin-dark">
              <strong>{payload.total}</strong> leads serão importados
              {payload.ignoradas > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  · {payload.ignoradas} linhas sem nome ignoradas
                </span>
              )}
              . Cada um vira 1 oportunidade no Pipe.
            </div>
          )}

          {erro && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> {erro}
            </p>
          )}
          {feito !== null && (
            <p className="flex items-center gap-2 text-sm text-fin">
              <CheckCircle2 className="h-4 w-4" /> {feito} leads importados com
              sucesso.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              onClick={onImport}
              disabled={!payload || payload.total === 0 || importMut.isPending}
            >
              {importMut.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Importar {payload ? `${payload.total} leads` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
