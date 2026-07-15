import { describe, it, expect } from "vitest";
import { detalheDoCanal } from "./origemDetalhe";

describe("detalheDoCanal — sub-origem dentro do canal", () => {
  it("inbound escolhe a rede", () => {
    expect(detalheDoCanal("inbound")).toEqual({
      modo: "select",
      label: "Origem do inbound",
      opcoes: ["Instagram", "LinkedIn", "Reddit", "Meta Ads"],
    });
  });

  it("outbound escolhe a abordagem", () => {
    const d = detalheDoCanal("outbound");
    expect(d?.modo).toBe("select");
    expect(d).toMatchObject({ opcoes: ["Pesquisa", "Presencial"] });
  });

  it("indicações pede quem indicou, em texto livre", () => {
    const d = detalheDoCanal("indicacoes");
    expect(d?.modo).toBe("texto");
    expect(d?.label).toBe("Quem indicou");
  });

  it("canais sem sub-origem não pedem detalhe", () => {
    // Fin Light mantém o slug member-get-member (o código o referencia).
    expect(detalheDoCanal("member-get-member")).toBeNull();
    expect(detalheDoCanal("base-yungas")).toBeNull();
    expect(detalheDoCanal("abf")).toBeNull();
  });

  it("canal desconhecido ou ausente não quebra", () => {
    expect(detalheDoCanal(undefined)).toBeNull();
    expect(detalheDoCanal("")).toBeNull();
    expect(detalheDoCanal("canal-que-nao-existe")).toBeNull();
  });
});
