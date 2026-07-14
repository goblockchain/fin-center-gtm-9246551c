// UseFin — google-calendar-sync
// Cria/atualiza/cancela um evento no Google Calendar da conta conectada
// e envia convites por e-mail aos participantes automaticamente.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_calendar/calendar/v3';

type Attendee = { email: string; displayName?: string };
type Payload = {
  action: 'create' | 'update' | 'delete';
  googleEventId?: string;
  calendarId?: string; // default 'primary'
  titulo: string;
  descricao?: string | null;
  inicio: string; // ISO
  fim: string;    // ISO
  local?: string | null;
  attendees?: Attendee[];
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

    const body = {
      summary: p.titulo,
      description: p.descricao ?? undefined,
      location: p.local ?? undefined,
      start: { dateTime: p.inicio, timeZone: 'America/Sao_Paulo' },
      end:   { dateTime: p.fim,    timeZone: 'America/Sao_Paulo' },
      attendees: (p.attendees ?? []).filter(a => a.email).map(a => ({ email: a.email, displayName: a.displayName })),
    };

    const base = `${GATEWAY_URL}/calendars/${encodeURIComponent(calId)}/events`;
    const headers = {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': GCAL_KEY,
      'Content-Type': 'application/json',
    };

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
    }

    const resp = await fetch(url, {
      method,
      headers,
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
