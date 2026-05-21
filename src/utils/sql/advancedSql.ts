type Row = Record<string, any>;

function detectSQLType(value: any): string {
  if (value === null) return "TEXT";
  if (typeof value === "number") return Number.isInteger(value) ? "INT" : "FLOAT";
  if (typeof value === "boolean") return "BOOLEAN";
  if (typeof value === "string") return value.length > 255 ? "TEXT" : "VARCHAR(255)";
  if (typeof value === "object") return "JSON";
  return "TEXT";
}

export function generateCreateTable(
  tableName: string,
  sample: Row
): string {
  const cols = Object.entries(sample)
    .map(([k, v]) => `  ${k} ${detectSQLType(v)}`)
    .join(",\n");

  return `CREATE TABLE ${tableName} (\n${cols}\n);`;
}

export function generateInsertStatements(
  tableName: string,
  rows: Row[]
): string {
  const keys = Object.keys(rows[0]).join(", ");

  const values = rows
    .map((row) => {
      const vals = Object.values(row)
        .map((v) => {
          if (v === null) return "NULL";
          if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
          if (typeof v === "object") return `'${JSON.stringify(v)}'`;
          return v;
        })
        .join(", ");
      return `(${vals})`;
    })
    .join(",\n");

  return `INSERT INTO ${tableName} (${keys}) VALUES\n${values};`;
}

export function jsonToAdvancedSQL(
  tableName: string,
  data: any[]
): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("SQL generation requires a non-empty array");
  }

  return `
-- AUTO GENERATED SQL

${generateCreateTable(tableName, data[0])}

${generateInsertStatements(tableName, data)}
`.trim();
}
