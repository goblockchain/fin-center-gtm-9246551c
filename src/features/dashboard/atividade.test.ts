import { describe, it, expect } from "vitest";
import { agregarSemanas } from "./atividade";
import type { PipelineSemana } from "@/types/db";

const row = (
  semana: string,
  canal_id: string,
  contatos: number,
  reunioes: number,
  fechamentos: number,
): PipelineSemana => ({ semana, canal_id, contatos, reunioes, fechamentos });

const rows = [
  row("2026-06-15", "c1", 5, 1, 0),
  row("2026-06-15", "c2", 6, 0, 0),
  row("2026-06-08", "c1", 43, 2, 0),
  row("2026-06-01", "c1", 1, 1, 1),
];

describe("agregarSemanas — atividade semanal do pipe", () => {
  it("todos os canais: soma por semana e ordena da mais recente", () => {
    const { semanas, totais } = agregarSemanas(rows, "all");
    expect(semanas.map((s) => s.semana)).toEqual([
      "2026-06-15",
      "2026-06-08",
      "2026-06-01",
    ]);
    expect(semanas[0]).toMatchObject({
      contatos: 11,
      reunioes: 1,
      fechamentos: 0,
    });
    expect(totais).toEqual({ contatos: 55, reunioes: 4, fechamentos: 1 });
  });

  it("filtra por canal", () => {
    const { semanas, totais } = agregarSemanas(rows, "c2");
    expect(semanas).toHaveLength(1);
    expect(semanas[0]).toMatchObject({ semana: "2026-06-15", contatos: 6 });
    expect(totais.contatos).toBe(6);
  });

  it("ignora linhas sem semana e limita a 12", () => {
    const muitas = Array.from({ length: 15 }, (_, i) =>
      row(`2026-01-${String(i + 1).padStart(2, "0")}`, "c1", 1, 0, 0),
    );
    const { semanas } = agregarSemanas(
      [...muitas, { semana: null, canal_id: "c1", contatos: 9, reunioes: 0, fechamentos: 0 }],
      "all",
    );
    expect(semanas).toHaveLength(12);
  });
});
