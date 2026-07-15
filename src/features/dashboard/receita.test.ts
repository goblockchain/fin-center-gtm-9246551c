import { describe, it, expect, vi, afterEach } from "vitest";
import {
  metricasReceita,
  janelaFechamentos,
  paybackMeses,
  linhasPorCanal,
  type OportReceita,
} from "./receita";
import type { CanalExecucao, CanalKpis, Canal } from "@/types/db";

const op = (
  estagio: OportReceita["estagio"],
  valor_mrr = 250,
  probabilidade: number | null = null,
  data = "2026-06-10",
  canal_id = "c1",
): OportReceita => ({
  estagio,
  valor_mrr,
  probabilidade,
  data_entrada_estagio: data,
  canal_id,
});

describe("metricasReceita — funil de receita", () => {
  it("mapeia Lead/MQL/SQL/Proposta/Cliente sobre os estágios", () => {
    const m = metricasReceita([
      op("cadastrado"),
      op("contatado"),
      op("qualificado"),
      op("reuniao"),
      op("proposta"),
      op("fechado_ganho", 850),
    ]);
    expect(m.leads).toBe(6);
    expect(m.mql).toBe(4); // qualificado em diante
    expect(m.sql).toBe(3); // reunião em diante
    expect(m.propostas).toBe(2); // proposta em diante
    expect(m.clientes).toBe(1);
    expect(m.mrr).toBe(850);
  });

  it("pipeline ponderado usa a probabilidade default por estágio", () => {
    // reunião 40% → 100 ; cadastrado 5% → 12.5
    const m = metricasReceita([
      op("reuniao", 250, null),
      op("cadastrado", 250, null),
    ]);
    expect(m.pipelinePonderado).toBeCloseTo(112.5);
  });

  it("usa a probabilidade da oportunidade quando presente", () => {
    const m = metricasReceita([op("contatado", 1000, 50)]);
    expect(m.pipelinePonderado).toBeCloseTo(500);
  });

  it("ganhos e perdidos não entram no pipeline ponderado", () => {
    const m = metricasReceita([
      op("fechado_ganho", 850),
      op("fechado_perdido", 250),
    ]);
    expect(m.pipelinePonderado).toBe(0);
  });
});

describe("paybackMeses", () => {
  it("é investido ÷ MRR ganho", () => {
    expect(paybackMeses(500, 850)).toBeCloseTo(500 / 850);
  });
  it("MRR zero → null (sem payback)", () => {
    expect(paybackMeses(500, 0)).toBeNull();
  });
});

describe("janelaFechamentos — período atual vs anterior", () => {
  afterEach(() => vi.useRealTimers());

  it("separa fechamentos por janela de N dias", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00"));
    // semana (7d): atual >= 13/06 ; anterior 06/06..12/06
    const ops = [
      op("fechado_ganho", 100, null, "2026-06-15"), // atual
      op("fechado_ganho", 200, null, "2026-06-08"), // anterior
      op("contatado", 999, null, "2026-06-16"), // não é ganho
    ];
    const j = janelaFechamentos(ops, 7);
    expect(j.atual).toEqual({ mrr: 100, clientes: 1 });
    expect(j.anterior).toEqual({ mrr: 200, clientes: 1 });
  });
});

describe("linhasPorCanal — CAC/ROI/Payback canônicos", () => {
  const canais = [
    { id: "c1", nome: "Com custo", tipo: "outbound" },
    { id: "c2", nome: "Sem custo", tipo: "comunidade" },
  ] as Canal[];
  const execucoes = [
    { canal_id: "c1", investimento_executado: 500 },
    { canal_id: "c2", investimento_executado: 0 },
  ] as unknown as CanalExecucao[];
  const kpis = [
    { canal_id: "c1", mrr_ganho: 850, roi: 0.7 },
    { canal_id: "c2", mrr_ganho: 850, roi: null },
  ] as unknown as CanalKpis[];
  const ops = [op("fechado_ganho", 850, null, "2026-06-06", "c1"), op("fechado_ganho", 850, null, "2026-06-06", "c2")];

  it("canal com custo: CAC = investido/clientes e payback derivado", () => {
    const linhas = linhasPorCanal(ops, execucoes, kpis, canais);
    const c1 = linhas.find((l) => l.canal_id === "c1")!;
    expect(c1.clientes).toBe(1);
    expect(c1.cac).toBe(500); // 500 / 1
    expect(c1.payback).toBeCloseTo(500 / 850);
    expect(c1.roi).toBe(0.7);
  });

  it("canal sem custo (investido 0): CAC e Payback ficam null", () => {
    const linhas = linhasPorCanal(ops, execucoes, kpis, canais);
    const c2 = linhas.find((l) => l.canal_id === "c2")!;
    expect(c2.cac).toBeNull();
    expect(c2.payback).toBeNull();
    expect(c2.roi).toBeNull();
    expect(c2.mrr).toBe(850);
  });
});

describe("metricasReceita — esteira pós-fechamento (piloto / envio_contrato)", () => {
  it("envio_contrato e piloto contam como MQL, SQL e Proposta", () => {
    // Regressão: entraram no enum na 0016 e ficaram fora das faixas
    // "em diante" — um negócio quase fechado não aparecia no funil.
    const m = metricasReceita([op("envio_contrato"), op("piloto")]);
    expect(m.mql).toBe(2);
    expect(m.sql).toBe(2);
    expect(m.propostas).toBe(2);
  });

  it("envio_contrato e piloto entram no pipeline ponderado — estão abertos", () => {
    // Antes somavam 0: sumiam da projeção de receita justamente no fim do funil.
    const m = metricasReceita([
      op("envio_contrato", 1000), // 90%
      op("piloto", 1000), // 95%
    ]);
    expect(m.pipelinePonderado).toBe(900 + 950);
  });

  it("piloto vale mais que envio_contrato — vem depois na esteira", () => {
    const contrato = metricasReceita([op("envio_contrato", 1000)]);
    const piloto = metricasReceita([op("piloto", 1000)]);
    expect(piloto.pipelinePonderado).toBeGreaterThan(contrato.pipelinePonderado);
  });

  it("fechados não entram no pipeline ponderado", () => {
    const m = metricasReceita([op("fechado_ganho", 1000), op("fechado_perdido", 1000)]);
    expect(m.pipelinePonderado).toBe(0);
  });
});
