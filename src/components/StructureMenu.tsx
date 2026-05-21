// components/StructureMenu.tsx

import React from "react";
import {
  Layers,
  Layers3,
  Wrench,
  Sparkles,
} from "lucide-react";

interface Props {
  open: boolean;
  theme: string;
  onFlatten: () => void;
  onGroup: () => void;
  onSmart: () => void;
  onCustom: () => void;
  onClose: () => void;
}

const StructureMenu: React.FC<Props> = ({
  open,
  theme,
  onFlatten,
  onGroup,
  onSmart,
  onCustom,
  onClose,
}) => {
  // 🚨 FIX: If it's not open, DO NOT RENDER
  if (!open) return null;

  const bg =
    theme === "dark"
      ? "bg-[#101010]/95 border-white/10"
      : "bg-white/95 border-slate-300";

  return (
    <div className="fixed inset-0 z-[9998] flex">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu box */}
      <div
        className={`
          absolute bottom-32 right-6 p-4 w-[240px]
          rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-bottom
          ${bg}
        `}
      >
        <ul className="flex flex-col gap-2 text-sm">

          <li
            onClick={() => {
              onFlatten();
              onClose();
            }}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 cursor-pointer"
          >
            <Layers size={16} className="text-blue-400" />
            Flatten JSON
          </li>

          <li
            onClick={() => {
              onGroup();
              onClose();
            }}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 cursor-pointer"
          >
            <Layers3 size={16} className="text-purple-400" />
            Grouped Format
          </li>

          <li
            onClick={() => {
              onCustom();
              onClose();
            }}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 cursor-pointer"
          >
            <Wrench size={16} className="text-yellow-400" />
            Custom Template
          </li>

          <li
            onClick={() => {
              onSmart();
              onClose();
            }}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 cursor-pointer"
          >
            <Sparkles size={16} className="text-green-400" />
            Smart Mode
          </li>

        </ul>
      </div>
    </div>
  );
};

export default StructureMenu;
