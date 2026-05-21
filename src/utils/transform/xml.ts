// utils/transform/xml.ts

export function jsonToXML(obj: any, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (Array.isArray(obj)) {
    return obj.map((v) => jsonToXML(v, indent)).join("");
  }

  if (typeof obj !== "object" || obj === null) {
    return `${pad}${String(obj)}\n`;
  }

  return Object.keys(obj)
    .map((key) => {
      const value = obj[key];
      if (typeof value === "object") {
        return `${pad}<${key}>\n${jsonToXML(
          value,
          indent + 1
        )}${pad}</${key}>\n`;
      }
      return `${pad}<${key}>${String(value)}</${key}>\n`;
    })
    .join("");
}
