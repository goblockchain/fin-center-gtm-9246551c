import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  /** Cadastro público (tela de login). Se o projeto exigir confirmação de
   *  e-mail e não houver sessão de volta, retorna precisaConfirmar=true. */
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error?: string; precisaConfirmar?: boolean }>;
  signOut: () => Promise<void>;
  /** Troca a senha do usuário logado (não depende de e-mail). */
  updatePassword: (password: string) => Promise<{ error?: string }>;
  /** Cria um novo perfil de acesso (via Edge Function, auto-confirmado). */
  criarPerfil: (input: {
    email: string;
    password: string;
    nome?: string;
  }) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function init() {
      // Link de acesso/recuperação (admin) chega com os tokens no #hash
      // (fluxo implícito) — lemos e aplicamos a sessão explicitamente.
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        const p = new URLSearchParams(hash.slice(1));
        const access_token = p.get("access_token");
        const refresh_token = p.get("refresh_token");
        if (access_token && refresh_token) {
          const { data } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          // Limpa o hash da URL (sem recarregar).
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
          if (active) {
            setSession(data.session);
            setLoading(false);
          }
          return;
        }
      }
      // Sessão persistida normal.
      const { data } = await supabase.auth.getSession();
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) setSession(newSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return error ? { error: error.message } : {};
      },
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) return { error: error.message };
        // Sem sessão de volta = projeto exige confirmação de e-mail.
        if (!data.session) return { precisaConfirmar: true };
        return {};
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        return error ? { error: error.message } : {};
      },
      criarPerfil: async ({ email, password, nome }) => {
        const { data, error } = await supabase.functions.invoke("criar-perfil", {
          body: { email, password, nome },
        });
        if (error) {
          // Erro HTTP da função: a mensagem útil vem no corpo da resposta.
          let msg = error.message;
          try {
            const ctx = (error as { context?: Response }).context;
            if (ctx && typeof ctx.json === "function") {
              const j = await ctx.json();
              if (j?.error) msg = j.error;
            }
          } catch {
            /* mantém msg padrão */
          }
          return { error: msg };
        }
        if (data?.error) return { error: data.error };
        return {};
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
