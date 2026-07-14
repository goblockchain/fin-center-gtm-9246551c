import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { AuthShell } from "@/features/auth/AuthShell";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Modo = "entrar" | "criar";

export function LoginPage() {
  const { session, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  // Já logado? Vai direto pro app.
  if (session) return <Navigate to={from} replace />;

  function trocarModo(novo: Modo) {
    setModo(novo);
    setError(null);
    setAviso(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setBusy(true);

    if (modo === "criar") {
      const { error, precisaConfirmar } = await signUp(email.trim(), password);
      setBusy(false);
      if (error) {
        setError(error);
        return;
      }
      if (precisaConfirmar) {
        setAviso(
          "Conta criada! Este projeto exige confirmação de e-mail. Se você não recebeu o e-mail, desative “Confirm email” em Authentication → Providers no Supabase e crie a conta novamente.",
        );
        setModo("entrar");
        return;
      }
      // Cadastro com sessão imediata → entra direto.
      navigate(from, { replace: true });
      return;
    }

    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <AuthShell
      titulo={modo === "entrar" ? "Entrar" : "Criar conta"}
      subtitulo="Acesse o painel da Fin."
    >
      {!isSupabaseConfigured && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-warning/10 p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span className="text-fin-dark">
            Configure <code>VITE_SUPABASE_URL</code> e{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> no <code>.env</code> para
            habilitar o login.
          </span>
        </div>
      )}

      {/* Alternância Entrar / Criar conta */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => trocarModo(m)}
            className={cn(
              "rounded-md py-1.5 text-sm font-medium transition-colors",
              modo === m
                ? "bg-card text-fin-dark shadow-sm"
                : "text-muted-foreground hover:text-fin-dark",
            )}
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete={modo === "criar" ? "new-password" : "current-password"}
            required
            minLength={modo === "criar" ? 6 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {modo === "criar" && (
            <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
          )}
        </div>

        {error && (
          <div
            className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-sm text-destructive"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {aviso && (
          <div
            className="flex items-start gap-2 rounded-md bg-fin-light/20 p-2.5 text-sm text-fin-dark"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-fin" />
            <span>{aviso}</span>
          </div>
        )}

        <Button type="submit" className="h-11 w-full text-[15px]" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </Button>
      </form>
    </AuthShell>
  );
}
