// utils/json/autoFixJson.ts

export function autoFixJson(input: string): string {
  let text = input.trim();

  // Remove BOM
  text = text.replace(/^\uFEFF/, "");

  // Replace single quotes with double quotes (strings only)
  text = text.replace(
    /'([^'\\]*(\\.[^'\\]*)*)'/g,
    (_, value) => `"${value.replace(/"/g, '\\"')}"`
  );

  // Quote unquoted object keys
  text = text.replace(
    /([{,]\s*)([A-Za-z0-9_]+)\s*:/g,
    '$1"$2":'
  );

  // Remove trailing commas in objects & arrays
  text = text.replace(/,\s*([}\]])/g, "$1");

  // Final parse check
  const parsed = JSON.parse(text);

  // Return formatted JSON
  return JSON.stringify(parsed, null, 2);
}
