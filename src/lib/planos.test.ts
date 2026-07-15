import { describe, it, expect } from "vitest";
import {
  PLANOS,
  planoFixo,
  exigeUnidades,
  valorParaTipo,
  rotuloPlano,
} from "./planos";

const ESSENCIAL = PLANOS[0].valor; // 250
const COMPLETO = PLANOS[1].valor; // 850

describe("planoFixo — plano travado por tipo de negócio", () => {
  it("franqueado é sempre Essencial (R$250)", () => {
    expect(planoFixo("franqueado")).toEqual({
      id: "essencial",
      nome: "Essencial",
      valor: 250,
    });
  });

  it("franqueador não tem plano fixo — o MRR é negociado por unidades", () => {
    expect(planoFixo("franqueador")).toBeNull();
  });

  it("independente e sem tipo escolhem o plano livremente", () => {
    expect(planoFixo("independente")).toBeNull();
    expect(planoFixo(null)).toBeNull();
  });
});

describe("exigeUnidades — só o franqueador depende do tamanho da rede", () => {
  it("franqueador exige o nº de unidades", () => {
    expect(exigeUnidades("franqueador")).toBe(true);
  });

  it("os demais tipos não usam unidades", () => {
    expect(exigeUnidades("franqueado")).toBe(false);
    expect(exigeUnidades("independente")).toBe(false);
    expect(exigeUnidades(null)).toBe(false);
  });
});

describe("valorParaTipo — MRR ao trocar o tipo de negócio", () => {
  it("virar franqueado força o Essencial, mesmo vindo do Completo", () => {
    expect(valorParaTipo("franqueado", COMPLETO)).toBe(ESSENCIAL);
  });

  it("virar franqueado força o Essencial, mesmo vindo de valor negociado", () => {
    expect(valorParaTipo("franqueado", 1600)).toBe(ESSENCIAL);
  });

  it("franqueador mantém o valor já digitado (negociado à mão)", () => {
    expect(valorParaTipo("franqueador", 1600)).toBe(1600);
  });

  it("independente e sem tipo mantêm o plano escolhido", () => {
    expect(valorParaTipo("independente", COMPLETO)).toBe(COMPLETO);
    expect(valorParaTipo(null, COMPLETO)).toBe(COMPLETO);
  });
});

describe("rotuloPlano — MRR negociado de rede cai em Personalizado", () => {
  it("valores de plano mostram o nome do plano", () => {
    expect(rotuloPlano(ESSENCIAL)).toBe("Essencial");
    expect(rotuloPlano(COMPLETO)).toBe("Completo");
  });

  it("valor negociado fora dos planos vira Personalizado", () => {
    expect(rotuloPlano(1600)).toBe("Personalizado");
  });
});
