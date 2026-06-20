import { describe, it, expect } from "vitest";
import { brl, pct } from "./format";

// pt-BR usa espaço não-quebrável; normaliza para comparar.
const norm = (s: string) => s.replace(/\s/g, " ");

describe("format — brl e pct", () => {
  it("brl sem centavos por padrão", () => {
    expect(norm(brl(250))).toBe("R$ 250");
    expect(norm(brl(2700))).toBe("R$ 2.700");
    expect(norm(brl(null))).toBe("R$ 0");
    expect(norm(brl("850"))).toBe("R$ 850"); // coage string do PostgREST
  });

  it("brl com centavos", () => {
    expect(norm(brl(250.5, true))).toBe("R$ 250,50");
  });

  it("pct a partir de fração", () => {
    expect(pct(0.02)).toBe("2%");
    expect(pct(0.5)).toBe("50%");
    expect(pct(0.125, 1)).toBe("12.5%");
    expect(pct(null)).toBe("—");
  });
});
