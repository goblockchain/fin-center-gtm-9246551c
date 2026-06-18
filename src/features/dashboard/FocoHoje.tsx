import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Target, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTarefas } from "@/features/tarefas/api";
import { useGates } from "@/features/roadmap/api";
import { useCanalExecucao } from "@/features/canais/api";
import { calcularFoco } from "./foco";

const DOT: Record<string, string> = {
  vencido: "bg-red-400",
  perto: "bg-amber-300",
  ok: "bg-fin-light",
};

export function FocoHoje() {
  const { data: tarefas } = useTarefas();
  const { data: gates } = useGates();
  const { data: execucoes } = useCanalExecucao();

  const { principal, secundarias } = useMemo(
    () => calcularFoco(tarefas ?? [], gates ?? [], execucoes ?? []),
    [tarefas, gates, execucoes],
  );

  return (
    <Card className="border-0 bg-fin-dark text-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10">
            <Target className="h-6 w-6 text-fin-light" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-fin-light">
              Foco de hoje
            </p>
            {principal ? (
              <Link
                to={principal.link}
                className="group mt-0.5 flex items-start gap-1 hover:underline"
              >
                <span className="text-lg font-semibold leading-snug">
                  {principal.texto}
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <p className="mt-0.5 text-lg font-semibold">
                Tudo em dia — sem pendências urgentes. 🎉
              </p>
            )}

            {secundarias.length > 0 && (
              <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                {secundarias.map((a, i) => (
                  <li key={i}>
                    <Link
                      to={a.link}
                      className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          DOT[a.urgencia],
                        )}
                      />
                      {a.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
