import { Copy, GitCompare } from "lucide-react";
import type { Theme } from "../../types";

interface Props {
  theme: Theme;
  value: string;
  onChange: (v: string) => void;
  onCopy: () => void;
}

const ComparePanel = ({ theme, value, onChange, onCopy }: Props) => {
  const dark = theme === "dark";

  return (
    <div className="flex flex-col h-full min-h-0 lg:col-span-1">
      {/* Panel header */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-2xl border-b
        ${dark ? "bg-white/4 border-white/8" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <GitCompare size={14} className={dark ? "text-amber-400" : "text-amber-500"} />
          <span className={`text-xs font-semibold uppercase tracking-wider
            ${dark ? "text-white/50" : "text-slate-500"}`}>
            Compare
          </span>
        </div>
        <button onClick={onCopy} title="Copy"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
            ${dark ? "hover:bg-white/10 text-white/40 hover:text-white/80" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`}>
          <Copy size={12} /> Copy
        </button>
      </div>

      <div className={`relative flex-1 rounded-b-2xl border border-t-0 overflow-hidden
        ${dark ? "bg-[#0d0d0d] border-white/8" : "bg-white border-slate-200"}`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`json-textarea custom-scrollbar
            ${dark ? "text-slate-200 placeholder:text-white/15 caret-amber-400"
                    : "text-slate-800 placeholder:text-slate-300 caret-amber-500"}`}
          placeholder="Paste second JSON here to compare…"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default ComparePanel;
