import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { UseFinLogo } from "@/components/layout/UseFinLogo";

const DESTAQUES = [
  "Pipeline com tracking semanal automático",
  "CAC e ROI por canal",
  "Receita previsível com projeções",
];

/** Casca visual das telas de auth: painel de marca (lg+) + slot do formulário. */
export function AuthShell({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Painel de marca — só em telas grandes */}
      <div className="relative hidden flex-col justify-between bg-fin-dark p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-fin-light">
            <UseFinLogo className="h-5 w-auto text-fin-dark" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            UseFin
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="font-display text-[2rem] font-extrabold leading-[1.1]">
            Seu Go-To-Market
            <br />
            num lugar só.
          </h2>
          <p className="mt-4 text-white/70">
            O canal é a unidade central: execução, investimento, CAC e receita
            previsível — ao vivo.
          </p>
          <ul className="mt-7 space-y-2.5 text-sm text-white/85">
            {DESTAQUES.map((d) => (
              <li key={d} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-fin-light/20 text-fin-light">
                  <Check className="h-3 w-3" />
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/40">
          Fin · time financeiro AI-native · Florianópolis
        </p>
      </div>

      {/* Painel do formulário */}
      <div className="grid min-h-screen place-items-center bg-background px-4 py-10 lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-fin-light">
              <UseFinLogo className="h-5 w-auto text-fin-dark" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-fin-dark">
              UseFin
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-fin-dark">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
          )}

          <div className="mt-6">{children}</div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Acesso restrito ao time da Fin.
          </p>
        </div>
      </div>
    </div>
  );
}
