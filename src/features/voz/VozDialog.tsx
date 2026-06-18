import { useEffect, useState, type ChangeEvent } from "react";
import { Loader2, AlertTriangle, ImagePlus, CheckCircle2 } from "lucide-react";
import {
  Dialog,
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
import { ContaPicker, type ContaRef } from "@/components/shared/ContaPicker";
import { useCriarVoz } from "./api";
import { TIPOS_VOZ, TIPO_VOZ_META } from "./tipos";
import type { TipoVoz } from "@/types/db";

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
        on
          ? "border-fin bg-fin-light/30 text-fin-dark"
          : "border-input text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "grid h-4 w-4 place-items-center rounded-sm border",
          on ? "border-fin bg-fin text-white" : "border-input",
        )}
      >
        {on && <CheckCircle2 className="h-3 w-3" />}
      </span>
      {label}
    </button>
  );
}

export function VozDialog({
  open,
  onOpenChange,
  contaInicial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contaInicial?: ContaRef | null;
}) {
  const criar = useCriarVoz();
  const [tipo, setTipo] = useState<TipoVoz>("depoimento");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [autor, setAutor] = useState("");
  const [resultado, setResultado] = useState("");
  const [conta, setConta] = useState<ContaRef | null>(null);
  const [tags, setTags] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [fixado, setFixado] = useState(false);
  const [imagem, setImagem] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTipo("depoimento");
      setTitulo("");
      setConteudo("");
      setAutor("");
      setResultado("");
      setConta(contaInicial ?? null);
      setTags("");
      setAutorizado(false);
      setFixado(false);
      setImagem(null);
      setErro(null);
    }
  }, [open, contaInicial]);

  async function salvar() {
    if (!conteudo.trim()) {
      setErro("O conteúdo (frase / narrativa) é obrigatório.");
      return;
    }
    setErro(null);
    try {
      await criar.mutateAsync({
        dados: {
          tipo,
          titulo: titulo.trim() || null,
          conteudo: conteudo.trim(),
          autor_cliente: autor.trim() || null,
          resultado_mensuravel: resultado.trim() || null,
          conta_id: conta?.id ?? null,
          autorizado,
          fixado_como_prova: fixado,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
        imagem,
      });
      onOpenChange(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    setImagem(e.target.files?.[0] ?? null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Voz do Cliente</DialogTitle>
          <DialogDescription>
            Depoimento, mensagem, narrativa ou relatório — prova vinculada à
            conta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Tipo">
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoVoz)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_VOZ.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_VOZ_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo label="Conta (opcional)">
              <ContaPicker value={conta} onChange={setConta} />
            </Campo>
          </div>

          <Campo label="Título (opcional)">
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </Campo>

          <Campo label="Conteúdo (frase / narrativa) *">
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="“Antes eu era contador da minha cafeteria…”"
            />
          </Campo>

          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Autor (cliente)">
              <Input
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="ex.: Alisson — Breadbox"
              />
            </Campo>
            <Campo label="Resultado mensurável">
              <Input
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                placeholder="ex.: 20h/semana economizadas"
              />
            </Campo>
          </div>

          <Campo label="Tags de uso (vírgula)">
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pitch, linkedin, site"
            />
          </Campo>

          <Campo label="Imagem (opcional)">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-secondary/40 px-3 py-2 text-sm hover:bg-secondary/70">
              <ImagePlus className="h-4 w-4 text-fin" />
              <span className="text-fin-dark">
                {imagem ? imagem.name : "Anexar imagem (print, foto)"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFile}
              />
            </label>
          </Campo>

          <div className="flex flex-wrap gap-3">
            <Toggle
              label="Autorizado p/ uso público"
              on={autorizado}
              onToggle={() => setAutorizado(!autorizado)}
            />
            <Toggle
              label="Fixar como prova"
              on={fixado}
              onToggle={() => setFixado(!fixado)}
            />
          </div>

          {erro && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> {erro}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={criar.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={criar.isPending}>
              {criar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-fin-dark">{label}</label>
      {children}
    </div>
  );
}
