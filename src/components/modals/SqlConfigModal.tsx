import { Database, X } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import type { Theme, SqlConfig, SqlDialect } from "../../types";

interface Props {
  open: boolean;
  theme: Theme;
  config: SqlConfig;
  onClose: () => void;
  onConfigChange: (c: SqlConfig) => void;
  onGenerate: () => void;
}

const DIALECTS: { value: SqlDialect; label: string }[] = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
];

const SqlConfigModal = ({ open, theme, config, onClose, onConfigChange, onGenerate }: Props) => {
  if (!open) return null;

  const border = theme === "dark" ? "border-white/10" : "border-slate-200";
  const inputCls =
    theme === "dark"
      ? "bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      : "bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard theme={theme} className="max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold">SQL Configuration</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Table name */}
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Table Name</label>
            <input
              type="text"
              value={config.tableName}
              onChange={(e) => onConfigChange({ ...config, tableName: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl font-mono transition-all ${inputCls}`}
              placeholder="e.g. users, products, data"
              autoFocus
            />
            <p className="text-xs opacity-60 mt-2">
              The table name used in INSERT statements
            </p>
          </div>

          {/* Dialect */}
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">SQL Dialect</label>
            <div className="grid grid-cols-3 gap-2">
              {DIALECTS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => onConfigChange({ ...config, dialect: d.value })}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    config.dialect === d.value
                      ? theme === "dark"
                        ? "bg-blue-500/20 border-blue-400 text-blue-200"
                        : "bg-blue-100 border-blue-400 text-blue-700"
                      : theme === "dark"
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-white border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="text-xs opacity-70 mt-1">{d.value}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Options</label>
            <div className="space-y-3">
              {(
                [
                  { key: "includeDrop", label: "Include DROP TABLE IF EXISTS" },
                  { key: "includeCreate", label: "Include CREATE TABLE" },
                  { key: "useBatch", label: "Use batch INSERT (multi-row)" },
                ] as { key: keyof SqlConfig; label: string }[]
              ).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[key] as boolean}
                    onChange={(e) => onConfigChange({ ...config, [key]: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-3 pt-4 border-t ${border}`}>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl border transition ${
                theme === "dark" ? "border-white/20 hover:bg-white/10" : "border-slate-300 hover:bg-slate-100"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => { onGenerate(); onClose(); }}
              className={`flex-1 px-4 py-3 rounded-xl border transition ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-500"
                  : "bg-blue-500 hover:bg-blue-600 border-blue-400 text-white"
              }`}
            >
              Generate SQL
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SqlConfigModal;
