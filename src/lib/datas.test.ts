import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { diasAte, relativo, prazoHumano, urgencia, dataCurta } from "./datas";

describe("datas — prazos e cores (relativo a hoje)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T10:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("diasAte", () => {
    expect(diasAte("2026-06-19")).toBe(0);
    expect(diasAte("2026-06-21")).toBe(2);
    expect(diasAte("2026-06-17")).toBe(-2);
    expect(diasAte(null)).toBeNull();
  });

  it("relativo em linguagem humana", () => {
    expect(relativo("2026-06-19")).toBe("hoje");
    expect(relativo("2026-06-20")).toBe("amanhã");
    expect(relativo("2026-06-18")).toBe("ontem");
    expect(relativo("2026-06-24")).toBe("em 5 dias");
    expect(relativo("2026-06-14")).toBe("há 5 dias");
  });

  it("urgência: verde (ok) · âmbar (perto, ≤2d) · vermelho (vencido)", () => {
    expect(urgencia("2026-06-25")).toBe("ok"); // +6 dias
    expect(urgencia("2026-06-21")).toBe("perto"); // +2 dias
    expect(urgencia("2026-06-19")).toBe("perto"); // hoje
    expect(urgencia("2026-06-18")).toBe("vencido"); // ontem
    expect(urgencia(null)).toBe("ok");
  });

  it("prazoHumano marca atraso", () => {
    expect(prazoHumano("2026-06-17")).toContain("atrasado");
    expect(prazoHumano("2026-06-21")).toBe("em 2 dias");
  });

  it("dataCurta dd/mm/aaaa", () => {
    expect(dataCurta("2026-06-19")).toBe("19/06/2026");
    expect(dataCurta(null)).toBe("—");
  });
});
