// components/tree/TreeNode.tsx

import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  List,
  Quote,
  Hash,
  ToggleLeft,
  MinusCircle,
} from "lucide-react";

import type { TreeNode } from "../../utils/tree/useTreeBuilder";
import { useTreeStore } from "./treeStore";

interface TreeNodeProps {
  node: TreeNode;
  level: number;
  theme: string;
  onSelect?: (path: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeProps> = ({
  node,
  level,
  theme,
  onSelect = () => {},
}) => {
  const tree = useTreeStore();
  const isOpen = tree.expanded.has(node.id);
  const isHighlighted = tree.highlights.includes(node.id);

  const toggle = (e: any) => {
    e.stopPropagation();
    tree.toggle(node.id);
  };

  const isLeaf = !node.children || node.children.length === 0;

  const keyColor = theme === "dark" ? "text-blue-300" : "text-blue-700";
  const valueColor = theme === "dark" ? "text-green-300" : "text-emerald-700";

  const renderIcon = () => {
    switch (node.type) {
      case "object":
        return isOpen ? <FolderOpen size={16} /> : <Folder size={16} />;
      case "array":
        return <List size={16} />;
      case "string":
        return <Quote size={16} />;
      case "number":
        return <Hash size={16} />;
      case "boolean":
        return <ToggleLeft size={16} />;
      case "null":
        return <MinusCircle size={16} />;
      default:
        return <MinusCircle size={16} />;
    }
  };

  return (
    <div className="w-full">
      {/* ROW */}
      <div
        className={`
          flex items-center gap-2 py-[6px] px-2 cursor-pointer rounded-lg
          ${isHighlighted ? "bg-yellow-500/20" : ""}
          ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-200/60"}
        `}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => onSelect(node.path)}
      >
        {/* EXPAND BUTTON */}
        {!isLeaf ? (
          isOpen ? (
            <ChevronDown
              size={14}
              onClick={toggle}
              className="opacity-70 hover:opacity-100"
            />
          ) : (
            <ChevronRight
              size={14}
              onClick={toggle}
              className="opacity-70 hover:opacity-100"
            />
          )
        ) : (
          <span className="w-[14px]" />
        )}

        {/* NODE TYPE ICON */}
        <div className="opacity-70">{renderIcon()}</div>

        {/* KEY */}
        <span className={`text-sm font-medium ${keyColor}`}>
          {node.key}:
        </span>

        {/* VALUE */}
        {isLeaf && (
          <span className={`text-sm ${valueColor}`}>
            {node.type === "string"
              ? `"${node.value}"`
              : String(node.value)}
          </span>
        )}
      </div>

      {/* CHILDREN */}
      {!isLeaf && isOpen && (
        <div className="ml-4 border-l border-white/10 pl-2">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              theme={theme}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNodeItem;
