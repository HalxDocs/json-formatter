// utils/transform/customTemplate.ts

import { flattenJSON } from "./flatten";

/**
 * Simple template engine that replaces {{keys}} with values.
 * Uses flattened JSON to ensure a consistent structure.
 */

export function buildCustomTemplate(input: any, template: string): string {
  if (!template || typeof template !== "string") return "";

  // Flatten first to ensure clear structure
  const flat = flattenJSON(input);
  if (!Array.isArray(flat) || flat.length === 0) return "";

  let result = "";

  for (const item of flat) {
    let entry = template;

    // Replace all {{key}} occurrences
    Object.keys(item).forEach((key) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      entry = entry.replace(regex, String(item[key] ?? ""));
    });

    result += entry + "\n\n";
  }

  return result.trim();
}
