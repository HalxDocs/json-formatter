export function jsonToMarkdown(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Markdown requires array data");
  }

  const headers = Object.keys(data[0]);
  const headerRow = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;

  const rows = data.map(row =>
    `| ${headers.map(h => row[h] ?? "").join(" | ")} |`
  );

  return [headerRow, separator, ...rows].join("\n");
}
