import { DIA } from "@/lib/datas";
import { SPRINT_INICIO, SPRINT_FIM } from "./api";

const ms = (iso: string) => new Date(`${iso}T00:00:00`).getTime();
const toIso = (m: number) => new Date(m).toISOString().slice(0, 10);

function hojeMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export type Timeline = {
  inicioMs: number;
  fimMs: number;
  inicio: string;
  fim: string;
  semanas: number;
  /** posição 0–100% de uma data dentro da janela. */
  pos: (iso: string | null | undefined) => number | null;
  dentro: (iso: string | null | undefined) => boolean;
};

/**
 * Linha do tempo derivada das datas reais (tarefas + gates). Nada fixo:
 * a janela se molda ao que existir; sem dados, cai no padrão da sprint.
 */
export function calcularTimeline(datas: (string | null | undefined)[]): Timeline {
  const validas = datas.filter((d): d is string => !!d).map(ms);
  const hoje = hojeMs();
  let min = validas.length ? Math.min(...validas) : ms(SPRINT_INICIO);
  let max = validas.length ? Math.max(...validas) : ms(SPRINT_FIM);
  min = Math.min(min, hoje);
  max = Math.max(max, hoje);
  // 3 dias de folga de cada lado para respiro visual
  const inicioMs = min - 3 * DIA;
  const fimMs = Math.max(max + 3 * DIA, inicioMs + 7 * DIA);
  const span = fimMs - inicioMs;
  const semanas = Math.max(1, Math.ceil(span / (7 * DIA)));

  const pos = (iso: string | null | undefined) => {
    if (!iso) return null;
    return Math.max(0, Math.min(100, ((ms(iso) - inicioMs) / span) * 100));
  };
  return {
    inicioMs,
    fimMs,
    inicio: toIso(inicioMs),
    fim: toIso(fimMs),
    semanas,
    pos,
    dentro: (iso) => {
      if (!iso) return false;
      const t = ms(iso);
      return t >= inicioMs && t <= fimMs;
    },
  };
}
