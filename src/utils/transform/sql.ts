export type SQLDialect = "postgres" | "mysql" | "sqlite";

export interface SQLOptions {
  dialect?: SQLDialect;
  primaryKey?: string;
  includeDrop?: boolean;
  includeCreate?: boolean;
  useBatch?: boolean;
}

export function jsonToSQLInsert(
  tableName: string,
  data: Record<string, unknown>[],
  options: SQLOptions = {}
): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("SQL requires a non-empty array of objects");
  }

  const {
    dialect = "postgres",
    primaryKey,
    includeDrop = false,
    includeCreate = true,
    useBatch = true,
  } = options;

  const columns = Object.keys(data[0]);

  const inferType = (value: unknown): string => {
    if (typeof value === "number") return "INT";
    if (typeof value === "boolean") return dialect === "postgres" ? "BOOLEAN" : "INT";
    if (typeof value === "object" && value !== null)
      return dialect === "postgres" ? "JSONB" : "TEXT";
    return "VARCHAR(255)";
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") {
      return dialect === "postgres"
        ? value.toString().toUpperCase()
        : value ? "1" : "0";
    }
    if (typeof value === "object")
      return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    return `'${String(value).replace(/'/g, "''")}'`;
  };

  const parts: string[] = [`-- AUTO-GENERATED SQL (${dialect.toUpperCase()})`];

  if (includeDrop) {
    parts.push(`\nDROP TABLE IF EXISTS ${tableName};`);
  }

  if (includeCreate) {
    const columnDefs = columns.map((col) => {
      const type = inferType(data[0][col]);
      const pk = col === primaryKey ? " PRIMARY KEY" : "";
      return `  ${col} ${type}${pk}`;
    });
    parts.push(`\nCREATE TABLE ${tableName} (\n${columnDefs.join(",\n")}\n);`);
  }

  if (useBatch) {
    const valueRows = data.map(
      (row) => `(${columns.map((col) => formatValue(row[col])).join(", ")})`
    );
    parts.push(
      `\nINSERT INTO ${tableName} (${columns.join(", ")}) VALUES\n${valueRows.join(",\n")};`
    );
  } else {
    const inserts = data.map(
      (row) =>
        `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${columns
          .map((col) => formatValue(row[col]))
          .join(", ")});`
    );
    parts.push("\n" + inserts.join("\n"));
  }

  return parts.join("\n");
}
