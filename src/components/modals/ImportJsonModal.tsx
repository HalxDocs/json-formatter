import { useState, useRef } from "react";
import { Upload, Copy, Sparkles, X, Table } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { notify } from "../../utils/notify";
import { csvToJson } from "../../utils/convert/toJson/csvToJson";
import type { Theme } from "../../types";

interface Props {
  open: boolean;
  theme: Theme;
  onClose: () => void;
  onImport: (json: string) => void;
}

const EXAMPLE_JSON = {
  users: [
    { id: 1, name: "John Doe",   email: "john@example.com", age: 30, active: true,  roles: ["admin", "user"] },
    { id: 2, name: "Jane Smith", email: "jane@example.com", age: 25, active: false, roles: ["user"]          },
  ],
  metadata: { total: 2, page: 1, limit: 20 },
};

const EXAMPLE_CSV = `id,name,email,age,active
1,John Doe,john@example.com,30,true
2,Jane Smith,jane@example.com,25,false
3,Bob Wilson,bob@example.com,35,true`;

type Tab = "json" | "csv";

const ImportJsonModal = ({ open, theme, onClose, onImport }: Props) => {
  const [tab, setTab] = useState<Tab>("json");

  // JSON tab
  const [importText, setImportText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV tab
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown>[]>([]);
  const [csvError, setCsvError] = useState("");

  const dark = theme === "dark";

  const validateJson = (text: string): boolean => {
    try { JSON.parse(text); setJsonError(""); return true; }
    catch { setJsonError("Invalid JSON"); return false; }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (file.name.endsWith(".csv")) {
        setTab("csv");
        handleCsvChange(content);
      } else {
        if (validateJson(content)) setImportText(content);
        else notify({ type: "error", message: "Invalid JSON file" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCsvChange = (text: string) => {
    setCsvText(text);
    setCsvError("");
    if (!text.trim()) { setCsvPreview([]); return; }
    try {
      const rows = csvToJson(text);
      setCsvPreview(rows);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : "CSV parse error");
      setCsvPreview([]);
    }
  };

  const handleImport = () => {
    if (tab === "json") {
      if (!validateJson(importText)) return;
      onImport(importText);
    } else {
      if (csvPreview.length === 0) return;
      onImport(JSON.stringify(csvPreview, null, 2));
    }
    onClose();
    setImportText(""); setCsvText(""); setCsvPreview([]);
    notify({ type: "success", message: `${tab === "csv" ? "CSV converted and imported" : "JSON imported"} successfully` });
  };

  if (!open) return null;

  const border  = dark ? "border-white/10" : "border-slate-200";
  const inputCls = dark ? "bg-white/5 border border-white/10 text-white" : "bg-slate-50 border border-slate-300 text-slate-900";
  const tabBase  = dark ? "text-white/40 hover:text-white/70" : "text-slate-500 hover:text-slate-700";
  const tabActive = dark ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-600 border-b-2 border-blue-500";

  const headers = csvPreview.length > 0 ? Object.keys(csvPreview[0]) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard theme={theme} className="max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className={`flex justify-between items-center p-5 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <Upload size={20} className="text-blue-400" />
            <div>
              <h3 className="text-base font-semibold">Import Data</h3>
              <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-slate-500"}`}>JSON file, clipboard, or CSV spreadsheet</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition ${dark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b px-5 ${border}`}>
          {(["json", "csv"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium uppercase tracking-wide transition ${tab === t ? tabActive : tabBase}`}
            >
              {t === "csv" ? "CSV → JSON" : "JSON"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 min-h-0">
          {tab === "json" ? (
            <div className="flex flex-col gap-4 h-full">
              {/* Quick actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition
                    ${dark ? "border-blue-400/30 hover:bg-blue-500/10 text-blue-400" : "border-blue-300 hover:bg-blue-50 text-blue-600"}`}
                >
                  <Upload size={14} /> Upload .json / .csv
                </button>
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (validateJson(text)) { setImportText(text); notify({ type: "success", message: "Pasted from clipboard" }); }
                    } catch { notify({ type: "error", message: "Clipboard read failed" }); }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition
                    ${dark ? "border-white/10 hover:bg-white/10 text-white/50 hover:text-white/80" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}
                >
                  <Copy size={14} /> Paste Clipboard
                </button>
                <button
                  onClick={() => { setImportText(JSON.stringify(EXAMPLE_JSON, null, 2)); setJsonError(""); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition
                    ${dark ? "border-purple-400/30 hover:bg-purple-500/10 text-purple-400" : "border-purple-300 hover:bg-purple-50 text-purple-600"}`}
                >
                  <Sparkles size={14} /> Load Example
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept=".json,.csv,application/json,text/csv" onChange={handleFileUpload} className="hidden" />

              <div className="relative flex-1 min-h-[240px]">
                <textarea
                  value={importText}
                  onChange={e => { setImportText(e.target.value); setJsonError(""); }}
                  className={`json-textarea custom-scrollbar rounded-xl ${inputCls} ${jsonError ? "border-red-500/50" : ""}`}
                  style={{ height: "100%", resize: "none" }}
                  placeholder={"Paste JSON here…\n\n{\n  \"example\": true\n}"}
                  spellCheck={false}
                />
                {importText && (
                  <div className="absolute bottom-3 right-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${jsonError ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {jsonError ? "Invalid JSON" : "Valid JSON ✓"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition
                    ${dark ? "border-emerald-400/30 hover:bg-emerald-500/10 text-emerald-400" : "border-emerald-300 hover:bg-emerald-50 text-emerald-600"}`}
                >
                  <Table size={14} /> Upload .csv
                </button>
                <button
                  onClick={() => { setCsvText(EXAMPLE_CSV); handleCsvChange(EXAMPLE_CSV); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition
                    ${dark ? "border-purple-400/30 hover:bg-purple-500/10 text-purple-400" : "border-purple-300 hover:bg-purple-50 text-purple-600"}`}
                >
                  <Sparkles size={14} /> Load Example CSV
                </button>
              </div>

              <textarea
                value={csvText}
                onChange={e => handleCsvChange(e.target.value)}
                className={`w-full rounded-xl p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 custom-scrollbar ${inputCls}`}
                rows={5}
                placeholder={"id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com"}
                spellCheck={false}
              />

              {csvError && (
                <p className="text-xs text-red-400">{csvError}</p>
              )}

              {csvPreview.length > 0 && (
                <div>
                  <p className={`text-xs mb-2 ${dark ? "text-white/40" : "text-slate-500"}`}>
                    Preview — {csvPreview.length} row{csvPreview.length !== 1 ? "s" : ""}, {headers.length} column{headers.length !== 1 ? "s" : ""}
                  </p>
                  <div className="overflow-x-auto rounded-xl border custom-scrollbar" style={{ maxHeight: 220 }}>
                    <table className={`w-full text-xs border-collapse ${dark ? "border-white/10" : "border-slate-200"}`}>
                      <thead>
                        <tr className={dark ? "bg-white/5" : "bg-slate-50"}>
                          {headers.map(h => (
                            <th key={h} className={`px-3 py-2 text-left font-semibold border-b whitespace-nowrap ${dark ? "border-white/10 text-white/60" : "border-slate-200 text-slate-600"}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 8).map((row, i) => (
                          <tr key={i} className={dark ? "border-b border-white/5" : "border-b border-slate-100"}>
                            {headers.map(h => (
                              <td key={h} className={`px-3 py-1.5 font-mono whitespace-nowrap ${dark ? "text-white/50" : "text-slate-500"}`}>
                                {String(row[h] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvPreview.length > 8 && (
                      <p className={`px-3 py-2 text-xs ${dark ? "text-white/25" : "text-slate-400"}`}>
                        …and {csvPreview.length - 8} more rows
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-5 border-t ${border}`}>
          <button
            onClick={onClose}
            className={`flex-1 px-5 py-2.5 rounded-xl border text-sm transition ${dark ? "border-white/15 hover:bg-white/8 text-white/60" : "border-slate-200 hover:bg-slate-100 text-slate-600"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={tab === "json" ? (!importText || !!jsonError) : csvPreview.length === 0}
            className="flex-1 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tab === "csv" ? `Import ${csvPreview.length} rows as JSON` : "Import to Editor"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ImportJsonModal;
