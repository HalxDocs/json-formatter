// components/FeatureRequestModal.tsx

import React from "react";
import { X, Send, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  theme: string;
}

const FeatureRequestModal: React.FC<Props> = ({ open, onClose, theme }) => {
  if (!open) return null;

  const bg =
    theme === "dark"
      ? "bg-[#0f0f0f]/80 border-white/10 text-white"
      : "bg-white/80 border-slate-200 text-slate-900";

  const email = "mailto:kamsyejindu@gmail.com?subject=Feature%20Request%20for%20JSON%20Formatter";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className={`relative w-[90%] max-w-md rounded-3xl backdrop-blur-2xl border shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-6 ${bg}`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            Suggest a New Tool
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* TEXT */}
        <p className="text-sm opacity-80 mb-6 leading-relaxed">
          Have a new tool idea or something you want added?  
          Send your feature request directly — I’m building this project to help developers like you.
        </p>

        {/* BUTTON */}
        <a
          href={email}
          target="_blank"
          rel="noopener noreferrer"
          className="
            w-full text-center flex items-center justify-center gap-2
            py-3 rounded-2xl text-sm font-semibold
            bg-blue-600/80 hover:bg-blue-600
            text-white transition shadow-lg active:scale-95
          "
        >
          Send Feature Request <Send size={16} />
        </a>
      </div>
    </div>
  );
};

export default FeatureRequestModal;
