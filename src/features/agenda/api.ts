import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Participante = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  tipo: "interno" | "cliente" | "parceiro" | "outro";
  ativo: boolean;
};

export type EventoAgenda = {
  id: string;
  titulo: string;
  descricao: string | null;
  inicio: string;
  fim: string;
  local: string | null;
  conta_id: string | null;
  criado_por: string | null;
  google_event_id: string | null;
  google_calendar_id: string | null;
  origem: "manual" | "whatsapp";
  status: "agendado" | "cancelado" | "realizado";
  created_at: string;
  updated_at: string;
};

export type EventoComParticipantes = EventoAgenda & {
  participantes: { participante: Participante }[];
};

export const agendaKeys = {
  eventos: ["eventos_agenda"] as const,
  participantes: ["participantes"] as const,
};

// -------- Participantes --------
export function useParticipantes() {
  return useQuery({
    queryKey: agendaKeys.participantes,
    queryFn: async (): Promise<Participante[]> => {
      const { data, error } = await (supabase as any)
        .from("participantes")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Participante[];
    },
  });
}

export function useCriarParticipante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<Participante, "id" | "ativo"> & { ativo?: boolean }) => {
      const { data, error } = await (supabase as any)
        .from("participantes")
        .insert({ ...p, ativo: p.ativo ?? true })
        .select("*")
        .single();
      if (error) throw error;
      return data as Participante;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: agendaKeys.participantes }),
  });
}

export function useExcluirParticipante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("participantes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: agendaKeys.participantes }),
  });
}

// -------- Eventos --------
export function useEventos() {
  return useQuery({
    queryKey: agendaKeys.eventos,
    queryFn: async (): Promise<EventoComParticipantes[]> => {
      const { data, error } = await (supabase as any)
        .from("eventos_agenda")
        .select("*, participantes:eventos_participantes(participante:participantes(*))")
        .order("inicio");
      if (error) throw error;
      return (data ?? []) as EventoComParticipantes[];
    },
  });
}

export type NovoEvento = {
  titulo: string;
  descricao?: string | null;
  inicio: string; // ISO
  fim: string;    // ISO
  local?: string | null;
  participantesIds: string[];
};

async function syncGoogle(action: "create" | "update" | "delete", payload: {
  googleEventId?: string | null;
  titulo?: string;
  descricao?: string | null;
  inicio?: string;
  fim?: string;
  local?: string | null;
  attendees?: { email: string; displayName?: string }[];
}) {
  try {
    const { data, error } = await supabase.functions.invoke("google-calendar-sync", {
      body: { action, ...payload },
    });
    if (error) return { ok: false as const, error: error.message };
    if ((data as any)?.error) return { ok: false as const, error: (data as any).error };
    return { ok: true as const, googleEventId: (data as any)?.googleEventId as string | undefined };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

export function useCriarEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ev: NovoEvento) => {
      const { data: created, error } = await (supabase as any)
        .from("eventos_agenda")
        .insert({
          titulo: ev.titulo,
          descricao: ev.descricao ?? null,
          inicio: ev.inicio,
          fim: ev.fim,
          local: ev.local ?? null,
          origem: "manual",
        })
        .select("*")
        .single();
      if (error) throw error;
      const evento = created as EventoAgenda;

      if (ev.participantesIds.length) {
        await (supabase as any).from("eventos_participantes").insert(
          ev.participantesIds.map((pid) => ({ evento_id: evento.id, participante_id: pid })),
        );
      }

      // Busca e-mails dos participantes para sync
      let attendees: { email: string; displayName?: string }[] = [];
      if (ev.participantesIds.length) {
        const { data: parts } = await (supabase as any)
          .from("participantes")
          .select("nome, email")
          .in("id", ev.participantesIds);
        attendees = ((parts as { nome: string; email: string | null }[]) ?? [])
          .filter((p) => p.email)
          .map((p) => ({ email: p.email!, displayName: p.nome }));
      }

      const sync = await syncGoogle("create", {
        titulo: ev.titulo,
        descricao: ev.descricao,
        inicio: ev.inicio,
        fim: ev.fim,
        local: ev.local,
        attendees,
      });

      if (sync.ok && sync.googleEventId) {
        await (supabase as any)
          .from("eventos_agenda")
          .update({ google_event_id: sync.googleEventId, google_calendar_id: "primary" })
          .eq("id", evento.id);
      }

      return { evento, syncErro: sync.ok ? null : sync.error };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: agendaKeys.eventos }),
  });
}

export function useAtualizarEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<EventoAgenda>; participantesIds?: string[] }) => {
      const { data: updated, error } = await (supabase as any)
        .from("eventos_agenda")
        .update(vars.patch)
        .eq("id", vars.id)
        .select("*")
        .single();
      if (error) throw error;
      const evento = updated as EventoAgenda;

      if (vars.participantesIds) {
        await (supabase as any).from("eventos_participantes").delete().eq("evento_id", vars.id);
        if (vars.participantesIds.length) {
          await (supabase as any).from("eventos_participantes").insert(
            vars.participantesIds.map((pid) => ({ evento_id: vars.id, participante_id: pid })),
          );
        }
      }

      // Sync — só se tem googleEventId
      let attendees: { email: string; displayName?: string }[] = [];
      if (vars.participantesIds?.length) {
        const { data: parts } = await (supabase as any)
          .from("participantes")
          .select("nome,email")
          .in("id", vars.participantesIds);
        attendees = ((parts as { nome: string; email: string | null }[]) ?? [])
          .filter((p) => p.email)
          .map((p) => ({ email: p.email!, displayName: p.nome }));
      }
      if (evento.google_event_id) {
        await syncGoogle("update", {
          googleEventId: evento.google_event_id,
          titulo: evento.titulo,
          descricao: evento.descricao,
          inicio: evento.inicio,
          fim: evento.fim,
          local: evento.local,
          attendees,
        });
      }

      return evento;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: agendaKeys.eventos }),
  });
}

export function useExcluirEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (evento: EventoAgenda) => {
      if (evento.google_event_id) {
        await syncGoogle("delete", { googleEventId: evento.google_event_id });
      }
      const { error } = await (supabase as any).from("eventos_agenda").delete().eq("id", evento.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: agendaKeys.eventos }),
  });
}
