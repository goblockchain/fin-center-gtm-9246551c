// UseFin — google-calendar-sync
// Sincronização bidirecional entre UseFin e Google Calendar.
// Ações:
//  - create / update / delete: escreve no Google (push)
//  - pull: lê eventos do Google numa janela e faz upsert em eventos_agenda
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_calendar/calendar/v3';

type Attendee = { email: string; displayName?: string };
type Payload = {
  action: 'create' | 'update' | 'delete' | 'pull';
  googleEventId?: string;
  calendarId?: string; // default 'primary'
  titulo?: string;
  descricao?: string | null;
  inicio?: string; // ISO
  fim?: string;    // ISO
  local?: string | null;
  attendees?: Attendee[];
  // pull-only
  timeMinDaysAgo?: number;   // default 30
  timeMaxDaysAhead?: number; // default 180
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GCAL_KEY = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    if (!LOVABLE_API_KEY || !GCAL_KEY) {
      return json({ error: 'Google Calendar não conectado. Vincule o conector em Configurações → Conectores.' }, 400);
    }

    const p = (await req.json()) as Payload;
    const calId = p.calendarId ?? 'primary';
    const authHeaders = {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': GCAL_KEY,
      'Content-Type': 'application/json',
    };

    // ---------- PULL: Google -> UseFin ----------
    if (p.action === 'pull') {
      const daysAgo = p.timeMinDaysAgo ?? 30;
      const daysAhead = p.timeMaxDaysAhead ?? 180;
      const now = Date.now();
      const timeMin = new Date(now - daysAgo * 86400000).toISOString();
      const timeMax = new Date(now + daysAhead * 86400000).toISOString();

      const supaUrl = Deno.env.get('SUPABASE_URL')!;
      const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supa = createClient(supaUrl, supaKey);

      let pageToken: string | undefined;
      let upserts = 0;
      let cancelamentos = 0;

      do {
        const params = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250',
          showDeleted: 'true',
        });
        if (pageToken) params.set('pageToken', pageToken);

        const listUrl = `${GATEWAY_URL}/calendars/${encodeURIComponent(calId)}/events?${params.toString()}`;
        const r = await fetch(listUrl, { headers: authHeaders });
        if (!r.ok) {
          const txt = await r.text();
          return json({ error: `Google Calendar ${r.status}: ${txt}` }, r.status);
        }
        const page = await r.json();
        pageToken = page.nextPageToken;

        for (const ev of (page.items ?? []) as any[]) {
          if (!ev.id) continue;
          // Cancelado no Google -> marca como cancelado no UseFin
          if (ev.status === 'cancelled') {
            const { error } = await supa
              .from('eventos_agenda')
              .update({ status: 'cancelado' })
              .eq('google_event_id', ev.id);
            if (!error) cancelamentos++;
            continue;
          }
          // Só sincroniza eventos com hora (ignora all-day para não bagunçar o calendar de reuniões)
          const inicio = ev.start?.dateTime;
          const fim = ev.end?.dateTime;
          if (!inicio || !fim) continue;

          const row = {
            titulo: ev.summary ?? '(sem título)',
            descricao: ev.description ?? null,
            inicio,
            fim,
            local: ev.location ?? null,
            google_event_id: ev.id,
            google_calendar_id: calId,
            origem: 'manual' as const,
            status: 'agendado' as const,
          };

          const { error } = await supa
            .from('eventos_agenda')
            .upsert(row, { onConflict: 'google_event_id' });
          if (!error) upserts++;
        }
      } while (pageToken);

      return json({ ok: true, upserts, cancelamentos }, 200);
    }

    // ---------- PUSH: UseFin -> Google ----------
    const body = {
      summary: p.titulo,
      description: p.descricao ?? undefined,
      location: p.local ?? undefined,
      start: { dateTime: p.inicio, timeZone: 'America/Sao_Paulo' },
      end:   { dateTime: p.fim,    timeZone: 'America/Sao_Paulo' },
      attendees: (p.attendees ?? []).filter(a => a.email).map(a => ({ email: a.email, displayName: a.displayName })),
    };

    const base = `${GATEWAY_URL}/calendars/${encodeURIComponent(calId)}/events`;
    let url = '';
    let method: 'POST' | 'PATCH' | 'DELETE' = 'POST';

    if (p.action === 'create') {
      url = `${base}?sendUpdates=all`;
      method = 'POST';
    } else if (p.action === 'update') {
      if (!p.googleEventId) return json({ error: 'googleEventId obrigatório em update' }, 400);
      url = `${base}/${encodeURIComponent(p.googleEventId)}?sendUpdates=all`;
      method = 'PATCH';
    } else if (p.action === 'delete') {
      if (!p.googleEventId) return json({ error: 'googleEventId obrigatório em delete' }, 400);
      url = `${base}/${encodeURIComponent(p.googleEventId)}?sendUpdates=all`;
      method = 'DELETE';
    } else {
      return json({ error: `action inválida: ${p.action}` }, 400);
    }

    const resp = await fetch(url, {
      method,
      headers: authHeaders,
      body: method === 'DELETE' ? undefined : JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return json({ error: `Google Calendar ${resp.status}: ${txt}` }, 500);
    }

    if (method === 'DELETE') return json({ ok: true }, 200);

    const data = await resp.json();
    return json({ ok: true, googleEventId: data.id, htmlLink: data.htmlLink }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
