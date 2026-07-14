import { useState } from "react";
import { type View } from "react-big-calendar";
import { CalendarPlus, Info } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AgendaCalendar } from "@/features/agenda/AgendaCalendar";
import { EventoDialog } from "@/features/agenda/EventoDialog";
import { useEventos, type EventoComParticipantes } from "@/features/agenda/api";

export function AgendaPage() {
  const { data: eventos, isLoading } = useEventos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<EventoComParticipantes | null>(null);
  const [slotInicio, setSlotInicio] = useState<Date | undefined>();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Agenda"
        description="Eventos sincronizados com o Google Calendar. Convidados recebem convite por e-mail."
        actions={
          <Button onClick={novo}>
            <CalendarPlus className="h-4 w-4" /> Novo evento
          </Button>
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
