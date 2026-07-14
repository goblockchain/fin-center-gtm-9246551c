import { useState } from "react";
import { type View } from "react-big-calendar";
import { CalendarPlus, Info, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AgendaCalendar } from "@/features/agenda/AgendaCalendar";
import { EventoDialog } from "@/features/agenda/EventoDialog";
import { useEventos, type EventoComParticipantes } from "@/features/agenda/api";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function AgendaPage() {
  const { data: eventos, isLoading } = useEventos();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<EventoComParticipantes | null>(null);
  const [slotInicio, setSlotInicio] = useState<Date | undefined>();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [sincronizando, setSincronizando] = useState(false);

  function novo() {
    setEditando(null);
    setSlotInicio(undefined);
    setDialogOpen(true);
  }

  function onSelectSlot(start: Date) {
    setEditando(null);
    setSlotInicio(start);
    setDialogOpen(true);
  }

  function onSelectEvent(ev: EventoComParticipantes) {
    setEditando(ev);
    setSlotInicio(undefined);
    setDialogOpen(true);
  }

  async function sincronizarGoogle() {
    setSincronizando(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-sync", {
        body: { action: "pull" },
      });
      if (error || (data as any)?.error) {
        window.alert((data as any)?.error ?? error?.message ?? "Erro ao sincronizar");
        return;
      }
      const { upserts = 0, cancelamentos = 0 } = (data as any) ?? {};
      window.alert(`Google sincronizado — ${upserts} evento(s), ${cancelamentos} cancelado(s).`);
      qc.invalidateQueries({ queryKey: ["eventos_agenda"] });
    } catch (e) {
      window.alert((e as Error).message);
    } finally {
      setSincronizando(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Agenda"
        description="Sincronizada com o Google Calendar do time (Natalia). Convidados recebem convite por e-mail."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={sincronizarGoogle} disabled={sincronizando}>
              <RefreshCw className={`h-4 w-4 ${sincronizando ? "animate-spin" : ""}`} />
              {sincronizando ? "Sincronizando…" : "Sincronizar Google"}
            </Button>
            <Button onClick={novo}>
              <CalendarPlus className="h-4 w-4" /> Novo evento
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-fin-light/50 bg-fin-light/10 p-3 text-xs text-fin-dark">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-fin" />
        <div>
          <p>
            Eventos verdes escuros são criados manualmente. Eventos verde-claro chegam pelo bot
            WhatsApp. Clique em qualquer dia para criar; clique num evento para editar ou cancelar.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Carregando eventos…
        </div>
      ) : (
        <AgendaCalendar
          eventos={eventos ?? []}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
        />
      )}

      <EventoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        evento={editando}
        defaultInicio={slotInicio}
      />
    </div>
  );
}

export default AgendaPage;
