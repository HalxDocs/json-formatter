export function jsonToYaml(obj: unknown, level = 0): string {
  const pad = "  ".repeat(level);

  if (Array.isArray(obj)) {
    return obj
      .map((item) =>
        typeof item === "object" && item !== null
          ? `${pad}-\n${jsonToYaml(item, level + 1)}`
          : `${pad}- ${item}`
      )
      .join("\n");
  }

  if (obj !== null && typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    return Object.keys(record)
      .map((key) =>
        typeof record[key] === "object" && record[key] !== null
          ? `${pad}${key}:\n${jsonToYaml(record[key], level + 1)}`
          : `${pad}${key}: ${record[key]}`
      )
      .join("\n");
  }

  return `${pad}${obj}`;
}
