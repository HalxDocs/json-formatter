import type { Theme } from "../../types";

interface Props {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  theme: Theme;
  primary?: boolean;
  active?: boolean;
  disabled?: boolean;
}

const ActionButton = ({ onClick, icon: Icon, label, theme, primary, active, disabled }: Props) => {
  const dark = theme === "dark";

  const cls = dark
    ? active
      ? "bg-blue-500/25 border-blue-400/50 text-blue-200"
      : primary
      ? "bg-blue-500/15 border-blue-400/30 text-blue-300 hover:bg-blue-500/25"
      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90"
    : active
    ? "bg-blue-100 border-blue-400 text-blue-700"
    : primary
    ? "bg-blue-500/10 border-blue-300 text-blue-600 hover:bg-blue-100"
    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 py-2
        rounded-xl border text-sm transition-all duration-150 whitespace-nowrap
        active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
        ${cls}`}
    >
      <Icon size={16} className="opacity-90 shrink-0" />
      <span className="text-[11px] sm:text-xs font-medium">{label}</span>
    </button>
  );
};

export default ActionButton;
