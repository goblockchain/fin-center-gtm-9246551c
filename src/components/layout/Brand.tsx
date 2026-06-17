import { cn } from "@/lib/utils";

/** Marca do produto. SEMPRE "Fin Center". */
export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-fin-light font-bold text-fin-dark">
        Fin
      </span>
      {!compact && (
        <span className="text-base font-semibold leading-tight text-sidebar-foreground">
          Fin Center
        </span>
      )}
    </div>
  );
}
