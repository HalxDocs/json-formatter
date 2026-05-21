import { Copy, GitCompare } from "lucide-react";
import VirtualizedJsonViewer from "../VirtualizedJsonViewer";
import type { Theme } from "../../types";

const VIRTUALIZE_THRESHOLD = 100_000;

interface Props {
  theme: Theme;
  diff: string;
  performanceMode: boolean;
  onCopy: () => void;
}

const DiffPanel = ({ theme, diff, performanceMode, onCopy }: Props) => {
  const dark = theme === "dark";
  const useVirtualized = performanceMode || diff.length > VIRTUALIZE_THRESHOLD;

  return (
    <div className={`rounded-2xl border overflow-hidden
      ${dark ? "bg-[#0d0d0d] border-white/8" : "bg-white border-slate-200"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b
        ${dark ? "bg-white/4 border-white/8" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <GitCompare size={14} className={dark ? "text-amber-400" : "text-amber-500"} />
          <span className={`text-xs font-semibold uppercase tracking-wider
            ${dark ? "text-white/50" : "text-slate-500"}`}>
            Diff Output
          </span>
        </div>
        <button onClick={onCopy} title="Copy diff"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
            ${dark ? "hover:bg-white/10 text-white/40 hover:text-white/80" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`}>
          <Copy size={12} /> Copy
        </button>
      </div>

      {/* Content */}
      <div className="max-h-72 overflow-auto custom-scrollbar">
        {useVirtualized ? (
          <VirtualizedJsonViewer jsonString={diff} theme={theme} height={288} />
        ) : (
          <pre className={`p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap
            ${dark ? "text-slate-300" : "text-slate-700"}`}>
            {diff.split("\n").map((line, i) => (
              <span key={i} className={`block ${
                line.startsWith("+") ? dark ? "text-emerald-400 bg-emerald-500/8" : "text-emerald-700 bg-emerald-50"
                : line.startsWith("-") ? dark ? "text-red-400 bg-red-500/8" : "text-red-700 bg-red-50"
                : ""
              }`}>
                {line || " "}
              </span>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
};

export default DiffPanel;
