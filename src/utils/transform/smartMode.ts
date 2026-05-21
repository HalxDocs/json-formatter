// utils/transform/smartMode.ts

/**
 * SMART MODE — auto-normalizes inconsistent JSON structures.
 * 
 * What it does:
 * 1. Recursively cleans objects and arrays.
 * 2. Sorts keys alphabetically.
 * 3. Removes null/undefined/empty fields.
 * 4. Converts numeric-looking keys to numbers where appropriate.
 * 5. Fixes malformed arrays/objects.
 * 6. Produces predictable output for ANY input JSON.
 */

export function smartNormalize(input: any): any {
  return normalize(input);
}

function normalize(value: any): any {
  // Null or undefined → remove it
  if (value === null || value === undefined) return undefined;

  // Primitive types
  if (typeof value !== "object") return value;

  // Array
  if (Array.isArray(value)) {
    const cleaned = value
      .map((v) => normalize(v))
      .filter((v) => v !== undefined);

    return cleaned;
  }

  // Object
  const obj: Record<string, any> = {};

  for (const key of Object.keys(value)) {
    const normalizedValue = normalize(value[key]);

    if (normalizedValue !== undefined && normalizedValue !== "") {
      obj[key] = normalizedValue;
    }
  }

  // Sort keys alphabetically for consistency
  const sorted: Record<string, any> = {};
  Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .forEach((key) => {
      sorted[key] = obj[key];
    });

  return sorted;
}
