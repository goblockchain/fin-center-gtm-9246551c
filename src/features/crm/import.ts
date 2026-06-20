import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Insert, Temperatura, EstagioOport } from "@/types/db";

export type CsvRow = Record<string, string>;

export type ImportPayload = {
  contas: Insert<"contas">[];
  oportunidades: Insert<"oportunidades">[];
  contatos: Insert<"contatos">[];
  interacoes: Insert<"interacoes">[];
  total: number;
  ignoradas: number;
};

export function parseCsvFile(file: File): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => resolve(res.data),
      error: reject,
    });
  });
}

/** Lê .xlsx/.xls (1ª aba) e devolve linhas no mesmo formato do CSV. */
export async function parseExcelFile(file: File): Promise<CsvRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const linhas = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
    raw: false,
  });
  return linhas.map((r) => {
    const o: CsvRow = {};
    for (const [k, v] of Object.entries(r)) {
      o[String(k).trim()] = v == null ? "" : String(v).trim();
    }
    return o;
  });
}

/** Roteia por extensão: Excel (.xlsx/.xls) ou CSV. */
export function parseImportFile(file: File): Promise<CsvRow[]> {
  const nome = file.name.toLowerCase();
  if (nome.endsWith(".xlsx") || nome.endsWith(".xls")) {
    return parseExcelFile(file);
  }
  return parseCsvFile(file);
}

/** Cabeçalhos detectados e checagem dos campos-chave (para o passo de revisão). */
export function inspecionarColunas(rows: CsvRow[]) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const tem = (...needles: string[]) =>
    headers.some((h) =>
      needles.some((n) =>
        h
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .includes(n),
      ),
    );
  return {
    headers,
    nome: tem("nome"),
    telefone: tem("telefone"),
    decisor: tem("decisor"),
    temperatura: tem("temperatura"),
    endereco: tem("endereco", "endereço"),
  };
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/** Pega o valor da primeira coluna cujo cabeçalho casa (por substring normalizada). */
function pick(row: CsvRow, ...needles: string[]): string {
  const entries = Object.entries(row);
  for (const n of needles) {
    const nn = norm(n);
    const hit = entries.find(([k]) => norm(k).includes(nn));
    if (hit && hit[1] != null) return String(hit[1]).trim();
  }
  return "";
}

const isSim = (v: string) => /sim|✓|true|x/i.test(v) && !/não|nao/i.test(v);

function parseTemp(v: string): Temperatura {
  if (/🔥|quente/i.test(v)) return "quente";
  if (/☀|morno/i.test(v)) return "morno";
  if (/❄|frio|fria/i.test(v)) return "frio";
  return "sem_contato";
}

function bairroDe(endereco: string): string | null {
  if (!endereco) return null;
  const parts = endereco.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : null;
}

function dataBR(v: string): string | null {
  const m = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const yyyy = y.length === 2 ? `20${y}` : y;
  return `${yyyy}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

const PROB: Record<EstagioOport, number> = {
  cadastrado: 5,
  contatado: 10,
  qualificado: 25,
  reuniao: 40,
  proposta: 60,
  negociacao: 75,
  fechado_ganho: 100,
  fechado_perdido: 0,
};

function estagioDe(temp: Temperatura, contatado: boolean): EstagioOport {
  if (temp === "quente") return "reuniao";
  if (temp === "morno") return "qualificado";
  if (temp === "frio") return contatado ? "contatado" : "cadastrado";
  return "cadastrado";
}

/** Mapeia as linhas do CSV (planilha 📋 Prospecção) para inserts. canal_origem é FK escolhida. */
export function buildImportPayload(
  rows: CsvRow[],
  canalId: string,
  valorMrr = 250,
  responsavelPadrao?: string,
): ImportPayload {
  const contas: Insert<"contas">[] = [];
  const oportunidades: Insert<"oportunidades">[] = [];
  const contatos: Insert<"contatos">[] = [];
  const interacoes: Insert<"interacoes">[] = [];
  let ignoradas = 0;
  const hoje = new Date().toISOString().slice(0, 10);

  for (const row of rows) {
    const nome = pick(row, "nome");
    if (!nome) {
      ignoradas++;
      continue;
    }
    const id = crypto.randomUUID();
    const endereco = pick(row, "endereco", "endereço") || null;
    const temperatura = parseTemp(pick(row, "temperatura"));
    const contatado = isSim(pick(row, "primeiro contato", "whatsapp"));
    const dcontato = dataBR(pick(row, "data contato", "data do contato"));
    const responsavel = pick(row, "responsavel", "responsável") || responsavelPadrao || null;

    contas.push({
      id,
      nome,
      endereco,
      bairro: bairroDe(endereco ?? ""),
      telefone: pick(row, "telefone") || null,
      instagram: pick(row, "instagram") || null,
      canal_origem_id: canalId,
      temperatura,
      responsavel,
      visitada: isSim(pick(row, "visitada")),
      entrevista_agendada: isSim(pick(row, "entrevista")),
      data_primeiro_contato: dcontato,
      proxima_acao: pick(row, "prox", "próx", "proxima acao") || null,
      obs: pick(row, "obs", "notes", "observ") || null,
      ref_externa: pick(row, "no", "nº", "numero") || null,
    });

    const estagio = estagioDe(temperatura, contatado);
    oportunidades.push({
      conta_id: id,
      canal_id: canalId,
      estagio,
      valor_mrr: valorMrr,
      probabilidade: PROB[estagio],
      data_entrada_estagio: dcontato ?? hoje,
      responsavel,
    });

    const decisor = pick(row, "decisor");
    if (decisor) contatos.push({ conta_id: id, nome: decisor, papel: "decisor" });
    const gatekeeper = pick(row, "gatekeeper");
    if (gatekeeper)
      contatos.push({ conta_id: id, nome: gatekeeper, papel: "gatekeeper" });

    if (contatado)
      interacoes.push({
        conta_id: id,
        canal_id: canalId,
        tipo: "whatsapp",
        data: dcontato ?? hoje,
        resumo: "Primeiro contato via WhatsApp",
        autor: responsavel,
      });
    if (isSim(pick(row, "visitada")))
      interacoes.push({
        conta_id: id,
        canal_id: canalId,
        tipo: "visita",
        data: dcontato ?? hoje,
        resumo: "Visita presencial",
        autor: responsavel,
      });
  }

  return {
    contas,
    oportunidades,
    contatos,
    interacoes,
    total: contas.length,
    ignoradas,
  };
}
