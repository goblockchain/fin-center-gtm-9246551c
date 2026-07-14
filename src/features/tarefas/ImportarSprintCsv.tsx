import { useState, useRef } from "react";
import { AlertTriangle, Download, Loader2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCanais } from "@/features/canais/api";
import { parseCSV, downloadText, type CsvRow } from "@/lib/csv";
import type { StatusTarefa } from "@/types/db";
import { toast } from "sonner";

const TEMPLATE = [
  "codigo,frente,titulo,responsavel,data_inicio,prazo,status,canal_slug,depende_de",
  "S1,Setup,Definir ICP,Natalia,2026-06-16,2026-06-20,feito,,",
  "Y1,Yungas,Alinhar co-marketing,Natalia,2026-06-17,2026-06-24,fazendo,base-yungas,S1",
  "O1,Outbound,Prospectar 40 cafeterias,Natalia,2026-06-20,2026-07-04,a_fazer,outbound,",
].join("\n");

function normStatus(v: string): StatusTarefa {
  const s = v.toLowerCase().trim();
  if (s === "feito" || s === "done" || s === "concluido") return "feito";
  if (s === "fazendo" || s === "doing" || s === "em_andamento") return "fazendo";
  return "a_fazer";
}

function normDate(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  // aceita YYYY-MM-DD ou DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

export function ImportarSprintCsv() {
  const qc = useQueryClient();
  const { data: canais } = useCanais();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CsvRow[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
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
      const req = ["codigo", "frente", "titulo"];
      const missing = req.filter((c) => !(c in parsed[0]));
      if (missing.length) {
        setErr(`Colunas obrigatórias ausentes: ${missing.join(", ")}`);
        setRows(null);
        return;
      }
      setRows(parsed);
    } catch (e) {
      setErr(`Erro ao ler o arquivo: ${(e as Error).message}`);
      setRows(null);
    }
  }

  async function confirmar() {
    if (!rows) return;
    setBusy(true);
    setErr(null);
    try {
      const slugToId = new Map((canais ?? []).map((c) => [c.slug, c.id]));

      // 1) apaga tudo
      const del = await supabase.from("tarefas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (del.error) throw del.error;

      // 2) insere sem depende_de (resolvemos por codigo depois)
      const inserts = rows.map((r, idx) => {
        const slug = (r.canal_slug ?? "").trim();
        const canal_id = slug ? slugToId.get(slug) ?? null : null;
        return {
          codigo: r.codigo,
          frente: r.frente,
          titulo: r.titulo,
          responsavel: r.responsavel || null,
          data_inicio: normDate(r.data_inicio ?? ""),
          prazo: normDate(r.prazo ?? ""),
          status: normStatus(r.status ?? "a_fazer"),
          canal_id,
          depende_de: null,
          ordem: idx,
        };
      });

      const ins = await supabase.from("tarefas").insert(inserts).select("id,codigo");
      if (ins.error) throw ins.error;

      // 3) resolve depende_de por codigo
      const idByCodigo = new Map((ins.data ?? []).map((t) => [t.codigo, t.id]));
      const deps = rows
        .map((r) => ({
          codigo: r.codigo,
          dep: (r.depende_de ?? "").trim(),
        }))
        .filter((r) => r.dep && idByCodigo.has(r.dep) && idByCodigo.has(r.codigo));

      for (const { codigo, dep } of deps) {
        const id = idByCodigo.get(codigo)!;
        const depId = idByCodigo.get(dep)!;
        const up = await supabase
          .from("tarefas")
          .update({ depende_de: depId })
          .eq("id", id);
        if (up.error) throw up.error;
      }

      await qc.invalidateQueries({ queryKey: ["tarefas"] });
      await qc.invalidateQueries({ queryKey: ["canal_execucao"] });
      toast.success(`Sprint substituída: ${inserts.length} tarefas importadas.`);
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
            <DialogTitle>Importar sprint (CSV)</DialogTitle>
            <DialogDescription>
              Substitui <strong>todas</strong> as tarefas atuais pelas linhas do
              arquivo. Ação destrutiva e sem desfazer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Colunas: <code>codigo</code>, <code>frente</code>,{" "}
              <code>titulo</code>, <code>responsavel</code>,{" "}
              <code>data_inicio</code>, <code>prazo</code>, <code>status</code>{" "}
              (a_fazer/fazendo/feito), <code>canal_slug</code>,{" "}
              <code>depende_de</code> (código de outra tarefa).
              <button
                type="button"
                className="ml-2 inline-flex items-center gap-1 text-fin hover:underline"
                onClick={() => downloadText("sprint-modelo.csv", TEMPLATE)}
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
                <strong>{fileName}</strong> — {rows.length} linhas prontas para
                importar.
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
              Substituir sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
