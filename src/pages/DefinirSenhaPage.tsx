import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { AuthShell } from "@/features/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Tela de definição de senha — destino do link de acesso/recuperação por e-mail.
 * O AuthProvider já estabelece a sessão pelo #hash; aqui a usuária só escolhe a senha.
 */
export function DefinirSenhaPage() {
  const { user, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (senha.length < 6)
      return setError("A senha precisa de ao menos 6 caracteres.");
    if (senha !== senha2) return setError("As senhas não conferem.");
    setBusy(true);
    const { error } = await updatePassword(senha);
    setBusy(false);
    if (error) return setError(error);
    setOk(true);
    setTimeout(() => navigate("/", { replace: true }), 1200);
  }

  return (
    <AuthShell
      titulo="Defina sua senha"
      subtitulo={
        user?.email
          ? `Para a conta ${user.email}.`
          : "Crie a senha de acesso ao painel."
      }
    >
      {ok ? (
        <div className="flex items-center gap-2 rounded-md bg-fin/10 p-3 text-sm font-medium text-fin">
          <Check className="h-4 w-4" /> Senha definida! Entrando no painel…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="s1">Nova senha</Label>
            <Input
              id="s1"
              type="password"
              autoComplete="new-password"
              required
              autoFocus
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mín. 6 caracteres"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s2">Confirmar senha</Label>
            <Input
              id="s2"
              type="password"
              autoComplete="new-password"
              required
              value={senha2}
              onChange={(e) => setSenha2(e.target.value)}
              placeholder="repita a senha"
            />
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

          <Button
            type="submit"
            className="h-11 w-full text-[15px]"
            disabled={busy}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Definir senha e entrar
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
