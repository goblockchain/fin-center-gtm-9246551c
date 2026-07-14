/**
 * Parser CSV mínimo: suporta aspas duplas, vírgula/ponto-e-vírgula como delimitador,
 * quebras \n ou \r\n. Devolve linhas como Record<coluna, string> usando a 1ª linha como cabeçalho.
 */
export type CsvRow = Record<string, string>;

function detectDelim(sample: string): string {
  const firstLine = sample.split(/\r?\n/)[0] ?? "";
  const c = (firstLine.match(/,/g) ?? []).length;
  const s = (firstLine.match(/;/g) ?? []).length;
  return s > c ? ";" : ",";
}

export function parseCSV(text: string): CsvRow[] {
  const clean = text.replace(/^\uFEFF/, ""); // BOM
  if (!clean.trim()) return [];
  const delim = detectDelim(clean);

  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQ) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQ = true;
      } else if (ch === delim) {
        cur.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && clean[i + 1] === "\n") i++;
        cur.push(field);
        field = "";
        rows.push(cur);
        cur = [];
      } else {
        field += ch;
      }
    }
  }
  if (field.length || cur.length) {
    cur.push(field);
    rows.push(cur);
  }

  const header = (rows.shift() ?? []).map((h) => h.trim());
  return rows
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((r) => {
      const obj: CsvRow = {};
      header.forEach((h, idx) => {
        obj[h] = (r[idx] ?? "").trim();
      });
      return obj;
    });
}

/** Faz download de um texto como arquivo. */
export function downloadText(filename: string, text: string, mime = "text/csv") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
