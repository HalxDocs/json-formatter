import { Menu, X } from "lucide-react";
import type { Theme, ActionItem } from "../../types";

interface Props {
  theme: Theme;
  isOpen: boolean;
  actions: ActionItem[];
  onOpen: () => void;
  onClose: () => void;
}

// Group labels for the action grid
const GROUPS: { label: string; keys: string[] }[] = [
  { label: "Format",  keys: ["Import", "Format", "Minify", "Fix JSON"] },
  { label: "Convert", keys: ["TypeScript", "YAML", "CSV", "CSV→JSON", "XML", "SQL", "TOML", "INI", "Markdown", "Excel"] },
  { label: "Tools",   keys: ["Diff", "Query", "Decode", "Sort Keys", "No Nulls", "Schema", "Tree", "Structure"] },
  { label: "Other",   keys: ["Snapshot", "Suggest"] },
];

const ICON_COLOR: Record<string, string> = {
  Import: "text-blue-400", Format: "text-blue-400", Minify: "text-slate-400",
  "Fix JSON": "text-purple-400", TypeScript: "text-blue-400", YAML: "text-green-400",
  CSV: "text-emerald-400", "CSV→JSON": "text-cyan-400", XML: "text-orange-400",
  SQL: "text-cyan-500", TOML: "text-pink-400", INI: "text-rose-400",
  Markdown: "text-indigo-400", Excel: "text-green-500",
  Diff: "text-amber-400", Query: "text-blue-400", Decode: "text-violet-400",
  "Sort Keys": "text-sky-400", "No Nulls": "text-red-400",
  Schema: "text-violet-400", Tree: "text-teal-400", Structure: "text-sky-400",
  Snapshot: "text-slate-400", Suggest: "text-yellow-400",
};

const MobileDock = ({ theme, isOpen, actions, onOpen, onClose }: Props) => {
  const actionMap = Object.fromEntries(actions.map((a) => [a.label, a]));
  const dark = theme === "dark";

  return (
    <>
      {/* FAB */}
      <button
        onClick={onOpen}
        className={`sm:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl
          shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all active:scale-95
          ${dark
            ? "bg-[#1a1a1a] border border-white/15 text-white"
            : "bg-white border border-slate-200 text-slate-900 shadow-slate-300/50"
          }`}
      >
        <Menu size={18} />
        <span className="text-sm font-semibold">Actions</span>
      </button>

      {/* Bottom sheet */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <div
            className={`animate-slide-up absolute bottom-0 left-0 right-0 rounded-t-3xl max-h-[82vh] flex flex-col
              ${dark ? "bg-[#111] border-t border-white/10" : "bg-white border-t border-slate-200"}`}
          >
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-10 h-1 rounded-full bg-white/20" />
              <span className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
                JSON Actions
              </span>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto custom-scrollbar pb-8 px-4 space-y-5">
              {GROUPS.map((group) => {
                const items = group.keys.map((k) => actionMap[k]).filter(Boolean);
                if (!items.length) return null;
                return (
                  <div key={group.label}>
                    <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 px-1
                      ${dark ? "text-white/30" : "text-slate-400"}`}>
                      {group.label}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {items.map((action) => {
                        const colorCls = ICON_COLOR[action.label] ?? "text-slate-400";
                        return (
                          <button
                            key={action.label}
                            onClick={() => { action.onClick(); onClose(); }}
                            className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border transition-all active:scale-95
                              ${dark
                                ? "bg-white/5 border-white/8 hover:bg-white/10 hover:border-white/15"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                              }`}
                          >
                            <action.icon size={18} className={colorCls} />
                            <span className={`text-[11px] font-medium text-center leading-tight
                              ${dark ? "text-white/70" : "text-slate-600"}`}>
                              {action.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileDock;
