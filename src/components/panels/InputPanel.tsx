import { Copy, Upload, X, Loader2, FileJson } from "lucide-react";
import type { Theme } from "../../types";

interface Props {
  theme: Theme;
  value: string;
  isLargeFile: boolean;
  isProcessing: boolean;
  onChange: (v: string) => void;
  onCopy: () => void;
  onImport: () => void;
  onClear: () => void;
}

function lineCount(s: string) {
  if (!s) return 0;
  let n = 1;
  for (let i = 0; i < s.length; i++) if (s[i] === "\n") n++;
  return n;
}

const InputPanel = ({
  theme, value, isLargeFile, isProcessing,
  onChange, onCopy, onImport, onClear,
}: Props) => {
  const dark = theme === "dark";
  const lines = lineCount(value);
  const chars = value.length;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string ?? "");
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel header */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-2xl border-b
        ${dark ? "bg-white/4 border-white/8" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <FileJson size={14} className={dark ? "text-blue-400" : "text-blue-500"} />
          <span className={`text-xs font-semibold uppercase tracking-wider
            ${dark ? "text-white/50" : "text-slate-500"}`}>
            Input{isLargeFile ? " · Large File" : ""}
          </span>
          {value && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md
              ${dark ? "bg-white/6 text-white/30" : "bg-slate-200 text-slate-400"}`}>
              {lines.toLocaleString()} lines · {chars > 1024
                ? `${(chars / 1024).toFixed(1)} KB`
                : `${chars} chars`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onCopy} title="Copy"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
              ${dark ? "hover:bg-white/10 text-white/40 hover:text-white/80" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`}>
            <Copy size={12} /> Copy
          </button>
          <button onClick={onImport} title="Import file"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
              ${dark ? "hover:bg-white/10 text-white/40 hover:text-white/80" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`}>
            <Upload size={12} /> Import
          </button>
          {value && (
            <button onClick={onClear} title="Clear"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
                ${dark ? "hover:bg-red-500/15 text-white/40 hover:text-red-400" : "hover:bg-red-50 text-slate-400 hover:text-red-500"}`}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div
        className={`relative flex-1 rounded-b-2xl border border-t-0 overflow-hidden
          ${dark ? "bg-[#0d0d0d] border-white/8" : "bg-white border-slate-200"}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`json-textarea custom-scrollbar
            ${dark ? "text-slate-200 placeholder:text-white/15 caret-blue-400"
                    : "text-slate-800 placeholder:text-slate-300 caret-blue-500"}`}
          placeholder={"Paste JSON here, drop a file, or click Import…\n\n{\n  \"example\": \"paste your JSON here\"\n}"}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Processing overlay */}
        {isLargeFile && isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border
              ${dark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-slate-200"}`}>
              <Loader2 size={18} className="animate-spin text-blue-400" />
              <span className="text-sm font-medium">Processing large file…</span>
            </div>
          </div>
        )}

        {/* Drop cue — only when empty */}
        {!value && !isProcessing && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-4">
            <span className={`text-[10px] ${dark ? "text-white/15" : "text-slate-300"}`}>
              drag &amp; drop supported
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;
