import type { Temperatura } from "@/types/db";
import { cn } from "@/lib/utils";

export const TEMP_META: Record<
  Temperatura,
  { label: string; emoji: string; chip: string }
> = {
  quente: { label: "Quente", emoji: "🔥", chip: "bg-red-100 text-red-700" },
  morno: { label: "Morno", emoji: "☀️", chip: "bg-amber-100 text-amber-800" },
  frio: { label: "Frio", emoji: "❄️", chip: "bg-sky-100 text-sky-700" },
  sem_contato: {
    label: "Sem contato",
    emoji: "⚫",
    chip: "bg-muted text-muted-foreground",
  },
};

export const TEMPERATURAS: Temperatura[] = [
  "quente",
  "morno",
  "frio",
  "sem_contato",
];

export function TemperaturaChip({ temp }: { temp: Temperatura }) {
  const m = TEMP_META[temp];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        m.chip,
      )}
    >
      <span aria-hidden>{m.emoji}</span>
      {m.label}
    </span>
  );
}
