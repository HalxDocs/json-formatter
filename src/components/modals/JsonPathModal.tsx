import { useState, useMemo } from "react";
import { X, Search, Copy, ChevronRight } from "lucide-react";
import { queryJsonPath, type PathResult } from "../../utils/json/jsonPath";
import { safeParse } from "../../utils/json/safeParse";
import { notify } from "../../utils/notify";
import type { Theme } from "../../types";

const EXAMPLES = [
  { label: "All values",        expr: "$.*" },
  { label: "Nested key",        expr: "$.store.book[*].title" },
  { label: "First item",        expr: "$[0]" },
  { label: "Recursive search",  expr: "$..name" },
  { label: "Slice",             expr: "$[0:3]" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  inputJson: string;
}

const JsonPathModal = ({ open, onClose, theme, inputJson }: Props) => {
  const [expression, setExpression] = useState("$.*");
  const dark = theme === "dark";

  const parsed = useMemo(() => safeParse(inputJson), [inputJson]);

  const results: PathResult[] = useMemo(() => {
    if (!parsed || !expression.trim()) return [];
    try {
      return queryJsonPath(parsed, expression.trim());
    } catch {
      return [];
    }
  }, [parsed, expression]);

  const copyResults = () => {
    const out = results.length === 1
      ? JSON.stringify(results[0].value, null, 2)
      : JSON.stringify(results.map(r => r.value), null, 2);
    navigator.clipboard.writeText(out);
    notify({ type: "success", message: "Results copied" });
  };

  if (!open) return null;

  const overlay = dark ? "bg-[#111] border-white/10" : "bg-white border-slate-200";
  const input   = dark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";
  const badge   = dark ? "bg-white/6 text-white/40" : "bg-slate-100 text-slate-500";
  const result  = dark ? "bg-white/4 border-white/8 hover:bg-white/7" : "bg-slate-50 border-slate-200 hover:bg-slate-100";
  const pathCls = dark ? "text-blue-400" : "text-blue-600";
  const pre     = dark ? "bg-[#0d0d0d] text-slate-300" : "bg-white text-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] ${overlay}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-white/8" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <Search size={14} className="text-blue-400" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>JSONPath Query</h2>
              <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-slate-500"}`}>Filter &amp; extract values using JSONPath expressions</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition ${dark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}>
            <X size={16} />
          </button>
        </div>

        {/* Expression input */}
        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="relative">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-white/30" : "text-slate-400"}`} />
            <input
              type="text"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="$.users[*].email"
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/40 transition ${input}`}
              spellCheck={false}
            />
          </div>

          {/* Example chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {EXAMPLES.map(ex => (
              <button
                key={ex.expr}
                onClick={() => setExpression(ex.expr)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${badge} hover:ring-1 hover:ring-blue-400/40`}
              >
                {ex.expr}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5 min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${dark ? "text-white/40" : "text-slate-500"}`}>
              {results.length} result{results.length !== 1 ? "s" : ""}
              {!parsed && <span className="ml-1 text-amber-400">— no valid JSON in input</span>}
            </span>
            {results.length > 0 && (
              <button
                onClick={copyResults}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition ${dark ? "hover:bg-white/10 text-white/40 hover:text-white/70" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}
              >
                <Copy size={11} /> Copy all
              </button>
            )}
          </div>

          <div className="space-y-2">
            {results.map((r, i) => (
              <ResultRow key={i} r={r} dark={dark} pathCls={pathCls} result={result} pre={pre} />
            ))}
            {results.length === 0 && !!parsed && expression.trim() && (
              <div className={`text-center py-8 text-sm ${dark ? "text-white/25" : "text-slate-400"}`}>
                No matches for <code className="font-mono">{expression}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function ResultRow({ r, dark, pathCls, result, pre }: {
  r: PathResult; dark: boolean;
  pathCls: string; result: string; pre: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isComplex = r.value != null && typeof r.value === "object";
  const preview = isComplex
    ? JSON.stringify(r.value).slice(0, 80) + (JSON.stringify(r.value).length > 80 ? "…" : "")
    : JSON.stringify(r.value);

  return (
    <div className={`rounded-xl border p-3 transition ${result}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {isComplex && (
            <button onClick={() => setExpanded(v => !v)} className="mt-0.5 shrink-0">
              <ChevronRight size={13} className={`transition-transform ${dark ? "text-white/30" : "text-slate-400"} ${expanded ? "rotate-90" : ""}`} />
            </button>
          )}
          <div className="min-w-0">
            <span className={`text-[11px] font-mono ${pathCls}`}>{r.path}</span>
            {!expanded && (
              <p className={`text-xs font-mono mt-0.5 truncate ${dark ? "text-white/60" : "text-slate-600"}`}>
                {preview}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(r.value, null, 2));
            notify({ type: "success", message: "Value copied" });
          }}
          className={`shrink-0 p-1 rounded transition ${dark ? "hover:bg-white/10 text-white/30 hover:text-white/60" : "hover:bg-slate-200 text-slate-300 hover:text-slate-500"}`}
        >
          <Copy size={12} />
        </button>
      </div>
      {expanded && isComplex && (
        <pre className={`mt-2 p-2 rounded-lg text-xs font-mono overflow-x-auto ${pre}`}>
          {JSON.stringify(r.value, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default JsonPathModal;
