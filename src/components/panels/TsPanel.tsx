import { FileType, Copy, Download } from "lucide-react";
import VirtualizedJsonViewer from "../VirtualizedJsonViewer";
import type { Theme } from "../../types";

const VIRTUALIZE_THRESHOLD = 100_000;

interface Props {
  theme: Theme;
  tsOutput: string;
  performanceMode: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

const TsPanel = ({ theme, tsOutput, performanceMode, onCopy, onDownload }: Props) => {
  const dark = theme === "dark";
  const useVirtualized = performanceMode || tsOutput.length > VIRTUALIZE_THRESHOLD;

  return (
    <div className={`rounded-2xl border overflow-hidden
      ${dark ? "bg-[#0d0d0d] border-white/8" : "bg-white border-slate-200"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b
        ${dark ? "bg-white/4 border-white/8" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <FileType size={14} className="text-blue-400" />
          <span className={`text-xs font-semibold uppercase tracking-wider
            ${dark ? "text-white/50" : "text-slate-500"}`}>
            TypeScript
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono
            ${dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
            types.d.ts
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCopy} title="Copy TypeScript"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
              ${dark ? "hover:bg-white/10 text-white/40 hover:text-white/80" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`}>
            <Copy size={12} /> Copy
          </button>
          <button onClick={onDownload} title="Download .d.ts"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${dark ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
            <Download size={12} /> Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-72 overflow-auto custom-scrollbar">
        {useVirtualized ? (
          <VirtualizedJsonViewer jsonString={tsOutput} theme={theme} height={288} />
        ) : (
          <pre className={`p-5 font-mono text-xs leading-relaxed
            ${dark ? "text-slate-300" : "text-slate-700"}`}>
            {tsOutput}
          </pre>
        )}
      </div>
    </div>
  );
};

export default TsPanel;
