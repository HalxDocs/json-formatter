export function jsonToTs(obj: unknown): string {
  if (Array.isArray(obj)) {
    return obj.length > 0 ? `${jsonToTs(obj[0])}[]` : "any[]";
  }
  if (obj !== null && typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    return (
      "{\n" +
      Object.keys(record)
        .map((k) => `  ${k}: ${jsonToTs(record[k])};`)
        .join("\n") +
      "\n}"
    );
  }
  return typeof obj;
}
