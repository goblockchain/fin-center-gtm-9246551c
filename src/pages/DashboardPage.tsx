import { Target } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="O dia começa pela ação: Foco de hoje antes de qualquer gráfico."
      />

      {/* Foco de hoje (herói) — honra o princípio de UX já no estado vazio */}
      <Card className="border-0 bg-fin-dark text-white">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10">
            <Target className="h-6 w-6 text-fin-light" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-fin-light">
              Foco de hoje
            </p>
            <p className="text-lg font-semibold">
              Conecte o Supabase para o Fin Center calcular sua ação do dia.
            </p>
            <p className="text-sm text-white/70">
              Saúde dos canais, funil ao vivo e ROI chegam no M9 — assim que os
              dados estiverem conectados (M2).
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Saúde dos canais", "Funil ao vivo", "Investimento & ROI"].map(
          (titulo) => (
            <Card key={titulo}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-fin-dark">{titulo}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sem dado real ainda. KPI nunca aparece como zero.
                </p>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
