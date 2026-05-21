export interface PathResult {
  path: string;
  value: unknown;
}

export function queryJsonPath(root: unknown, expression: string): PathResult[] {
  const expr = expression.trim();
  if (!expr.startsWith("$")) return [];

  const results: PathResult[] = [];

  function traverse(node: unknown, seg: string, currentPath: string) {
    if (!seg) {
      results.push({ path: currentPath, value: node });
      return;
    }

    // Recursive descent  ..
    if (seg.startsWith("..")) {
      const rest = seg.slice(2);
      // Apply to current node first
      traverse(node, rest ? (rest.startsWith("[") ? rest : "." + rest) : "", currentPath);
      // Then recurse into all children
      descend(node, seg, currentPath);
      return;
    }

    // Dot notation  .key  or  .*
    if (seg.startsWith(".")) {
      const rest = seg.slice(1);

      // Wildcard  .*
      if (rest === "" || rest.startsWith("*")) {
        const after = rest.startsWith("*") ? rest.slice(1) : "";
        each(node, currentPath, (child, childPath) => traverse(child, after, childPath));
        return;
      }

      // Key: grab up to next . or [
      const boundary = rest.search(/[.\[]/);
      const key  = boundary === -1 ? rest : rest.slice(0, boundary);
      const tail = boundary === -1 ? "" : rest.slice(boundary);

      if (node != null && typeof node === "object" && !Array.isArray(node)) {
        const val = (node as Record<string, unknown>)[key];
        if (val !== undefined) traverse(val, tail, `${currentPath}.${key}`);
      }
      return;
    }

    // Bracket notation  [n]  [*]  ['key']  ["key"]  [-1]
    if (seg.startsWith("[")) {
      const close = seg.indexOf("]");
      if (close === -1) return;
      const selector = seg.slice(1, close).trim();
      const tail     = seg.slice(close + 1);

      if (selector === "*") {
        each(node, currentPath, (child, childPath) => traverse(child, tail, childPath));
        return;
      }

      // Quoted key  ['foo'] / ["foo"]
      const keyM = selector.match(/^['"](.+)['"]$/);
      if (keyM) {
        if (node != null && typeof node === "object" && !Array.isArray(node)) {
          const val = (node as Record<string, unknown>)[keyM[1]];
          if (val !== undefined) traverse(val, tail, `${currentPath}["${keyM[1]}"]`);
        }
        return;
      }

      // Slice  [start:end]
      if (selector.includes(":")) {
        if (!Array.isArray(node)) return;
        const [s, e] = selector.split(":").map(x => x.trim() === "" ? undefined : parseInt(x));
        const sliced = node.slice(s, e);
        sliced.forEach((item, i) => {
          const realIdx = (s ?? 0) + i;
          traverse(item, tail, `${currentPath}[${realIdx}]`);
        });
        return;
      }

      // Numeric index
      const idx = parseInt(selector);
      if (!isNaN(idx) && Array.isArray(node)) {
        const realIdx = idx < 0 ? node.length + idx : idx;
        if (realIdx >= 0 && realIdx < node.length)
          traverse(node[realIdx], tail, `${currentPath}[${realIdx}]`);
      }
      return;
    }
  }

  function each(
    node: unknown,
    basePath: string,
    cb: (child: unknown, path: string) => void
  ) {
    if (Array.isArray(node)) {
      node.forEach((item, i) => cb(item, `${basePath}[${i}]`));
    } else if (node != null && typeof node === "object") {
      Object.entries(node as Record<string, unknown>).forEach(([k, v]) =>
        cb(v, `${basePath}.${k}`)
      );
    }
  }

  function descend(node: unknown, seg: string, path: string) {
    if (Array.isArray(node)) {
      node.forEach((item, i) => descend(item, seg, `${path}[${i}]`));
    } else if (node != null && typeof node === "object") {
      Object.entries(node as Record<string, unknown>).forEach(([k, v]) =>
        descend(v, seg, `${path}.${k}`)
      );
    }
  }

  // Strip leading $  then dispatch
  const rest = expr.slice(1);
  traverse(root, rest, "$");

  return results;
}
