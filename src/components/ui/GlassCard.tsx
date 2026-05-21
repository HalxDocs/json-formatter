import type { Theme } from "../../types";

interface Props {
  children: React.ReactNode;
  theme: Theme;
  active?: boolean;
  className?: string;
}

const GlassCard = ({ children, active, theme, className = "" }: Props) => {
  const dark = theme === "dark";

  const base = dark
    ? active
      ? "bg-blue-500/8 border-blue-400/25 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_4px_24px_rgba(0,0,0,0.4)]"
      : "bg-[#111]/80 border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    : active
      ? "bg-blue-50/80 border-blue-300/60 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_4px_16px_rgba(0,0,0,0.06)]"
      : "bg-white/80 border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl";

  return (
    <div className={`rounded-2xl border transition-all duration-200 ${base} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
