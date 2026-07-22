import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Instagram,
  User,
  CalendarCheck,
  CheckCircle2,
  Quote,
  Pencil,
  Loader2,
  Tag,
  Pin,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/format";
import {
  PLANOS,
  PLANO_PADRAO,
  rotuloPlano,
  planoFixo,
  exigeUnidades,
  valorParaTipo,
} from "@/lib/planos";
import { TemperaturaChip, TEMP_META, TEMPERATURAS } from "./temperatura";
import { TipoNegocioChip, TIPOS_NEGOCIO, TIPO_NEGOCIO_META, type TipoNegocio } from "./tipoNegocio";
import { detalheDoCanal } from "./origemDetalhe";
import {
  useContatos,
  useInteracoes,
  useContaOportunidade,
  useAtualizarConta,
  useAtualizarPlano,
  useAtualizarCanalDaOport,
  useAtualizarVinculoOport,
  useExcluirConta,
} from "./api";
import { useCanais } from "@/features/canais/api";
import { useParceiros, useEventos } from "@/features/crescimento/api";
import { useVozesDaConta } from "@/features/voz/api";
import { TIPO_VOZ_META } from "@/features/voz/tipos";
import type {
  Conta,
  PapelContato,
  TipoInteracao,
  Temperatura,
} from "@/types/db";

const PAPEL_LABEL: Record<PapelContato, string> = {
  decisor: "Decisor",
  gatekeeper: "Gatekeeper",
  influenciador: "Influenciador",
  outro: "Contato",
};
const TIPO_LABEL: Record<TipoInteracao, string> = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  visita: "Visita",
  reuniao: "Reunião",
  email: "E-mail",
  outro: "Interação",
};

function fmtData(d: string | null) {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}
const nn = (s: string) => (s.trim() ? s.trim() : null);

function Linha({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm text-foreground">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span>{children}</span>
    </div>
  );
}

type Form = {
  nome: string;
  temperatura: Temperatura;
  tipoNegocio: TipoNegocio | "none";
  unidades: string;
  canalId: string;
  origemDetalhe: string;
  vinculoId: string;
  responsavel: string;
  telefone: string;
  instagram: string;
  endereco: string;
  bairro: string;
  proxima_acao: string;
  obs: string;
  enriquecimento: string;
  visitada: boolean;
  entrevista_agendada: boolean;
  valor: number;
};

