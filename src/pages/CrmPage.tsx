import { useMemo, useState } from "react";
import { Search, Users, Loader2 } from "lucide-react";
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
import { useCanais, canalNomePorId } from "@/features/canais/api";
import { useContas, type ContaFilters } from "@/features/crm/api";
import { TemperaturaChip, TEMP_META, TEMPERATURAS } from "@/features/crm/temperatura";
import { ImportarBaseDialog } from "@/features/crm/ImportarBaseDialog";
import { ContaSheet } from "@/features/crm/ContaSheet";
import type { Conta } from "@/types/db";

export function CrmPage() {
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

  function abrir(conta: Conta) {
    setSelected(conta);
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="CRM"
        description="Contas (cafeterias) por temperatura e canal. Clique numa linha para ver a ficha."
        actions={<ImportarBaseDialog />}
      />

      {/* Filtros */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou bairro…"
            className="pl-9"
            value={filters.busca}
            onChange={(e) => setFilters((f) => ({ ...f, busca: e.target.value }))}
          />
        </div>
        <Select
          value={filters.temperatura}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, temperatura: v as ContaFilters["temperatura"] }))
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
                      {c.nome}
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
        conta={selected}
        canalNome={selected ? canalMap.get(selected.canal_origem_id) : undefined}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
