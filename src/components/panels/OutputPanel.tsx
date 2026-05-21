import { Copy, Download, CheckSquare } from "lucide-react";
import VirtualizedJsonViewer from "../VirtualizedJsonViewer";
import type { Theme } from "../../types";

const VIRTUALIZE_THRESHOLD = 100_000;

interface Props {
  theme: Theme;
  value: string;
  isLargeFile: boolean;
  performanceMode: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

function lineCount(s: string) {
  if (!s) return 0;
  let n = 1;
  for (let i = 0; i < s.length; i++) if (s[i] === "\n") n++;
  return n;
}

const OutputPanel = ({ theme, value, isLargeFile, performanceMode, onCopy, onDownload }: Props) => {
  const dark = theme === "dark";
  const useVirtualized = (isLargeFile || performanceMode) && value.length > VIRTUALIZE_THRESHOLD;
  const lines = lineCount(value);

  const btnCls = `flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition active:scale-95
    ${dark ? "hover:bg-white/10 text-white/40 hover:text-white/80" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel header */}
      <div className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl border-b
        ${dark ? "bg-white/4 border-white/8" : "bg-slate-50 border-slate-200"}`}>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <CheckSquare size={13} className={`shrink-0 ${dark ? "text-emerald-400" : "text-emerald-500"}`} />
          <span className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider shrink-0
            ${dark ? "text-white/50" : "text-slate-500"}`}>
            Output{useVirtualized ? " · Virtual" : ""}
          </span>
          {value && (
            <span className={`hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-md shrink-0
              ${dark ? "bg-white/6 text-white/30" : "bg-slate-200 text-slate-400"}`}>
              {lines.toLocaleString()} lines
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button onClick={onCopy} title="Copy output" className={btnCls}>
            <Copy size={12} />
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button onClick={onDownload} title="Download output" className={btnCls}>
            <Download size={12} />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`relative flex-1 rounded-b-2xl border border-t-0 overflow-hidden
        ${dark ? "bg-[#0d0d0d] border-white/8" : "bg-white border-slate-200"}`}>
        {useVirtualized ? (
          <VirtualizedJsonViewer jsonString={value} theme={theme} height={460} />
        ) : (
          <>
            <textarea
              readOnly
              value={value}
              className={`json-textarea custom-scrollbar
                ${dark ? "text-slate-200 placeholder:text-white/15" : "text-slate-800 placeholder:text-slate-300"}`}
              placeholder={"// Results appear here…\n//\n// Use Format, Convert, or any tool\n// from the dock below."}
              spellCheck={false}
            />
            {!value && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className={`text-center ${dark ? "text-white/10" : "text-slate-200"}`}>
                  <CheckSquare size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">output will appear here</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
