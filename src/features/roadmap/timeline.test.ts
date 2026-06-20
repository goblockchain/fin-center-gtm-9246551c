import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calcularTimeline } from "./timeline";

describe("calcularTimeline — linha do tempo maleável", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T10:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("sem datas: cai na janela padrão da sprint (~11 semanas)", () => {
    const tl = calcularTimeline([]);
    expect(tl.semanas).toBe(11);
  });

  it("a janela se molda às datas reais (uma data distante estende)", () => {
    const padrao = calcularTimeline([]).semanas;
    const estendida = calcularTimeline(["2026-10-15"]).semanas;
    expect(estendida).toBeGreaterThan(padrao);
    expect(calcularTimeline(["2026-10-15"]).dentro("2026-10-15")).toBe(true);
  });

  it("pos: 0% no início, 100% no fim, monotônico e clampado", () => {
    const tl = calcularTimeline(["2026-06-20", "2026-08-10"]);
    expect(tl.pos(tl.inicio)!).toBeLessThan(1);
    expect(tl.pos(tl.fim)!).toBeGreaterThan(99);
    expect(tl.pos("2026-06-25")!).toBeLessThan(tl.pos("2026-08-01")!);
    expect(tl.pos("2000-01-01")).toBe(0); // clamp
    expect(tl.pos("2099-01-01")).toBe(100); // clamp
    expect(tl.pos(null)).toBeNull();
  });

  it("sempre inclui hoje e marca dentro/fora corretamente", () => {
    const tl = calcularTimeline(["2026-06-20", "2026-07-10"]);
    expect(tl.dentro("2026-06-19")).toBe(true); // hoje
    expect(tl.dentro("2026-07-01")).toBe(true);
    expect(tl.dentro("2030-01-01")).toBe(false);
  });
});
