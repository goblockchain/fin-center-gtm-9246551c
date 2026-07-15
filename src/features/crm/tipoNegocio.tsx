import type { Enums } from "@/types/db";

export type TipoNegocio = Enums<"tipo_negocio">;

export const TIPOS_NEGOCIO: TipoNegocio[] = [
  "franqueador",
  "franqueado",
  "independente",
];

export const TIPO_NEGOCIO_META: Record<
  TipoNegocio,
  { label: string; chip: string }
> = {
  franqueador: {
    label: "Franqueador",
    chip: "border-fin/40 bg-fin-light/30 text-fin-dark",
  },
  franqueado: {
    label: "Franqueado",
    chip: "border-sky-300 bg-sky-50 text-sky-800",
  },
  independente: {
    label: "Independente",
    chip: "border-border bg-muted text-muted-foreground",
  },
};

export function TipoNegocioChip({ tipo }: { tipo: TipoNegocio | null }) {
  if (!tipo) return null;
  const m = TIPO_NEGOCIO_META[tipo];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${m.chip}`}
    >
      {m.label}
    </span>
  );
}
