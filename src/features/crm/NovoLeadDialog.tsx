import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useCanais } from "@/features/canais/api";
import { TEMPERATURAS, TEMP_META } from "./temperatura";
import { TIPOS_NEGOCIO, TIPO_NEGOCIO_META, type TipoNegocio } from "./tipoNegocio";
import { PLANOS, PLANO_PADRAO } from "@/lib/planos";
import type { Temperatura, EstagioOport } from "@/types/db";
import { toast } from "sonner";

const nn = (s: string) => (s.trim() ? s.trim() : null);

function estagioPorTemperatura(t: Temperatura): EstagioOport {
  if (t === "quente") return "reuniao";
  if (t === "morno") return "qualificado";
  if (t === "frio") return "contatado";
  return "cadastrado";
}

type Form = {
  nome: string;
  canalId: string;
  temperatura: Temperatura;
  tipoNegocio: TipoNegocio | "none";
  telefone: string;
  instagram: string;
  bairro: string;
  endereco: string;
  responsavel: string;
  valor: number;
  obs: string;
};

const INICIAL: Form = {
  nome: "",
  canalId: "",
  temperatura: "sem_contato",
  tipoNegocio: "none",
  telefone: "",
  instagram: "",
  bairro: "",
  endereco: "",
  responsavel: "",
  valor: PLANO_PADRAO.valor,
  obs: "",
};

export function NovoLeadDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(INICIAL);
  const { data: canais } = useCanais();
  const qc = useQueryClient();

  const criar = useMutation({
    mutationFn: async (f: Form) => {
      const { data: conta, error: e1 } = await supabase
        .from("contas")
        .insert({
          nome: f.nome.trim(),
          canal_origem_id: f.canalId,
          temperatura: f.temperatura,
          tipo_negocio: f.tipoNegocio === "none" ? null : f.tipoNegocio,
          telefone: nn(f.telefone),
          instagram: nn(f.instagram),
          bairro: nn(f.bairro),
          endereco: nn(f.endereco),
          responsavel: nn(f.responsavel),
          obs: nn(f.obs),
        })
        .select("id")
        .single();
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("oportunidades").insert({
        conta_id: conta.id,
        canal_id: f.canalId,
        estagio: estagioPorTemperatura(f.temperatura),
        valor_mrr: f.valor,
      });
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
      toast.success("Lead criado.");
      setForm(INICIAL);
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message ?? "Erro ao criar lead."),
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const podeSalvar = form.nome.trim().length > 0 && !!form.canalId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Novo lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
          <DialogDescription>
            Cadastro manual de uma conta e sua oportunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome*</Label>
            <Input
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex.: Padaria da Esquina"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Canal*</Label>
              <Select
                value={form.canalId}
                onValueChange={(v) => set("canalId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent>
                  {(canais ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Temperatura</Label>
              <Select
                value={form.temperatura}
                onValueChange={(v) => set("temperatura", v as Temperatura)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURAS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TEMP_META[t].emoji} {TEMP_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo de negócio</Label>
              <Select
                value={form.tipoNegocio}
                onValueChange={(v) =>
                  set("tipoNegocio", v as TipoNegocio | "none")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— não informado —</SelectItem>
                  {TIPOS_NEGOCIO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_NEGOCIO_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plano</Label>
              <Select
                value={String(form.valor)}
                onValueChange={(v) => set("valor", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANOS.map((p) => (
                    <SelectItem key={p.id} value={String(p.valor)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Telefone</Label>
              <Input
                value={form.telefone}
                onChange={(e) => set("telefone", e.target.value)}
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@handle"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bairro</Label>
              <Input
                value={form.bairro}
                onChange={(e) => set("bairro", e.target.value)}
              />
            </div>
            <div>
              <Label>Responsável</Label>
              <Input
                value={form.responsavel}
                onChange={(e) => set("responsavel", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Endereço</Label>
            <Input
              value={form.endereco}
              onChange={(e) => set("endereco", e.target.value)}
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              rows={3}
              value={form.obs}
              onChange={(e) => set("obs", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => criar.mutate(form)}
            disabled={!podeSalvar || criar.isPending}
          >
            {criar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
