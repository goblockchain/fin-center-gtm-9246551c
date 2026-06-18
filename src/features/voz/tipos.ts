import type { TipoVoz } from "@/types/db";

export const TIPOS_VOZ: TipoVoz[] = [
  "depoimento",
  "mensagem",
  "narrativa",
  "relatorio",
];

export const TIPO_VOZ_META: Record<TipoVoz, { label: string; chip: string }> = {
  depoimento: { label: "Depoimento", chip: "bg-fin-light text-fin-dark" },
  mensagem: { label: "Mensagem", chip: "bg-sky-100 text-sky-700" },
  narrativa: { label: "Narrativa", chip: "bg-violet-100 text-violet-700" },
  relatorio: { label: "Relatório", chip: "bg-amber-100 text-amber-800" },
};
