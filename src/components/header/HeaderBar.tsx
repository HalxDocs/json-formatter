import { Sun, Moon, Star, Zap, Braces } from "lucide-react";
import type { Theme } from "../../types";

interface Props {
  theme: Theme;
  performanceMode: boolean;
  isLargeFile: boolean;
  estimatedLines: number;
  estimatedSizeMB: number;
  onToggleTheme: () => void;
  onTogglePerformanceMode: () => void;
}

const HeaderBar = ({
  theme, performanceMode, isLargeFile, estimatedLines, estimatedSizeMB,
  onToggleTheme, onTogglePerformanceMode,
}: Props) => {
  const dark = theme === "dark";

  return (
    <header className="flex items-center justify-between gap-3">
      {/* ── Brand ─────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-xl shrink-0
          ${dark ? "bg-blue-500/15 border border-blue-500/25" : "bg-blue-50 border border-blue-200"}`}>
          <Braces size={18} className="text-blue-400" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className={`text-lg sm:text-xl font-bold tracking-tight leading-none
              ${dark ? "text-white" : "text-slate-900"}`}>
              JSON Toolkit
            </h1>
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md
              ${dark ? "bg-white/8 text-white/40" : "bg-slate-100 text-slate-400"}`}>
              v3.1
            </span>
            {performanceMode && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
                bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <Zap size={10} />
                Performance
              </span>
            )}
          </div>

          {isLargeFile && (
            <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-slate-400"}`}>
              ~{estimatedLines.toLocaleString()} lines · {estimatedSizeMB.toFixed(1)} MB
            </p>
          )}
        </div>
      </div>

      {/* ── Controls ──────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Perf mode toggle — only when a large file is loaded */}
        {isLargeFile && (
          <button
            onClick={onTogglePerformanceMode}
            title="Toggle Performance Mode (Ctrl+Shift+P)"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all
              ${performanceMode
                ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                : dark
                ? "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
              }`}
          >
            <Zap size={13} className={performanceMode ? "text-amber-400" : ""} />
            <span className="hidden md:inline">{performanceMode ? "Perf On" : "Perf Mode"}</span>
          </button>
        )}

        {/* GitHub */}
        <a
          href="https://github.com/HalxDocs/json-formatter"
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium
            transition-all hover:scale-[1.03] active:scale-95
            ${dark
              ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
        >
          <Star size={13} className="text-amber-400" />
          <span>Star</span>
        </a>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all
            hover:scale-105 active:scale-95
            ${dark
              ? "bg-white/8 border-white/12 text-white/70 hover:bg-white/14"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            }`}
        >
          {dark
            ? <Sun size={16} className="text-amber-300" />
            : <Moon size={16} className="text-slate-700" />
          }
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
