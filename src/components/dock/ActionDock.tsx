import {
  FileJson, Minimize2, FileType, Table, Code, Database,
  Layers, TreePine, Sparkles, Camera, Upload,
  Download, Zap, GitCompare,
} from "lucide-react";


interface DockHandlers {
  onImport: () => void;
  onFormat: () => void;
  onMinify: () => void;
  onFix: () => void;
  onTypeScript: () => void;
  onYaml: () => void;
  onCsv: () => void;
  onXml: () => void;
  onToml: () => void;
  onIni: () => void;
  onMarkdown: () => void;
  onExcel: () => void;
  onSql: () => void;
  onDiff: () => void;
  onStructure: () => void;
  onSchema: () => void;
  onTree: () => void;
  onSuggest: () => void;
  onSnapshot: () => void;
  onTogglePerformanceMode: () => void;
}

interface Props extends DockHandlers {
  compareMode: boolean;
  showStructureMenu: boolean;
  showTreeViewer: boolean;
  showSqlModal: boolean;
  showImportModal: boolean;
  performanceMode: boolean;
  isLargeFile: boolean;
}

interface DockBtnProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  primary?: boolean;
  accent?: "blue" | "purple" | "green" | "amber";
}

const ACCENT = {
  blue:   { btn: "text-blue-300 border-blue-500/40 bg-blue-500/15 hover:bg-blue-500/25",   active: "bg-blue-500/30 border-blue-400/60 text-blue-200" },
  purple: { btn: "text-purple-300 border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25", active: "bg-purple-500/30 border-purple-400/60 text-purple-200" },
  green:  { btn: "text-emerald-300 border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25", active: "bg-emerald-500/30 border-emerald-400/60 text-emerald-200" },
  amber:  { btn: "text-amber-300 border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25", active: "bg-amber-500/30 border-amber-400/60 text-amber-200" },
};

const DockBtn = ({ icon: Icon, label, onClick, active, accent = "blue" }: DockBtnProps) => {
  const { active: activeCls } = ACCENT[accent];
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl border
        text-white/60 border-white/8 bg-white/4
        transition-all duration-150 hover:text-white hover:bg-white/10 hover:border-white/20
        active:scale-95 cursor-pointer select-none
        ${active ? activeCls : ""}
      `}
    >
      <Icon size={16} />
      <span className="text-[10px] font-medium leading-none">{label}</span>
      {active && (
        <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
          accent === "blue" ? "bg-blue-400" :
          accent === "purple" ? "bg-purple-400" :
          accent === "green" ? "bg-emerald-400" : "bg-amber-400"
        }`} />
      )}
    </button>
  );
};

const Divider = () => (
  <div className="w-px h-8 bg-white/10 self-center mx-0.5" />
);

const GroupLabel = ({ children }: { children: string }) => (
  <span className="text-[9px] uppercase tracking-widest text-white/20 self-center px-1 select-none">
    {children}
  </span>
);

const ActionDock = ({
  compareMode, showStructureMenu, showTreeViewer,
  showSqlModal, showImportModal, performanceMode, isLargeFile,
  onImport, onFormat, onMinify, onFix,
  onTypeScript, onYaml, onCsv, onXml, onToml, onIni, onMarkdown, onExcel, onSql,
  onDiff, onStructure, onSchema, onTree,
  onSuggest, onSnapshot, onTogglePerformanceMode,
}: Props) => (
  <div className="hidden sm:flex fixed bottom-0 left-0 right-0 z-30 justify-center pb-4 px-4 pointer-events-none">
    <div
      className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-2xl border border-white/10 bg-[#111111]/85 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
      style={{ maxWidth: "calc(100vw - 2rem)" }}
    >
      {/* ── Import ───────────────── */}
      <DockBtn onClick={onImport} icon={Upload} label="Import" active={showImportModal} />

      <Divider />

      {/* ── Core transforms ──────── */}
      <GroupLabel>Format</GroupLabel>
      <DockBtn onClick={onFormat}  icon={FileJson}  label="Format"   primary accent="blue" />
      <DockBtn onClick={onMinify}  icon={Minimize2} label="Minify"   />
      <DockBtn onClick={onFix}     icon={Sparkles}  label="Fix"      />

      <Divider />

      {/* ── Conversions ──────────── */}
      <GroupLabel>Convert</GroupLabel>
      <DockBtn onClick={onTypeScript} icon={FileType}      label="TS"       accent="purple" />
      <DockBtn onClick={onYaml}       icon={Code}          label="YAML"     />
      <DockBtn onClick={onCsv}        icon={Table}         label="CSV"      />
      <DockBtn onClick={onXml}        icon={Code}          label="XML"      />
      <DockBtn onClick={onSql}        icon={Database}      label="SQL"      active={showSqlModal} accent="green" />
      <DockBtn onClick={onToml}       icon={Code}          label="TOML"     />
      <DockBtn onClick={onIni}        icon={Code}          label="INI"      />
      <DockBtn onClick={onMarkdown}   icon={Table}         label="MD"       />
      <DockBtn onClick={onExcel}      icon={Download}      label="Excel"    />

      <Divider />

      {/* ── Analysis tools ───────── */}
      <GroupLabel>Tools</GroupLabel>
      <DockBtn onClick={onDiff}      icon={GitCompare} label="Diff"      active={compareMode}      accent="amber" />
      <DockBtn onClick={onSchema}    icon={Code}       label="Schema"    />
      <DockBtn onClick={onTree}      icon={TreePine}   label="Tree"      active={showTreeViewer}   accent="green" />
      <DockBtn onClick={onStructure} icon={Layers}     label="Structure" active={showStructureMenu} />

      <Divider />

      {/* ── Misc ─────────────────── */}
      <DockBtn onClick={onSnapshot} icon={Camera}   label="Snap"    />
      <DockBtn onClick={onSuggest}  icon={Sparkles} label="Suggest" />

      {isLargeFile && (
        <>
          <Divider />
          <DockBtn
            onClick={onTogglePerformanceMode}
            icon={Zap}
            label={performanceMode ? "Perf ✓" : "Perf"}
            active={performanceMode}
            accent="amber"
          />
        </>
      )}
    </div>
  </div>
);

export default ActionDock;
