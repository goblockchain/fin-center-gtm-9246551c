import { useMemo, useState } from "react";
import { Search, Users, Loader2, KanbanSquare, Table as TableIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCanais, canalNomePorId } from "@/features/canais/api";
import { useContas, type ContaFilters } from "@/features/crm/api";
import {
  TemperaturaChip,
  TEMP_META,
  TEMPERATURAS,
} from "@/features/crm/temperatura";
import { ImportarBaseDialog } from "@/features/crm/ImportarBaseDialog";
import { ContaSheet } from "@/features/crm/ContaSheet";
import { ExcluirSemTelefoneDialog } from "@/features/crm/ExcluirSemTelefoneDialog";
import { PipelineBoard } from "@/features/pipeline/PipelineBoard";
import type { Conta } from "@/types/db";

type View = "kanban" | "tabela";

export function LeadsPage() {
  const [view, setView] = useState<View>("kanban");
  const [filters, setFilters] = useState<ContaFilters>({
    temperatura: "all",
    canalId: "all",
    busca: "",
  });
  const [selected, setSelected] = useState<Conta | null>(null);
  const [open, setOpen] = useState(false);

  const { data: canais } = useCanais();
  const canalMap = useMemo(() => canalNomePorId(canais), [canais]);
  const { data: contas, isLoading } = useContas(filters);
  const selectedFresh = selected
    ? (contas?.find((c) => c.id === selected.id) ?? selected)
    : null;

  function abrir(conta: Conta) {
    setSelected(conta);
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Pipeline e base de contas num lugar só. Kanban para trabalhar as etapas; Tabela para a base completa."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border bg-card p-0.5">
              {(
                [
                  ["kanban", "Kanban", KanbanSquare],
                  ["tabela", "Tabela", TableIcon],
                ] as const
              ).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors",
                    view === v
                      ? "bg-fin text-white"
                      : "text-muted-foreground hover:text-fin-dark",
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            <ExcluirSemTelefoneDialog />
            <ImportarBaseDialog />
          </div>
        }
      />

      {/* Filtros — canal é compartilhado; busca/temperatura só na Tabela */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        {view === "tabela" && (
          <>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou bairro…"
                className="pl-9"
                value={filters.busca}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, busca: e.target.value }))
                }
              />
            </div>
            <Select
              value={filters.temperatura}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  temperatura: v as ContaFilters["temperatura"],
                }))
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as temperaturas</SelectItem>
                {TEMPERATURAS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TEMP_META[t].emoji} {TEMP_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        <Select
          value={filters.canalId}
          onValueChange={(v) => setFilters((f) => ({ ...f, canalId: v }))}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os canais</SelectItem>
            {(canais ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {view === "kanban" ? (
        <PipelineBoard canalId={filters.canalId} />
      ) : (
        <>
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Carregando contas…
              </div>
            ) : !contas?.length ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                <Users className="h-8 w-8" />
                <p>Nenhuma conta com esses filtros.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                  {contas.length} {contas.length === 1 ? "conta" : "contas"}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Bairro</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Temperatura</TableHead>
                      <TableHead>Responsável</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contas.map((c) => (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => abrir(c)}
                      >
                        <TableCell className="font-medium text-fin-dark">
                          <div className="flex items-center gap-2">
                            <span>{c.nome}</span>
                            {!c.instagram && (
                              <span
                                title="Instagram não informado"
                                className="rounded-full border border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                              >
                                sem IG
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.bairro ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {canalMap.get(c.canal_origem_id) ?? "—"}
                        </TableCell>
                        <TableCell>
                          <TemperaturaChip temp={c.temperatura} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.responsavel ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Card>

          <ContaSheet
            conta={selectedFresh}
            canalNome={
              selectedFresh
                ? canalMap.get(selectedFresh.canal_origem_id)
                : undefined
            }
            open={open}
            onOpenChange={setOpen}
          />
        </>
      )}
    </div>
  );
}
