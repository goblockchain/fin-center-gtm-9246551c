import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useCanais } from "@/features/canais/api";
import { useImportContas } from "./api";
import { parseCsvFile, buildImportPayload, type CsvRow } from "./import";

export function ImportarBaseDialog() {
  const { data: canais } = useCanais();
  const importMut = useImportContas();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CsvRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [canalId, setCanalId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState<number | null>(null);

  useEffect(() => {
    if (canais && !canalId) {
      const out = canais.find((c) => c.slug === "outbound");
      setCanalId(out?.id ?? canais[0]?.id ?? "");
    }
  }, [canais, canalId]);

  const payload = useMemo(
    () => (rows && canalId ? buildImportPayload(rows, canalId) : null),
    [rows, canalId],
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
      setRows(await parseCsvFile(f));
    } catch {
      setErro("Não consegui ler esse CSV. Confira o arquivo.");
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
        <Button>
          <Upload className="h-4 w-4" />
          Importar base
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar base (CSV)</DialogTitle>
          <DialogDescription>
            Exporte a aba 📋 Prospecção como CSV. As colunas são mapeadas
            automaticamente (Nome, Endereço, Temperatura, Decisor…).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fin-dark">
              Canal de origem
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
              Toda conta importada nasce com este canal (FK). Padrão: Outbound.
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-secondary/40 px-4 py-6 text-center text-sm hover:bg-secondary/70">
            <Upload className="h-5 w-5 text-fin" />
            <span className="font-medium text-fin-dark">
              {fileName || "Escolher arquivo .csv"}
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFile}
            />
          </label>

          {payload && (
            <div className="rounded-md bg-accent/30 p-3 text-sm text-fin-dark">
              <strong>{payload.total}</strong> contas serão importadas
              {payload.ignoradas > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  · {payload.ignoradas} linhas sem nome ignoradas
                </span>
              )}
              . Cada uma cria 1 oportunidade.
            </div>
          )}

          {erro && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> {erro}
            </p>
          )}
          {feito !== null && (
            <p className="flex items-center gap-2 text-sm text-fin">
              <CheckCircle2 className="h-4 w-4" /> {feito} contas importadas com
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
              Importar {payload ? `${payload.total} contas` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
