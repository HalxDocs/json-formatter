export function autoFixJson(input: string): string {
  let text = input.trim();

  // Remove BOM
  text = text.replace(/^﻿/, "");

  // Strip single-line comments  (// ...)
  text = text.replace(/\/\/[^\n]*/g, "");

  // Strip multi-line comments  (/* ... */)
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");

  // Python / Ruby / JS literals → JSON equivalents
  text = text.replace(/\bNone\b/g,      "null");
  text = text.replace(/\bTrue\b/g,      "true");
  text = text.replace(/\bFalse\b/g,     "false");
  text = text.replace(/\bundefined\b/g, "null");
  text = text.replace(/\bNaN\b/g,       "null");
  text = text.replace(/\bInfinity\b/g,  "null");

  // Single-quoted strings → double-quoted
  // Handles escaped single quotes (\') inside
  text = text.replace(/'((?:[^'\\]|\\.)*)'/g, (_, inner) => {
    const escaped = inner
      .replace(/\\'/g, "'")           // unescape \'
      .replace(/(?<!\\)"/g, '\\"');   // escape bare "
    return `"${escaped}"`;
  });

  // Quote unquoted object keys  { key: → { "key":
  text = text.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":');

  // Trailing commas before ] or }
  text = text.replace(/,(\s*[}\]])/g, "$1");

  // Hex numbers → decimal  (0xFF → 255)
  text = text.replace(/\b0x([0-9a-fA-F]+)\b/g, (_, hex) => String(parseInt(hex, 16)));

  // Try to parse; if it still fails, attempt bracket-balance recovery
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // Bracket-balance pass: count unclosed { and [
    const stack: string[] = [];
    let inString = false;
    let escape = false;

    for (const ch of text) {
      if (escape)              { escape = false; continue; }
      if (ch === "\\" && inString) { escape = true; continue; }
      if (ch === '"')          { inString = !inString; continue; }
      if (inString)            continue;
      if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
      if (ch === "}" || ch === "]") stack.pop();
    }

    // Append missing closing brackets in reverse order
    text += stack.reverse().join("");

    return JSON.stringify(JSON.parse(text), null, 2);
  }
}
