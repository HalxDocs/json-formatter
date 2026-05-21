import { useState, useMemo } from "react";
import { X, KeyRound, ChevronRight, Copy, ShieldCheck } from "lucide-react";
import { findDecodableValues, type DecodedEntry } from "../../utils/json/decodeValues";
import { safeParse } from "../../utils/json/safeParse";
import { notify } from "../../utils/notify";
import type { Theme } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  inputJson: string;
}

const DecoderModal = ({ open, onClose, theme, inputJson }: Props) => {
  const dark = theme === "dark";

  const parsed = useMemo(() => safeParse(inputJson), [inputJson]);
  const entries: DecodedEntry[] = useMemo(
    () => (parsed ? findDecodableValues(parsed) : []),
    [parsed]
  );

  if (!open) return null;

  const overlay = dark ? "bg-[#111] border-white/10" : "bg-white border-slate-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] ${overlay}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-white/8" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <KeyRound size={14} className="text-violet-400" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Base64 / JWT Decoder</h2>
              <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-slate-500"}`}>Auto-detects encoded values inside your JSON</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition ${dark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-3 min-h-0">
          {!parsed ? (
            <p className={`text-sm text-center py-8 ${dark ? "text-white/30" : "text-slate-400"}`}>
              No valid JSON in input panel
            </p>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <ShieldCheck size={28} className={dark ? "text-white/15" : "text-slate-300"} />
              <p className={`text-sm ${dark ? "text-white/30" : "text-slate-400"}`}>
                No Base64 or JWT values detected
              </p>
            </div>
          ) : (
            entries.map((entry, i) => <EntryCard key={i} entry={entry} dark={dark} />)
          )}
        </div>

        <div className={`px-5 py-3 border-t text-xs ${dark ? "border-white/8 text-white/25" : "border-slate-100 text-slate-400"}`}>
          {entries.length} encoded value{entries.length !== 1 ? "s" : ""} found
        </div>
      </div>
    </div>
  );
};

function EntryCard({ entry, dark }: { entry: DecodedEntry; dark: boolean }) {
  const [open, setOpen] = useState(false);

  const typePill = entry.type === "jwt"
    ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
    : "bg-blue-500/15 text-blue-400 border border-blue-400/20";

  const card    = dark ? "bg-white/4 border-white/8" : "bg-slate-50 border-slate-200";
  const pre     = dark ? "bg-[#0d0d0d] text-slate-300" : "bg-white text-slate-700";
  const pathCls = dark ? "text-blue-400" : "text-blue-600";

  return (
    <div className={`rounded-xl border p-3 ${card}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${typePill}`}>
              {entry.type === "jwt" ? "JWT" : "Base64"}
            </span>
            <span className={`text-[11px] font-mono truncate ${pathCls}`}>{entry.path}</span>
          </div>
          <p className={`text-xs font-mono truncate ${dark ? "text-white/40" : "text-slate-500"}`}>
            {entry.original}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText(entry.decoded);
              notify({ type: "success", message: "Decoded value copied" });
            }}
            className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-white/10 text-white/30 hover:text-white/60" : "hover:bg-slate-200 text-slate-300 hover:text-slate-600"}`}
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => setOpen(v => !v)}
            className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-white/10 text-white/30 hover:text-white/60" : "hover:bg-slate-200 text-slate-300 hover:text-slate-600"}`}
          >
            <ChevronRight size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <pre className={`mt-2 p-3 rounded-xl text-xs font-mono overflow-x-auto ${pre}`}>
          {entry.decoded}
        </pre>
      )}
    </div>
  );
}

export default DecoderModal;
