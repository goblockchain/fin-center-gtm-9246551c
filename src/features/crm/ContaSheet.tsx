import {
  MapPin,
  Phone,
  Instagram,
  User,
  CalendarCheck,
  CheckCircle2,
  Quote,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TemperaturaChip } from "./temperatura";
import { useContatos, useInteracoes } from "./api";
import type { Conta, PapelContato, TipoInteracao } from "@/types/db";

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
  const { data: contatos } = useContatos(open ? conta?.id : undefined);
  const { data: interacoes } = useInteracoes(open ? conta?.id : undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {conta && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <TemperaturaChip temp={conta.temperatura} />
                {canalNome && <Badge variant="outline">{canalNome}</Badge>}
              </div>
              <SheetTitle>{conta.nome}</SheetTitle>
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

            <div className="mt-auto flex items-center gap-2 rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground">
              <Quote className="h-4 w-4 shrink-0" />
              Voz do Cliente vinculada a esta conta aparece aqui no M8.
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
