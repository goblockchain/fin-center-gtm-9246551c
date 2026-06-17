import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** true quando as variáveis de ambiente do Supabase estão preenchidas. */
export const isSupabaseConfigured = Boolean(url && anonKey);

// Fallbacks só para o cliente não quebrar na inicialização sem .env.
// Nenhuma chave sensível: apenas a anon key (protegida por RLS) é usada no front.
export const supabase = createClient(
  url || "http://127.0.0.1:54321",
  anonKey || "anon-placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
