// UseFin — Edge Function PLACEHOLDER: whatsapp
//
// ⚠️ NÃO envia WhatsApp de verdade. É um stub proposital.
// O módulo de Mensagens do UseFin só registra STATUS MANUAL (tabela mensagens_log).
// Este arquivo existe para reservar o ponto de integração futuro, sem nenhum envio real.
//
// Deploy (futuro, opcional): supabase functions deploy whatsapp
//
// Deno runtime (Supabase Edge Functions).

Deno.serve(async (req: Request) => {
  const payload = await req.json().catch(() => ({}));

  // Placeholder: apenas ecoa o que receberia, marcando como NÃO enviado.
  return new Response(
    JSON.stringify({
      ok: true,
      sent: false,
      placeholder: true,
      message:
        "UseFin não envia WhatsApp. Registre o status manualmente em Mensagens.",
      received: payload,
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
});
