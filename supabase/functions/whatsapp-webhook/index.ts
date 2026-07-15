// UseFin — whatsapp-webhook
// Recebe mensagem do Twilio (WhatsApp), usa IA para extrair evento,
// grava em eventos_agenda e sincroniza no Google Calendar. Responde TwiML.
import { createClient } from 'npm:@supabase/supabase-js@2';

// Endpoint público chamado pelo Twilio — não exigir JWT.
// (Twilio envia application/x-www-form-urlencoded, sem Authorization.)
// Como não há JWT, quem prova o remetente é a assinatura X-Twilio-Signature,
// validada ANTES de qualquer escrita ou chamada de IA. Sem isso, este endpoint
// escreve no banco com service_role (ignorando a RLS), queima crédito de IA e
// alcança a agenda real da empresa — a partir de qualquer lugar da internet.

const AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

Deno.serve(async (req) => {
  try {
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    if (!TWILIO_AUTH_TOKEN) {
      // Falha fechada: sem o token não há como provar que o Twilio é o remetente.
      // Configure TWILIO_AUTH_TOKEN nos secrets da function para reativar.
      console.error('TWILIO_AUTH_TOKEN ausente — webhook recusando tudo.');
      return new Response('Webhook não configurado.', { status: 503 });
    }

    const form = await req.formData();
    const params: Record<string, string> = {};
    for (const [k, v] of form.entries()) params[k] = String(v);

    const assinatura = req.headers.get('X-Twilio-Signature') ?? '';
    if (!(await assinaturaTwilioValida(TWILIO_AUTH_TOKEN, urlPublica(req), params, assinatura))) {
      return new Response('Forbidden', { status: 403 });
    }

    const from = String(form.get('From') ?? '');
    const body = String(form.get('Body') ?? '').trim().slice(0, 1000);

    const SUPA_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPA_SR = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(SUPA_URL, SUPA_SR);

    // Log incoming
    const { data: msg } = await sb
      .from('whatsapp_mensagens')
      .insert({ from_number: from, body })
      .select('id')
      .single();
    const msgId = msg?.id as string | undefined;

    if (!body) return twiml('Manda uma mensagem descrevendo o evento (título, data/hora, participantes).');

    // Extração via Lovable AI (JSON estruturado)
    const LOVABLE_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_KEY) {
      await marcarErro(sb, msgId, 'LOVABLE_API_KEY ausente');
      return twiml('⚠️ Serviço de IA indisponível.');
    }

    const nowIso = new Date().toISOString();
    const prompt = `Hoje é ${nowIso} (America/Sao_Paulo). Extraia da mensagem os campos do evento.
Se faltar algum, use null. Sempre retorne um JSON válido.
Mensagem: """${body}"""`;

    const aiResp = await fetch(AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Extraia eventos de calendário e responda somente com JSON: {"titulo":string,"inicio_iso":string,"fim_iso":string,"local":string|null,"participantes":string[]}. Timezone America/Sao_Paulo. Duração default 1h.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      await marcarErro(sb, msgId, `AI ${aiResp.status}: ${t}`);
      return twiml('⚠️ Não consegui interpretar. Tente: "Reunião com Café Paris amanhã 15h".');
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let extraido: { titulo?: string; inicio_iso?: string; fim_iso?: string; local?: string | null; participantes?: string[] };
    try { extraido = JSON.parse(content); } catch {
      await marcarErro(sb, msgId, `JSON inválido: ${content}`);
      return twiml('⚠️ Resposta da IA inválida. Tente reescrever a mensagem.');
    }

    if (!extraido.titulo || !extraido.inicio_iso) {
      await marcarErro(sb, msgId, 'Faltou título ou início');
      return twiml('⚠️ Preciso de título e data/hora. Ex.: "Reunião com Café Paris amanhã 15h".');
    }

    const inicio = new Date(extraido.inicio_iso);
    const fim = extraido.fim_iso ? new Date(extraido.fim_iso) : new Date(inicio.getTime() + 60 * 60 * 1000);

    // Match participantes por nome no catálogo
    let attendeeEmails: { email: string; displayName?: string }[] = [];
    const nomes = extraido.participantes ?? [];
    if (nomes.length) {
      const { data: parts } = await sb
        .from('participantes')
        .select('id, nome, email')
        .eq('ativo', true);
      const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const matched = (parts ?? []).filter(p => nomes.some(n => norm(p.nome).includes(norm(n)) || norm(n).includes(norm(p.nome))));
      attendeeEmails = matched.filter(p => p.email).map(p => ({ email: p.email!, displayName: p.nome }));

      // Cria o registro do evento
      const { data: ev, error: evErr } = await sb
        .from('eventos_agenda')
        .insert({
          titulo: extraido.titulo,
          inicio: inicio.toISOString(),
          fim: fim.toISOString(),
          local: extraido.local ?? null,
          origem: 'whatsapp',
          criado_por: from,
        })
        .select('id')
        .single();

      if (evErr) {
        await marcarErro(sb, msgId, `insert evento: ${evErr.message}`);
        return twiml('⚠️ Erro ao criar evento.');
      }

      // Vincula participantes conhecidos
      if (matched.length) {
        await sb.from('eventos_participantes').insert(
          matched.map(p => ({ evento_id: ev!.id, participante_id: p.id })),
        );
      }

      // Sincroniza com Google Calendar (best-effort)
      try {
        await fetch(`${SUPA_URL}/functions/v1/google-calendar-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPA_SR}` },
          body: JSON.stringify({
            action: 'create',
            titulo: extraido.titulo,
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
            local: extraido.local,
            attendees: attendeeEmails,
          }),
        });
      } catch { /* ignore — evento continua no UseFin */ }

      if (msgId) {
        await sb.from('whatsapp_mensagens').update({ processado: true, evento_id: ev!.id }).eq('id', msgId);
      }

      const dataHumano = inicio.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
      return twiml(`✅ Evento criado: ${extraido.titulo} — ${dataHumano}${matched.length ? ` (${matched.length} convidado(s))` : ''}`);
    }

    // Sem participantes citados
    const { data: ev, error: evErr } = await sb
      .from('eventos_agenda')
      .insert({
        titulo: extraido.titulo,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
        local: extraido.local ?? null,
        origem: 'whatsapp',
        criado_por: from,
      })
      .select('id')
      .single();

    if (evErr) {
      await marcarErro(sb, msgId, `insert evento: ${evErr.message}`);
      return twiml('⚠️ Erro ao criar evento.');
    }

    if (msgId) {
      await sb.from('whatsapp_mensagens').update({ processado: true, evento_id: ev!.id }).eq('id', msgId);
    }

    const dataHumano = inicio.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
    return twiml(`✅ Evento criado: ${extraido.titulo} — ${dataHumano}`);
  } catch (e) {
    // Detalhe fica no log; o cliente recebe mensagem genérica (o erro cru
    // expõe nomes de constraint e schema para um endpoint público).
    console.error('whatsapp-webhook:', (e as Error).message);
    return twiml('⚠️ Não consegui processar essa mensagem. Tenta de novo.');
  }
});

/** URL pública que o Twilio assinou (o gateway entrega o request já em https). */
function urlPublica(req: Request): string {
  const u = new URL(req.url);
  u.protocol = 'https:';
  return u.toString();
}

/**
 * Valida X-Twilio-Signature.
 * Algoritmo do Twilio: HMAC-SHA1(authToken, url + concat(chave+valor de cada
 * param POST, ordenado por chave)) → base64.
 */
async function assinaturaTwilioValida(
  authToken: string,
  url: string,
  params: Record<string, string>,
  assinatura: string,
): Promise<boolean> {
  if (!assinatura) return false;
  const base = url + Object.keys(params).sort().map((k) => k + params[k]).join('');
  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(authToken),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(base));
  const esperado = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return comparaTempoConstante(esperado, assinatura);
}

/** Comparação em tempo constante — evita timing attack na assinatura. */
function comparaTempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function marcarErro(sb: ReturnType<typeof createClient>, id: string | undefined, erro: string) {
  if (!id) return;
  await sb.from('whatsapp_mensagens').update({ erro }).eq('id', id);
}

function twiml(text: string) {
  const body = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(text)}</Message></Response>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/xml' } });
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
}
