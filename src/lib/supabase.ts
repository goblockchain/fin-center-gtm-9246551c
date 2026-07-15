import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
// Sem fallback para VITE_SUPABASE_ANON_KEY: a chave que estava lá era inválida,
// e o fallback fazia um ambiente sem PUBLISHABLE_KEY falhar todo login em
// silêncio, com "Invalid API key" — indistinguível de senha errada.
// Faltando a variável, isSupabaseConfigured fica false e o app diz isso.
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

/** true quando as variáveis de ambiente do Supabase estão preenchidas. */
export const isSupabaseConfigured = Boolean(url && publishableKey);

// Fallbacks só para o cliente não quebrar na inicialização sem .env.
// Nenhuma chave sensível: apenas a anon key (protegida por RLS) é usada no front.
export const supabase = createClient<Database>(
  url || "http://127.0.0.1:54321",
  publishableKey || "anon-placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Os links de acesso/recuperação do admin chegam com os tokens no #hash
      // (fluxo implícito). O AuthProvider lê esse hash e chama setSession
      // explicitamente — mais robusto que o detectSessionInUrl automático.
      detectSessionInUrl: false,
      flowType: "implicit",
    },
  },
);
