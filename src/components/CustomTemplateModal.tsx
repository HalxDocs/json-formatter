// components/CustomTemplateModal.tsx

import React from "react";
import { X, FileCode } from "lucide-react";

interface Props {
  theme: string;
  open: boolean;
  template: string;
  setTemplate: (val: string) => void;
  onGenerate: () => void;
  onClose: () => void;
}

const CustomTemplateModal: React.FC<Props> = ({
  theme,
  open,
  template,
  setTemplate,
  onGenerate,
  onClose,
}) => {
  if (!open) return null;

  const base =
    theme === "dark"
      ? "bg-[#1c1c1e]/80 border-white/10"
      : "bg-white/90 border-slate-200";

  const headerBase =
    theme === "dark"
      ? "border-white/10 bg-white/5"
      : "border-slate-200 bg-white/50";

  const inputBase =
    theme === "dark"
      ? "bg-black/20 border-white/10 text-white placeholder-white/20 focus:bg-black/40"
      : "bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[20px] animate-in fade-in"
        onClick={onClose}
      />

      <div
        className={`
          relative w-full max-w-md border backdrop-blur-2xl rounded-[32px]
          shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300
          ${base}
        `}
      >
        {/* HEADER */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${headerBase}`}
        >
          <div className="flex items-center gap-2">
            <FileCode
              size={18}
              className={theme === "dark" ? "text-blue-400" : "text-blue-600"}
            />
            <h2
              className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Custom Template
            </h2>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              theme === "dark"
                ? "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-600"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label
              className={`text-xs uppercase tracking-wider ml-2 font-medium ${
                theme === "dark" ? "text-white/40" : "text-slate-500"
              }`}
            >
              Template Format
            </label>

            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Book: {{book}}\nChapter: {{chapter}}\nVerse: {{verse}}\n\n{{text}}"
              className={`
                w-full h-48 px-5 py-4 rounded-2xl border focus:outline-none transition-all resize-none
                font-mono text-sm leading-relaxed
                ${inputBase}
              `}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-0">
          <button
            onClick={onGenerate}
            className={`
              w-full py-4 rounded-2xl text-white font-semibold shadow-lg
              active:scale-[0.98] transition-all flex items-center justify-center gap-2
              bg-blue-600 hover:bg-blue-500 shadow-blue-600/20
            `}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTemplateModal;
