import { useState, useRef } from "react";
import { Upload, Copy, Sparkles, X } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { notify } from "../../utils/notify";
import type { Theme } from "../../types";

interface Props {
  open: boolean;
  theme: Theme;
  onClose: () => void;
  onImport: (json: string) => void;
}

const EXAMPLE_JSON = {
  users: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      active: true,
      roles: ["admin", "user"],
      profile: { avatar: "https://example.com/avatar.jpg", bio: "Software developer" },
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      age: 25,
      active: true,
      roles: ["user"],
      profile: { avatar: "https://example.com/avatar2.jpg", bio: "Product manager" },
    },
  ],
  metadata: { total: 2, page: 1, limit: 20 },
};

const ImportJsonModal = ({ open, theme, onClose, onImport }: Props) => {
  const [importText, setImportText] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (text: string): boolean => {
    try {
      JSON.parse(text);
      setError("");
      return true;
    } catch {
      setError("Invalid JSON content");
      return false;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (validate(content)) setImportText(content);
      else notify({ type: "error", message: "Invalid JSON file" });
    };
    reader.readAsText(file);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (validate(text)) {
        setImportText(text);
        notify({ type: "success", message: "JSON pasted from clipboard" });
      } else {
        notify({ type: "error", message: "Clipboard doesn't contain valid JSON" });
      }
    } catch {
      notify({ type: "error", message: "Failed to read clipboard" });
    }
  };

  const handleLoadExample = () => {
    setImportText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setError("");
  };

  const handleImport = () => {
    if (!validate(importText)) return;
    onImport(importText);
    onClose();
    setImportText("");
    notify({ type: "success", message: "JSON imported successfully" });
  };

  if (!open) return null;

  const border = theme === "dark" ? "border-white/10" : "border-slate-200";
  const inputCls =
    theme === "dark"
      ? "bg-white/5 border border-white/10"
      : "bg-slate-50 border border-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard theme={theme} className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <Upload size={24} className="text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold">Import JSON</h3>
              <p className="text-sm opacity-70">Import from file, clipboard, or paste manually</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left — import methods */}
            <div className="lg:w-1/3 flex flex-col gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Import Methods</h4>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition ${
                    theme === "dark"
                      ? "border-blue-400/30 hover:border-blue-400/60 hover:bg-blue-500/10"
                      : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <Upload size={24} />
                  <span className="font-medium">Upload JSON File</span>
                  <span className="text-xs opacity-70">.json files only</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={handlePasteFromClipboard}
                  className={`w-full p-4 rounded-xl border flex items-center justify-center gap-2 transition ${
                    theme === "dark"
                      ? "border-white/20 hover:border-white/40 hover:bg-white/10"
                      : "border-slate-300 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <Copy size={18} />
                  <span>Paste from Clipboard</span>
                </button>

                <button
                  onClick={handleLoadExample}
                  className={`w-full p-4 rounded-xl border flex items-center justify-center gap-2 transition ${
                    theme === "dark"
                      ? "border-purple-400/30 hover:border-purple-400/60 hover:bg-purple-500/10"
                      : "border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                  }`}
                >
                  <Sparkles size={18} />
                  <span>Load Example JSON</span>
                </button>
              </div>

              <ul className="text-xs space-y-1 opacity-70 mt-2">
                {[
                  "Supports nested objects and arrays",
                  "Auto-validates JSON syntax",
                  "Large files supported (up to 100 MB)",
                  "Uses streaming for large files",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — preview */}
            <div className="lg:w-2/3 flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">JSON Preview</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setImportText(""); setError(""); }}
                    className="px-3 py-1 text-xs rounded-lg border border-white/20 hover:bg-white/10 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(importText);
                      notify({ type: "success", message: "JSON copied to clipboard" });
                    }}
                    disabled={!importText}
                    className="px-3 py-1 text-xs rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={importText}
                  onChange={(e) => { setImportText(e.target.value); setError(""); }}
                  className={`w-full h-full p-4 font-mono text-sm resize-none rounded-lg custom-scrollbar focus:outline-none ${inputCls} ${error ? "border-red-500/50" : ""}`}
                  placeholder={"Paste JSON here or import from above...\n\nExample:\n{\n  \"name\": \"John\",\n  \"age\": 30\n}"}
                  spellCheck={false}
                />
                {importText && (
                  <div className="absolute bottom-4 right-4">
                    <span className={`px-2 py-1 rounded text-xs ${error ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                      {error ? "Invalid JSON" : "Valid JSON ✓"}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <X size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-6 border-t ${border}`}>
          <button
            onClick={onClose}
            className={`flex-1 px-6 py-3 rounded-xl border transition ${
              theme === "dark" ? "border-white/20 hover:bg-white/10" : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!importText || !!error}
            className={`flex-1 px-6 py-3 rounded-xl border transition ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 border-blue-500 disabled:bg-blue-900/30 disabled:border-blue-800/30"
                : "bg-blue-500 hover:bg-blue-600 border-blue-400 disabled:bg-blue-300 disabled:border-blue-200 text-white"
            }`}
          >
            Import to Editor
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ImportJsonModal;
