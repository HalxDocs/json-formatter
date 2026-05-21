// components/tree/TreeViewer.tsx

import React, { useEffect, useState } from "react";
import { X, Search, TreePine } from "lucide-react";
import { buildTree, type TreeNode } from "../../utils/tree/useTreeBuilder";
import TreeNodeItem from "./TreeNode";
import { notify } from "../../utils/notify";

interface TreeViewerProps {
  open: boolean;
  json: string;
  theme: string;
  onClose: () => void;
}

const TreeViewer: React.FC<TreeViewerProps> = ({
  open,
  json,
  theme,
  onClose,
}) => {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // -----------------------------
  // Parse JSON & build tree
  // -----------------------------
  useEffect(() => {
    if (!open) return;

    try {
      setError("");

      if (!json.trim()) {
        setError("Input JSON is empty");
        setRoot(null);
        return;
      }

      const parsed = JSON.parse(json);
      setRoot(buildTree(parsed));
    } catch (err: any) {
      setError(err?.message || "Invalid JSON");
      setRoot(null);
    }
  }, [open, json]);

  if (!open) return null;

  // -----------------------------
  // Normalize JSON path
  // -----------------------------
  const normalizePath = (path: string) => {
    return path
      .replace(/^root\.?/, "")
      .replace(/\.(\d+)/g, "[$1]");
  };

  // -----------------------------
  // Theme styles
  // -----------------------------
  const panelStyle =
    theme === "dark"
      ? "bg-[#111]/90 border-white/10 text-white"
      : "bg-white/90 border-slate-300 text-slate-900";

  // -----------------------------
  // Search filter
  // -----------------------------
  const filterTree = (node: TreeNode): TreeNode | null => {
    if (!search) return node;

    const text = search.toLowerCase();
    const matchKey = node.key.toLowerCase().includes(text);
    const matchVal = node.value
      ?.toString?.()
      ?.toLowerCase?.()
      ?.includes(text);

    if (matchKey || matchVal) return node;

    if (!node.children) return null;

    const filtered = node.children
      .map(filterTree)
      .filter((n) => n !== null) as TreeNode[];

    return filtered.length > 0 ? { ...node, children: filtered } : null;
  };

  const filtered = root ? filterTree(root) : null;

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* SIDE PANEL */}
      <div
        className={`relative h-full w-[380px] sm:w-[450px] md:w-[520px]
                    ml-auto border-l backdrop-blur-xl shadow-xl p-4
                    ${panelStyle}`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TreePine className="text-green-400" size={20} />
            <h2 className="text-lg font-semibold">JSON Tree</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div
          className={`flex gap-2 items-center p-2 rounded-xl border mb-4 ${
            theme === "dark"
              ? "bg-black/20 border-white/10"
              : "bg-slate-100 border-slate-300"
          }`}
        >
          <Search size={14} className="opacity-60" />
          <input
            className="bg-transparent w-full focus:outline-none text-sm"
            placeholder="Search keys or values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error && !filtered && (
          <div className="text-slate-400 text-sm">
            No matches or empty tree.
          </div>
        )}

        {/* TREE */}
        {filtered && (
          <TreeNodeItem
            node={filtered}
            level={0}
            theme={theme}
            onSelect={(path) => {
              const cleanPath = normalizePath(path);
              navigator.clipboard.writeText(cleanPath);
              notify({
                type: "success",
                message: `Copied path: ${cleanPath}`,
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TreeViewer;
