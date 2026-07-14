import { useMemo } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { EventoComParticipantes } from "./api";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Sem eventos neste período.",
  showMore: (total: number) => `+${total} mais`,
};

export type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventoComParticipantes;
};

export function AgendaCalendar({
  eventos,
  view,
  onView,
  date,
  onNavigate,
  onSelectEvent,
  onSelectSlot,
}: {
  eventos: EventoComParticipantes[];
  view: View;
  onView: (v: View) => void;
  date: Date;
  onNavigate: (d: Date) => void;
  onSelectEvent: (e: EventoComParticipantes) => void;
  onSelectSlot: (start: Date) => void;
}) {
  const eventosCal = useMemo<CalEvent[]>(
    () =>
      eventos.map((e) => ({
        id: e.id,
        title: e.titulo,
        start: new Date(e.inicio),
        end: new Date(e.fim),
        resource: e,
      })),
    [eventos],
  );

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div style={{ height: 700 }}>
        <Calendar
          localizer={localizer}
          culture="pt-BR"
          messages={messages}
          events={eventosCal}
          view={view}
          onView={onView}
          date={date}
          onNavigate={onNavigate}
          views={["month", "week", "day", "agenda"]}
          selectable
          onSelectSlot={(slot) => onSelectSlot(slot.start as Date)}
          onSelectEvent={(ev) => onSelectEvent((ev as CalEvent).resource)}
          eventPropGetter={(ev) => {
            const st = (ev as CalEvent).resource.status;
            const origem = (ev as CalEvent).resource.origem;
            const bg =
              st === "cancelado"
                ? "hsl(var(--muted-foreground) / 0.5)"
                : origem === "whatsapp"
                  ? "hsl(var(--fin-light))"
                  : "hsl(var(--fin))";
            return {
              style: {
                backgroundColor: bg,
                color: origem === "whatsapp" ? "hsl(var(--fin-dark))" : "white",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                padding: "2px 6px",
              },
            };
          }}
        />
      </div>
    </div>
  );
}
