// UseFin — Edge Function: criar-perfil
//
// Cria um novo usuário/perfil de acesso de forma SEGURA:
//   - exige que QUEM chama esteja autenticado (token do usuário logado);
//   - usa a service_role (injetada no ambiente da function — NUNCA no front)
//     para criar o usuário já CONFIRMADO (email_confirm:true), pois o projeto
//     não tem SMTP e não enviaria o e-mail de confirmação.
//
// Deploy: via Management API (sem CLI) — ver scripts de setup.
//
// Deno runtime (Supabase Edge Functions).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service)
    return json({ error: "Função sem variáveis de ambiente." }, 500);

  // 1) Confirma que o chamador está autenticado (usa o JWT do usuário logado).
  const authHeader = req.headers.get("Authorization") ?? "";
  const caller = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authErr,
  } = await caller.auth.getUser();
  if (authErr || !user)
    return json({ error: "Não autorizado — faça login novamente." }, 401);

  // 2) Valida a entrada.
  let body: { email?: string; password?: string; nome?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corpo inválido." }, 400);
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const nome = (body.nome ?? "").trim();
  if (!email || !email.includes("@"))
    return json({ error: "Informe um e-mail válido." }, 400);
  if (password.length < 6)
    return json({ error: "A senha precisa ter ao menos 6 caracteres." }, 400);

  // 3) Cria o usuário já confirmado, com a service_role (server-side).
  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: nome ? { nome } : undefined,
  });
  if (error) {
    const msg = /already.*registered|exists/i.test(error.message)
      ? "Já existe um perfil com esse e-mail."
      : error.message;
    return json({ error: msg }, 400);
  }

  return json({
    ok: true,
    user: { id: data.user?.id, email: data.user?.email },
  });
});
