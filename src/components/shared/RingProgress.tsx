import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Anel de progresso (0–1). Cor via colorClass (text-*). */
export function RingProgress({
  value,
  size = 92,
  stroke = 9,
  colorClass = "text-fin",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  colorClass?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  const offset = c * (1 - v);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("stroke-current transition-[stroke-dashoffset] duration-500", colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
