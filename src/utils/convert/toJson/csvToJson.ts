// Robust CSV → JSON converter
// Handles: quoted fields, commas inside quotes, escaped quotes (""), CRLF, empty rows

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          // Escaped double-quote inside quoted field
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
        i++;
      } else {
        current += ch;
        i++;
      }
    }
  }

  fields.push(current);
  return fields;
}

function coerce(value: string): string | number | boolean | null {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.toLowerCase() === "null") return null;
  if (trimmed.toLowerCase() === "true")  return true;
  if (trimmed.toLowerCase() === "false") return false;
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== "") return num;
  return trimmed;
}

export function csvToJson(csv: string): Record<string, unknown>[] {
  const lines = csv
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");

  if (lines.length === 0) return [];

  const headers = parseCsvRow(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      obj[h] = coerce(values[i] ?? "");
    });
    return obj;
  });
}