export function ContaSheet({
  conta,
  canalNome,
  open,
  onOpenChange,
}: {
  conta: Conta | null;
  canalNome?: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const cid = open ? conta?.id : undefined;
  const { data: contatos } = useContatos(cid);
  const { data: interacoes } = useInteracoes(cid);
  const { data: oport } = useContaOportunidade(cid);
  const { data: vozes } = useVozesDaConta(cid);
  const { data: canais } = useCanais();
  const { data: parceiros } = useParceiros();
  const { data: eventos } = useEventos();
  const atualizarConta = useAtualizarConta();
  const atualizarPlano = useAtualizarPlano();
  const atualizarCanal = useAtualizarCanalDaOport();
  const atualizarVinculo = useAtualizarVinculoOport();
  const excluir = useExcluirConta();

  async function excluirLead() {
    if (!conta) return;
    const ok = window.confirm(
      `Excluir o lead "${conta.nome}"? Esta ação remove também contatos, interações e a oportunidade vinculada. Não pode ser desfeita.`,
    );
    if (!ok) return;
    await excluir.mutateAsync(conta.id);
    onOpenChange(false);
  }

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  useEffect(() => {
    setEditando(false);
    setErroSalvar(null);
  }, [conta?.id, open]);

  function abrirEdicao() {
    if (!conta) return;
    setForm({
      nome: conta.nome ?? "",
      temperatura: conta.temperatura,
      tipoNegocio: conta.tipo_negocio ?? "none",
      unidades: conta.unidades ? String(conta.unidades) : "",
      canalId: conta.canal_origem_id,
      origemDetalhe: conta.origem_detalhe ?? "",
      vinculoId: oport?.parceiro_id ?? oport?.evento_id ?? "",
      responsavel: conta.responsavel ?? "",
      telefone: conta.telefone ?? "",
      instagram: conta.instagram ?? "",
      endereco: conta.endereco ?? "",
      bairro: conta.bairro ?? "",
      proxima_acao: conta.proxima_acao ?? "",
      obs: conta.obs ?? "",
      enriquecimento: conta.enriquecimento ?? "",
      visitada: conta.visitada,
      entrevista_agendada: conta.entrevista_agendada,
      valor: Number(oport?.valor_mrr) || PLANO_PADRAO.valor,
    });
    setErroSalvar(null);
    setEditando(true);
  }

  async function salvar() {
    if (!conta || !form) return;
    setErroSalvar(null);
    try {
      const tipoSalvo = form.tipoNegocio === "none" ? null : form.tipoNegocio;
      await atualizarConta.mutateAsync({
        id: conta.id,
        patch: {
          nome: form.nome.trim() || conta.nome,
          temperatura: form.temperatura,
          tipo_negocio: tipoSalvo,
          unidades:
            exigeUnidades(tipoSalvo) && Number(form.unidades) > 0
              ? Number(form.unidades)
              : null,
          canal_origem_id: form.canalId,
          origem_detalhe: nn(form.origemDetalhe),
          responsavel: nn(form.responsavel),
          telefone: nn(form.telefone),
          instagram: nn(form.instagram),
          endereco: nn(form.endereco),
          bairro: nn(form.bairro),
          proxima_acao: nn(form.proxima_acao),
          obs: nn(form.obs),
          enriquecimento: nn(form.enriquecimento),
          visitada: form.visitada,
          entrevista_agendada: form.entrevista_agendada,
        },
      });
      if (oport && form.valor > 0 && Number(oport.valor_mrr) !== form.valor) {
        await atualizarPlano.mutateAsync({ oportId: oport.id, valor: form.valor });
      }
      if (oport && oport.canal_id !== form.canalId) {
        await atualizarCanal.mutateAsync({ oportId: oport.id, canalId: form.canalId });
      }
      if (oport) {
        const tipoNovo = (canais ?? []).find((c) => c.id === form.canalId)?.tipo;
        const parceiroId = tipoNovo === "parceria" ? form.vinculoId || null : null;
        const eventoId = tipoNovo === "evento" ? form.vinculoId || null : null;
        if (
          parceiroId !== (oport.parceiro_id ?? null) ||
          eventoId !== (oport.evento_id ?? null)
        ) {
          await atualizarVinculo.mutateAsync({
            oportId: oport.id,
            parceiroId,
            eventoId,
          });
        }
      }
      setEditando(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao salvar. Tente novamente.";
      setErroSalvar(msg);
      console.error("Erro ao salvar lead:", e);
    }
  }

  const salvando =
    atualizarConta.isPending ||
    atualizarPlano.isPending ||
    atualizarCanal.isPending ||
    atualizarVinculo.isPending;
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  /** Mesma regra do cadastro: franqueado trava no Essencial; só franqueador usa unidades. */
  const setTipoNegocio = (t: TipoNegocio | "none") => {
    const tipo = t === "none" ? null : t;
    setForm((f) =>
      f
        ? {
            ...f,
            tipoNegocio: t,
            valor: valorParaTipo(tipo, f.valor),
            unidades: exigeUnidades(tipo) ? f.unidades : "",
          }
        : f,
    );
  };

  const tipoEdit = !form || form.tipoNegocio === "none" ? null : form.tipoNegocio;
  const fixoEdit = planoFixo(tipoEdit);
  const unidadesEditNum = Number(form?.unidades);
  const unidadesEditOk =
    !exigeUnidades(tipoEdit) ||
    !form?.unidades ||
    (Number.isInteger(unidadesEditNum) && unidadesEditNum > 0);
  const podeSalvarEdit = !!form && unidadesEditOk;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {conta && !editando && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <TemperaturaChip temp={conta.temperatura} />
                {canalNome && (
                  <Badge variant="outline">
                    {canalNome}
                    {conta.origem_detalhe ? ` · ${conta.origem_detalhe}` : ""}
                  </Badge>
                )}
                <TipoNegocioChip tipo={conta.tipo_negocio} />
              </div>
              <div className="flex items-start justify-between gap-2">
                <SheetTitle>{conta.nome}</SheetTitle>
                <Button size="sm" variant="outline" onClick={abrirEdicao}>
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
              </div>
              <SheetDescription>
                {conta.bairro ?? "Bairro não informado"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-2 border-y border-border py-4">
              {conta.endereco && <Linha icon={MapPin}>{conta.endereco}</Linha>}
              {conta.telefone && <Linha icon={Phone}>{conta.telefone}</Linha>}
              {conta.instagram && (
                <Linha icon={Instagram}>{conta.instagram}</Linha>
              )}
              {conta.responsavel && (
                <Linha icon={User}>Responsável: {conta.responsavel}</Linha>
              )}
              <Linha icon={Tag}>
                Plano: {rotuloPlano(oport?.valor_mrr)}{" "}
                <span className="text-muted-foreground">
                  ({brl(oport?.valor_mrr)}/mês)
                </span>
                {conta.unidades ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · rede de {conta.unidades} unidades
                  </span>
                ) : null}
              </Linha>
              {conta.proxima_acao && (
                <Linha icon={CalendarCheck}>
                  Próxima ação: {conta.proxima_acao}
                </Linha>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {conta.visitada && (
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Visitada
                  </Badge>
                )}
                {conta.entrevista_agendada && (
                  <Badge variant="secondary">Entrevista agendada</Badge>
                )}
              </div>
              {conta.obs && (
                <p className="pt-1 text-sm text-muted-foreground">{conta.obs}</p>
              )}
            </div>

            {/* Informações enriquecidas — espaço para pesquisa/contexto do lead */}
            <div className="mt-4 rounded-md border border-fin-light/40 bg-fin-light/10 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fin-dark">
                Informações enriquecidas
              </p>
              {conta.enriquecimento ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {conta.enriquecimento}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Nenhuma informação registrada. Clique em Editar para adicionar contexto, pesquisa, notas sobre a operação, decisores, etc.
                </p>
              )}
            </div>

            <Tabs defaultValue="contatos">
              <TabsList className="w-full">
                <TabsTrigger value="contatos" className="flex-1">
                  Contatos ({contatos?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="interacoes" className="flex-1">
                  Interações ({interacoes?.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contatos">
                {!contatos?.length ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum contato registrado.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {contatos.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-md border border-border p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-fin-dark">
                            {c.nome}
                          </span>
                          <Badge variant="outline">{PAPEL_LABEL[c.papel]}</Badge>
                        </div>
                        {(c.telefone || c.email) && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[c.telefone, c.email].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="interacoes">
                {!interacoes?.length ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma interação registrada.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {interacoes.map((i) => (
                      <li
                        key={i.id}
                        className="rounded-md border border-border p-3"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{TIPO_LABEL[i.tipo]}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {fmtData(i.data)}
                          </span>
                        </div>
                        {i.resumo && (
                          <p className="mt-1 text-sm text-foreground">
                            {i.resumo}
                          </p>
                        )}
                        {i.autor && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            por {i.autor}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-2">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-fin-dark">
                <Quote className="h-4 w-4" /> Voz do Cliente ({vozes?.length ?? 0})
              </p>
              {!vozes?.length ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum registro vinculado a esta conta ainda.
                </p>
              ) : (
                <ul className="space-y-2">
                  {vozes.map((v) => (
                    <li
                      key={v.id}
                      className="rounded-md border border-border p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            TIPO_VOZ_META[v.tipo].chip,
                          )}
                        >
                          {TIPO_VOZ_META[v.tipo].label}
                        </span>
                        {v.fixado_como_prova && (
                          <Badge variant="success">
                            <Pin className="mr-1 h-3 w-3" /> Prova
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm italic text-foreground">
                        “{v.conteudo}”
                      </p>
                      {v.resultado_mensuravel && (
                        <p className="mt-1 text-xs font-medium text-fin">
                          {v.resultado_mensuravel}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {conta && editando && form && (
          <>
            <SheetHeader>
              <SheetTitle>Editar lead</SheetTitle>
              <SheetDescription>
                Atualize temperatura, responsável, dados e plano.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-3">
              <Campo label="Nome">
                <Input
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Temperatura">
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
                </Campo>
                {fixoEdit ? (
                  <Campo label="Plano">
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                      {fixoEdit.nome} · {brl(fixoEdit.valor)}/mês
                    </div>
                  </Campo>
                ) : exigeUnidades(tipoEdit) ? (
                  <Campo label="Unidades da rede*">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={form.unidades}
                      onChange={(e) => set("unidades", e.target.value)}
                      placeholder="Ex.: 8"
                    />
                  </Campo>
                ) : (
                  <Campo label="Plano">
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
                            {p.nome} · {brl(p.valor)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Campo>
                )}
              </div>

              <Campo label="Tipo de negócio">
                <Select
                  value={form.tipoNegocio}
                  onValueChange={(v) => setTipoNegocio(v as TipoNegocio | "none")}
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
              </Campo>

              {exigeUnidades(tipoEdit) && (
                <Campo label="MRR negociado*">
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    value={form.valor || ""}
                    onChange={(e) => set("valor", Number(e.target.value))}
                    placeholder="Ex.: 1600"
                  />
                </Campo>
              )}

              <Campo label="Canal (fonte)">
                <Select
                  value={form.canalId}
                  onValueChange={(v) =>
                    // Trocar de canal zera o detalhe — ele só faz sentido no canal de origem.
                    setForm((f) =>
                      f ? { ...f, canalId: v, origemDetalhe: "" } : f,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {(canais ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>

              {(() => {
                const slug = (canais ?? []).find((c) => c.id === form.canalId)
                  ?.slug;
                const d = detalheDoCanal(slug);
                if (!d) return null;
                return (
                  <Campo label={d.label}>
                    {d.modo === "select" ? (
                      <Select
                        value={form.origemDetalhe}
                        onValueChange={(v) => set("origemDetalhe", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.opcoes.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={form.origemDetalhe}
                        onChange={(e) => set("origemDetalhe", e.target.value)}
                        placeholder={d.placeholder}
                      />
                    )}
                  </Campo>
                );
              })()}

              {(() => {
                const tipo = (canais ?? []).find((c) => c.id === form.canalId)
                  ?.tipo;
                if (tipo !== "parceria" && tipo !== "evento") return null;
                const lista =
                  tipo === "parceria" ? (parceiros ?? []) : (eventos ?? []);
                return (
                  <Campo label={tipo === "parceria" ? "Parceiro" : "Evento"}>
                    <Select
                      value={form.vinculoId || "none"}
                      onValueChange={(v) =>
                        set("vinculoId", v === "none" ? "" : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            tipo === "parceria"
                              ? "Selecione o parceiro"
                              : "Selecione o evento"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— nenhum —</SelectItem>
                        {lista.map((x) => (
                          <SelectItem key={x.id} value={x.id}>
                            {x.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Campo>
                );
              })()}

              <Campo label="Responsável">
                <Input
                  value={form.responsavel}
                  onChange={(e) => set("responsavel", e.target.value)}
                  placeholder="ex.: Natalia"
                />
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Telefone">
                  <Input
                    value={form.telefone}
                    onChange={(e) => set("telefone", e.target.value)}
                  />
                </Campo>
                <Campo label="Instagram">
                  <Input
                    value={form.instagram}
                    onChange={(e) => set("instagram", e.target.value)}
                  />
                </Campo>
              </div>
              <Campo label="Endereço">
                <Input
                  value={form.endereco}
                  onChange={(e) => set("endereco", e.target.value)}
                />
              </Campo>
              <Campo label="Bairro">
                <Input
                  value={form.bairro}
                  onChange={(e) => set("bairro", e.target.value)}
                />
              </Campo>
              <Campo label="Próxima ação">
                <Input
                  value={form.proxima_acao}
                  onChange={(e) => set("proxima_acao", e.target.value)}
                />
              </Campo>
              <Campo label="Observações">
                <textarea
                  value={form.obs}
                  onChange={(e) => set("obs", e.target.value)}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Campo>
              <Campo label="Informações enriquecidas">
                <textarea
                  value={form.enriquecimento}
                  onChange={(e) => set("enriquecimento", e.target.value)}
                  rows={6}
                  placeholder="Pesquisa sobre a operação, decisores, contexto do negócio, sinais de compra, links, etc."
                  className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Campo>

              <div className="flex gap-4 pt-1">
                <Toggle
                  label="Visitada"
                  on={form.visitada}
                  onToggle={() => set("visitada", !form.visitada)}
                />
                <Toggle
                  label="Entrevista agendada"
                  on={form.entrevista_agendada}
                  onToggle={() =>
                    set("entrevista_agendada", !form.entrevista_agendada)
                  }
                />
              </div>
            </div>

            {erroSalvar && (
              <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erroSalvar}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
              <Button
                variant="ghost"
                onClick={excluirLead}
                disabled={salvando || excluir.isPending}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {excluir.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Excluir lead
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setEditando(false)}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button onClick={salvar} disabled={salvando || !podeSalvarEdit}>
                  {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
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
