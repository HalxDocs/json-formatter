import { AlertTriangle, Zap } from "lucide-react";
import type { Theme } from "../../types";

interface Props {
  theme: Theme;
  onDismiss: () => void;
  onEnablePerformanceMode: () => void;
}

const PerformanceWarningBanner = ({ theme, onDismiss, onEnablePerformanceMode }: Props) => (
  <div
    className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-96 rounded-xl border p-4 shadow-xl backdrop-blur-sm transition-all ${
      theme === "dark"
        ? "bg-yellow-900/30 border-yellow-700 text-yellow-200"
        : "bg-yellow-50 border-yellow-200 text-yellow-800"
    }`}
  >
    <div className="flex items-start gap-3">
      <AlertTriangle size={24} className="text-yellow-500 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm">Large JSON Detected</h4>
          <button onClick={onDismiss} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
        <p className="text-sm opacity-90 mb-3">
          You're working with a large JSON file. Enable Performance Mode for a smoother experience.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onEnablePerformanceMode}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg border transition ${
              theme === "dark"
                ? "bg-yellow-600 hover:bg-yellow-700 border-yellow-500"
                : "bg-yellow-500 hover:bg-yellow-600 border-yellow-400 text-white"
            }`}
          >
            <Zap size={14} />
            Enable Performance Mode
          </button>
          <button
            onClick={onDismiss}
            className={`px-3 py-1 text-sm rounded-lg border transition ${
              theme === "dark"
                ? "border-white/20 hover:bg-white/10"
                : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PerformanceWarningBanner;
