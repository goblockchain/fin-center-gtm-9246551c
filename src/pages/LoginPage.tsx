import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function LoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  // Já logado? Vai direto pro app.
  if (session) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-fin-dark px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-fin-light text-xl font-bold text-fin-dark">
            Fin
          </span>
          <div>
            <h1 className="text-xl font-semibold text-white">Fin Center</h1>
            <p className="text-sm text-white/60">
              Ferramenta interna de Go-To-Market
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {!isSupabaseConfigured && (
              <div className="mb-4 flex items-start gap-2 rounded-md bg-warning/10 p-3 text-xs text-warning-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span className="text-fin-dark">
                  Configure <code>VITE_SUPABASE_URL</code> e{" "}
                  <code>VITE_SUPABASE_ANON_KEY</code> no <code>.env</code> para
                  habilitar o login.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@fin.com.br"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-white/40">
          Acesso restrito ao time da Fin.
        </p>
      </div>
    </div>
  );
}
