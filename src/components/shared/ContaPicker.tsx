import { useState } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBuscarContas } from "@/features/mensagens/api";

export type ContaRef = { id: string; nome: string };

export function ContaPicker({
  value,
  onChange,
  placeholder = "Buscar cafeteria…",
}: {
  value: ContaRef | null;
  onChange: (c: ContaRef | null) => void;
  placeholder?: string;
}) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const { data: contas } = useBuscarContas(termo);

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm">
        <span className="font-medium text-fin-dark">{value.nome}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-fin-dark"
          aria-label="Remover conta"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder={placeholder}
        className="pl-9"
      />
      {aberto && termo.trim().length >= 2 && (contas?.length ?? 0) > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
          {contas!.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent/40"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange({ id: c.id, nome: c.nome });
                  setTermo("");
                  setAberto(false);
                }}
              >
                <span className="text-fin-dark">{c.nome}</span>
                {c.bairro && (
                  <span className="text-xs text-muted-foreground">
                    {c.bairro}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
