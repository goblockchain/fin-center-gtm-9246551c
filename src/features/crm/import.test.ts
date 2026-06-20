import { describe, it, expect } from "vitest";
import { buildImportPayload, inspecionarColunas, type CsvRow } from "./import";

describe("buildImportPayload — mapeamento da planilha", () => {
  it("ignora linhas sem nome", () => {
    const rows: CsvRow[] = [
      { Nome: "Café A" },
      { Nome: "" },
      { Telefone: "(48) 0000" },
    ];
    const p = buildImportPayload(rows, "canal1");
    expect(p.total).toBe(1);
    expect(p.ignoradas).toBe(2);
    expect(p.contas[0].canal_origem_id).toBe("canal1");
  });

  it("mapeia temperatura, bairro, decisor e estágio derivado", () => {
    const rows: CsvRow[] = [
      {
        Nome: "Café X",
        Temperatura: "🔥 Quente",
        Decisor: "João",
        Endereço: "Rua A, 1 - Centro",
        Telefone: "(48) 99999-0001",
      },
    ];
    const p = buildImportPayload(rows, "canal1");
    expect(p.contas[0].temperatura).toBe("quente");
    expect(p.contas[0].bairro).toBe("Centro");
    expect(p.contas[0].telefone).toBe("(48) 99999-0001");
    expect(p.contatos[0]).toMatchObject({ nome: "João", papel: "decisor" });
    // quente → reunião; oportunidade no canal escolhido
    expect(p.oportunidades[0].estagio).toBe("reuniao");
    expect(p.oportunidades[0].canal_id).toBe("canal1");
    expect(p.oportunidades[0].valor_mrr).toBe(250);
  });

  it("frio com primeiro contato vira 'contatado' e gera interação", () => {
    const rows: CsvRow[] = [
      { Nome: "Café Y", Temperatura: "❄ Frio", "Primeiro Contato (Whatsapp)": "✓ Sim" },
    ];
    const p = buildImportPayload(rows, "c1");
    expect(p.oportunidades[0].estagio).toBe("contatado");
    expect(p.interacoes[0].tipo).toBe("whatsapp");
  });

  it("usa o responsável padrão quando a linha não traz responsável", () => {
    const p = buildImportPayload([{ Nome: "Café Z" }], "c1", 250, "Natalia");
    expect(p.contas[0].responsavel).toBe("Natalia");
    expect(p.oportunidades[0].responsavel).toBe("Natalia");
  });

  it("respeita o plano (valor_mrr) informado", () => {
    const p = buildImportPayload([{ Nome: "Café W" }], "c1", 850);
    expect(p.oportunidades[0].valor_mrr).toBe(850);
  });
});

describe("inspecionarColunas — revisão da planilha", () => {
  it("detecta as colunas-chave por cabeçalho normalizado", () => {
    const rows: CsvRow[] = [
      { Nome: "A", Telefone: "1", Decisor: "B", Temperatura: "🔥", "Endereço": "x" },
    ];
    const c = inspecionarColunas(rows);
    expect(c).toMatchObject({
      nome: true,
      telefone: true,
      decisor: true,
      temperatura: true,
      endereco: true,
    });
  });

  it("acusa ausência da coluna Nome", () => {
    const c = inspecionarColunas([{ Telefone: "1" }]);
    expect(c.nome).toBe(false);
  });
});
