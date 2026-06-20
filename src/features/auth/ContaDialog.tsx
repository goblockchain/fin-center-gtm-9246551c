import { useState } from "react";
import { Loader2, KeyRound, UserPlus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";

type Msg = { ok: boolean; texto: string } | null;

export function ContaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { user, updatePassword, criarPerfil } = useAuth();

  // Minha senha
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  // Novo perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [npBusy, setNpBusy] = useState(false);
  const [npMsg, setNpMsg] = useState<Msg>(null);

  async function trocarSenha() {
    setPwMsg(null);
    if (senha.length < 6)
      return setPwMsg({ ok: false, texto: "A senha precisa de ao menos 6 caracteres." });
    if (senha !== senha2)
      return setPwMsg({ ok: false, texto: "As senhas não conferem." });
    setPwBusy(true);
    const { error } = await updatePassword(senha);
    setPwBusy(false);
    if (error) setPwMsg({ ok: false, texto: error });
    else {
      setPwMsg({ ok: true, texto: "Senha alterada com sucesso." });
      setSenha("");
      setSenha2("");
    }
  }

  async function criar() {
    setNpMsg(null);
    if (!email.includes("@"))
      return setNpMsg({ ok: false, texto: "Informe um e-mail válido." });
    if (novaSenha.length < 6)
      return setNpMsg({ ok: false, texto: "A senha precisa de ao menos 6 caracteres." });
    setNpBusy(true);
    const alvo = email.trim();
    const { error } = await criarPerfil({
      email: alvo,
      password: novaSenha,
      nome: nome.trim() || undefined,
    });
    setNpBusy(false);
    if (error) setNpMsg({ ok: false, texto: error });
    else {
      setNpMsg({ ok: true, texto: `Perfil ${alvo} criado — já pode entrar.` });
      setNome("");
      setEmail("");
      setNovaSenha("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conta e perfis</DialogTitle>
          <DialogDescription>
            Logada como {user?.email}. Troque sua senha ou crie um acesso para
            alguém do time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Minha senha */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-fin-dark">
              <KeyRound className="h-4 w-4 text-fin" /> Minha senha
            </h3>
            <Input
              type="password"
              placeholder="Nova senha (mín. 6)"
              value={senha}
              autoComplete="new-password"
              onChange={(e) => setSenha(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={senha2}
              autoComplete="new-password"
              onChange={(e) => setSenha2(e.target.value)}
            />
            {pwMsg && (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs",
                  pwMsg.ok ? "text-fin" : "text-destructive",
                )}
              >
                {pwMsg.ok && <Check className="h-3.5 w-3.5" />}
                {pwMsg.texto}
              </p>
            )}
            <Button
              onClick={trocarSenha}
              disabled={pwBusy || !senha || !senha2}
              className="w-full"
            >
              {pwBusy && <Loader2 className="h-4 w-4 animate-spin" />} Alterar
              senha
            </Button>
          </section>

          <div className="border-t border-border" />

          {/* Novo perfil */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-fin-dark">
              <UserPlus className="h-4 w-4 text-fin" /> Criar novo perfil
            </h3>
            <p className="text-xs text-muted-foreground">
              O novo perfil já entra com e-mail e senha — sem precisar confirmar
              e-mail.
            </p>
            <Input
              placeholder="Nome (opcional)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha (mín. 6)"
              value={novaSenha}
              autoComplete="new-password"
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            {npMsg && (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs",
                  npMsg.ok ? "text-fin" : "text-destructive",
                )}
              >
                {npMsg.ok && <Check className="h-3.5 w-3.5" />}
                {npMsg.texto}
              </p>
            )}
            <Button
              onClick={criar}
              disabled={npBusy || !email || !novaSenha}
              className="w-full"
            >
              {npBusy && <Loader2 className="h-4 w-4 animate-spin" />} Criar
              perfil
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
