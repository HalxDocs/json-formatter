export interface DecodedEntry {
  path: string;
  original: string;
  type: "jwt" | "base64";
  decoded: string;
  decodedObj?: unknown;
}

function isJWT(s: string): boolean {
  const parts = s.split(".");
  return (
    parts.length === 3 &&
    parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p)) &&
    parts[0].length > 10
  );
}

// Only flag strings that are clearly base64: at least 16 chars, valid charset, correct padding
function isBase64(s: string): boolean {
  return (
    s.length >= 16 &&
    s.length % 4 === 0 &&
    /^[A-Za-z0-9+/]+=*$/.test(s)
  );
}

function safeAtob(s: string): string | null {
  try {
    const decoded = atob(s);
    // Filter out non-printable output (raw binary)
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function decodeJWT(s: string): { header: unknown; payload: unknown } {
  const [headerB64, payloadB64] = s.split(".");
  const decode = (b: string): unknown => {
    try {
      return JSON.parse(atob(b.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return { raw: b };
    }
  };
  return { header: decode(headerB64), payload: decode(payloadB64) };
}

export function findDecodableValues(obj: unknown, path = "$"): DecodedEntry[] {
  const results: DecodedEntry[] = [];

  function walk(node: unknown, p: string) {
    if (typeof node === "string") {
      if (isJWT(node)) {
        const jwtData = decodeJWT(node);
        results.push({
          path: p,
          original: node.length > 80 ? node.slice(0, 80) + "…" : node,
          type: "jwt",
          decoded: JSON.stringify(jwtData, null, 2),
          decodedObj: jwtData,
        });
      } else if (isBase64(node)) {
        const text = safeAtob(node);
        if (text) {
          results.push({
            path: p,
            original: node.length > 80 ? node.slice(0, 80) + "…" : node,
            type: "base64",
            decoded: text,
          });
        }
      }
    } else if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${p}[${i}]`));
    } else if (node != null && typeof node === "object") {
      Object.entries(node as Record<string, unknown>).forEach(([k, v]) =>
        walk(v, `${p}.${k}`)
      );
    }
  }

  walk(obj, path);
  return results;
}
