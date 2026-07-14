import { useRef, useState } from "react";
import { AlertTriangle, Download, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { parseCSV, downloadText, type CsvRow } from "@/lib/csv";


type Status = "ideia" | "em_teste" | "validada" | "descartada";
type Categoria = "marca" | "comercial";

export type IniciativaImport = {
  id: string;
  titulo: string;
  categoria: Categoria;
  descricao: string;
  prazo: string;
  resultado: string;
  status: Status;
};

const TEMPLATE = [
  "titulo,categoria,descricao,prazo,resultado,status",
  "Definir nome único,marca,Padronizar identidade em site/IG/LinkedIn,2026-06-25,,em_teste",
  "A/B outbound,comercial,Testar duas mensagens de dor,2026-07-05,,ideia",
].join("\n");

function normStatus(v: string): Status {
  const s = (v || "").toLowerCase().trim();
  if (s === "validada" || s === "validado" || s === "done") return "validada";
  if (s === "descartada" || s === "descartado") return "descartada";
  if (s === "em_teste" || s === "em teste" || s === "testando") return "em_teste";
  return "ideia";
}

function normCategoria(v: string): Categoria {
  return (v || "").toLowerCase().trim() === "comercial" ? "comercial" : "marca";
}

function normDate(v: string): string {
  const s = (v || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return s;
}

export function ImportarIniciativasCsv({
  onReplace,
}: {
  onReplace: (items: IniciativaImport[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CsvRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function reset() {
    setRows(null);
    setFileName("");
    setErr(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(f: File) {
    setErr(null);
    setFileName(f.name);
    try {
      const text = await f.text();
      const parsed = parseCSV(text);
      if (!parsed.length) {
        setErr("Arquivo vazio ou sem linhas de dados.");
        setRows(null);
        return;
      }
      if (!("titulo" in parsed[0])) {
        setErr("Coluna obrigatória ausente: titulo");
        setRows(null);
        return;
      }
      setRows(parsed);
    } catch (e) {
      setErr(`Erro ao ler o arquivo: ${(e as Error).message}`);
      setRows(null);
    }
  }

  function confirmar() {
    if (!rows) return;
    setBusy(true);
    try {
      const items: IniciativaImport[] = rows.map((r, idx) => ({
        id: `i${Date.now()}-${idx}`,
        titulo: r.titulo || "",
        categoria: normCategoria(r.categoria ?? ""),
        descricao: r.descricao ?? "",
        prazo: normDate(r.prazo ?? ""),
        resultado: r.resultado ?? "",
        status: normStatus(r.status ?? "ideia"),
      }));
      onReplace(items);
      
      setOpen(false);
      reset();
    } catch (e) {
      setErr(`Falha ao importar: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Importar CSV
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar iniciativas (CSV)</DialogTitle>
            <DialogDescription>
              Substitui <strong>todas</strong> as iniciativas atuais pelas linhas
              do arquivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Colunas: <code>titulo</code>, <code>categoria</code>{" "}
              (marca/comercial), <code>descricao</code>, <code>prazo</code>{" "}
              (AAAA-MM-DD), <code>resultado</code>, <code>status</code>{" "}
              (ideia/em_teste/validada/descartada).
              <button
                type="button"
                className="ml-2 inline-flex items-center gap-1 text-fin hover:underline"
                onClick={() => downloadText("iniciativas-modelo.csv", TEMPLATE)}
              >
                <Download className="h-3 w-3" /> baixar modelo
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-secondary/70"
            />

            {fileName && rows && (
              <div className="rounded-md bg-fin-light/20 p-2.5 text-xs text-fin-dark">
                <strong>{fileName}</strong> — {rows.length} iniciativas prontas.
              </div>
            )}

            {err && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{err}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmar}
              disabled={!rows || busy}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Substituir iniciativas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
