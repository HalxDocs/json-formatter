// utils/tree/useTreeBuilder.ts

export interface TreeNode {
  id: string;
  key: string;
  type: string;
  value?: any;
  children?: TreeNode[];
  path: string;
}

const MAX_DEPTH = 100;

function safeId() {
  return Math.random().toString(36).slice(2, 11);
}

export function buildTree(
  input: any,
  path: string = "root",
  depth: number = 0,
  seen = new WeakSet()
): TreeNode {

  const id = safeId();
  const isRoot = path === "root";
  const key = isRoot ? "(root)" : path.split(".").pop() || "(item)";

  // Prevent infinite recursion
  if (depth > MAX_DEPTH) {
    return {
      id,
      key,
      type: "depth_limit",
      value: "Max depth reached",
      path
    };
  }

  // NULL
  if (input === null) {
    return {
      id,
      key,
      type: "null",
      value: null,
      path
    };
  }

  // Primitive
  if (typeof input !== "object") {
    return {
      id,
      key,
      type: typeof input,
      value: input,
      path
    };
  }

  // Circular reference
  if (seen.has(input)) {
    return {
      id,
      key,
      type: "circular",
      value: "[Circular Reference]",
      path
    };
  }
  seen.add(input);

  // ARRAY
  if (Array.isArray(input)) {
    const children = input.map((item, index) =>
      buildTree(item, `${path}.${index}`, depth + 1, seen)
    );

    return {
      id,
      key,
      type: "array",
      children,
      path
    };
  }

  // OBJECT
  const keys = Object.keys(input);
  const children = keys.map((k) =>
    buildTree(input[k], `${path}.${k}`, depth + 1, seen)
  );

  return {
    id,
    key,
    type: "object",
    children,
    path
  };
}
