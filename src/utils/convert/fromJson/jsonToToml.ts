export function jsonToToml(obj: any, prefix = ""): string {
  let output = "";

  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && !Array.isArray(value)) {
      output += `\n[${fullKey}]\n`;
      output += jsonToToml(value, fullKey);
    } else if (Array.isArray(value)) {
      output += `${key} = ${JSON.stringify(value)}\n`;
    } else {
      output += `${key} = ${typeof value === "string" ? `"${value}"` : value}\n`;
    }
  }

  return output;
}
