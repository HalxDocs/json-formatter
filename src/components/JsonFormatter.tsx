import {
  FileJson, Minimize2, FileType, Table, Code, Database,
  ArrowRightLeft, Layers, TreePine, Sparkles, Camera, Upload, Download,
} from "lucide-react";

import { useJsonState } from "../hooks/useJsonState";
import { buildJsonOperations } from "../hooks/useJsonOperations";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useClipboard } from "../hooks/useClipboard";
import { useFileImport } from "../hooks/useFileImport";
import { useLargeJson } from "../hooks/useLargeJson";

import HeaderBar from "./header/HeaderBar";
import PerformanceWarningBanner from "./layout/PerformanceWarningBanner";
import ProgressIndicator from "./ProgressIndicator";
import FooterBrand from "./FooterBrand";
import Notification from "./Notification";

import InputPanel from "./panels/InputPanel";
import OutputPanel from "./panels/OutputPanel";
import ComparePanel from "./panels/ComparePanel";
import DiffPanel from "./panels/DiffPanel";
import TsPanel from "./panels/TsPanel";

import ActionDock from "./dock/ActionDock";
import MobileDock from "./dock/MobileDock";

import ImportJsonModal from "./modals/ImportJsonModal";
import SqlConfigModal from "./modals/SqlConfigModal";
import StructureMenu from "./StructureMenu";
import CustomTemplateModal from "./CustomTemplateModal";
import TreeViewer from "./tree/TreeViewer";
import FeatureRequestModal from "./FeatureRequestModal";

import type { ActionItem } from "../types";

const PANEL_HEIGHT = "h-[600px] lg:h-[720px]";

const JsonFormatter = () => {
  const state = useJsonState();
  const clipboard = useClipboard();
  const largeJson = useLargeJson({ maxFileSize: 100, enableWorker: true });

  const fileImport = useFileImport({
    largeJson,
    performanceMode: state.performanceMode,
    setInputJson: state.setInputJson,
    setShowPerformanceWarning: state.setShowPerformanceWarning,
  });

  const ops = buildJsonOperations({
    inputJson: state.inputJson,
    compareJson: state.compareJson,
    performanceMode: state.performanceMode,
    sqlConfig: state.sqlConfig,
    templateText: state.templateText,
    executeOperation: largeJson.executeOperation,
    setOutputJson: state.setOutputJson,
    setTsOutput: state.setTsOutput,
    setDiffOutput: state.setDiffOutput,
    setShowTemplateModal: state.setShowTemplateModal,
  });

  useKeyboardShortcuts({
    onFormat: ops.format,
    onMinify: ops.minify,
    onFix: ops.fix,
    onToggleDiff: () => {
      const next = !state.compareMode;
      state.setCompareMode(next);
      if (next && state.compareJson) ops.diff();
    },
    onToggleTree: () => state.setShowTreeViewer(!state.showTreeViewer),
    onDownload: () => ops.downloadOutput(state.outputJson),
    onOpenSql: () => state.setShowSqlModal(true),
    onOpenImport: () => state.setShowImportModal(true),
    onCopyOutput: () => clipboard.copyOutput(state.outputJson),
    onTogglePerformanceMode: () => state.setPerformanceMode(!state.performanceMode),
  });

  const mobileActions: ActionItem[] = [
    { label: "Import",     icon: Upload,        onClick: () => state.setShowImportModal(true) },
    { label: "Format",     icon: FileJson,      onClick: ops.format },
    { label: "Minify",     icon: Minimize2,     onClick: ops.minify },
    { label: "TypeScript", icon: FileType,      onClick: ops.toTypeScript },
    { label: "YAML",       icon: Code,          onClick: ops.toYaml },
    { label: "CSV",        icon: Table,         onClick: ops.toCsv },
    { label: "XML",        icon: Code,          onClick: ops.toXml },
    { label: "TOML",       icon: Code,          onClick: ops.toToml },
    { label: "INI",        icon: Code,          onClick: ops.toIni },
    { label: "Markdown",   icon: Table,         onClick: ops.toMarkdown },
    { label: "Excel",      icon: Download,      onClick: ops.toExcel },
    { label: "SQL",        icon: Database,      onClick: () => state.setShowSqlModal(true) },
    { label: "Diff",       icon: ArrowRightLeft, onClick: () => {
        const next = !state.compareMode;
        state.setCompareMode(next);
        if (next && state.compareJson) ops.diff();
      },
    },
    { label: "Structure",  icon: Layers,        onClick: () => state.setShowStructureMenu(true) },
    { label: "Fix JSON",   icon: Sparkles,      onClick: ops.fix },
    { label: "Schema",     icon: Code,          onClick: ops.toSchema },
    { label: "Tree",       icon: TreePine,      onClick: () => state.setShowTreeViewer(true) },
    { label: "Suggest",    icon: Sparkles,      onClick: () => state.setShowFeatureModal(true) },
    { label: "Snapshot",   icon: Camera,        onClick: () => ops.saveSnapshot(state.inputJson, state.outputJson) },
  ];

  const dark = state.theme === "dark";

  return (
    <div className={`min-h-screen transition-colors duration-200
      ${dark ? "bg-[#080808] text-white" : "bg-[#f5f6f8] text-slate-900"}`}>

      <Notification />

      <ProgressIndicator
        progress={largeJson.processingState.progress}
        status={
          largeJson.processingState.isLoading ? "processing"
          : largeJson.processingState.error    ? "error"
          : largeJson.processingState.progress === 100 ? "success"
          : "idle"
        }
        message={largeJson.processingState.currentOperation ?? undefined}
        currentOperation={largeJson.processingState.currentOperation ?? undefined}
        details={{
          linesProcessed: largeJson.processingState.metadata?.totalLines,
          bytesProcessed:  largeJson.processingState.metadata?.totalBytes,
          estimatedTime:   largeJson.processingState.metadata
            ? Math.ceil(largeJson.processingState.metadata.totalBytes / (1024 * 1024))
            : undefined,
        }}
        theme={state.theme}
        onCancel={largeJson.cancelProcessing}
      />

      {state.showPerformanceWarning && (
        <PerformanceWarningBanner
          theme={state.theme}
          onDismiss={() => state.setShowPerformanceWarning(false)}
          onEnablePerformanceMode={() => {
            state.setPerformanceMode(true);
            state.setShowPerformanceWarning(false);
          }}
        />
      )}

      <input
        ref={fileImport.fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={fileImport.handleFileChange}
        className="hidden"
      />

      {/* ── Page body ──────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-32 space-y-5">

        <HeaderBar
          theme={state.theme}
          performanceMode={state.performanceMode}
          isLargeFile={largeJson.isLargeFile}
          estimatedLines={largeJson.estimatedLines}
          estimatedSizeMB={largeJson.estimatedSizeMB}
          onToggleTheme={() => state.setTheme(dark ? "light" : "dark")}
          onTogglePerformanceMode={() => state.setPerformanceMode(!state.performanceMode)}
        />

        {/* ── Editor grid ──────────────────────────────────────── */}
        <div className={`grid gap-4 ${
          state.compareMode
            ? "grid-cols-1 lg:grid-cols-3"
            : "grid-cols-1 lg:grid-cols-2"
        }`}>
          <div className={PANEL_HEIGHT}>
            <InputPanel
              theme={state.theme}
              value={state.inputJson}
              isLargeFile={largeJson.isLargeFile}
              isProcessing={largeJson.processingState.isLoading}
              onChange={(v) => {
                state.setInputJson(v);
                if (v.length > 5 * 1024 * 1024 && !state.performanceMode)
                  state.setShowPerformanceWarning(true);
              }}
              onCopy={() => clipboard.copyInput(state.inputJson)}
              onImport={fileImport.triggerFilePicker}
              onClear={() => state.setInputJson("")}
            />
          </div>

          <div className={PANEL_HEIGHT}>
            <OutputPanel
              theme={state.theme}
              value={state.outputJson}
              isLargeFile={largeJson.isLargeFile}
              performanceMode={state.performanceMode}
              onCopy={() => clipboard.copyOutput(state.outputJson)}
              onDownload={() => ops.downloadOutput(state.outputJson)}
            />
          </div>

          {state.compareMode && (
            <div className={`${PANEL_HEIGHT} lg:col-span-1`}>
              <ComparePanel
                theme={state.theme}
                value={state.compareJson}
                onChange={state.setCompareJson}
                onCopy={() => clipboard.copyCompare(state.compareJson)}
              />
            </div>
          )}
        </div>

        {/* ── Diff output ──────────────────────────────────────── */}
        {state.compareMode && state.diffOutput && (
          <DiffPanel
            theme={state.theme}
            diff={state.diffOutput}
            performanceMode={state.performanceMode}
            onCopy={() => clipboard.copyDiff(state.diffOutput)}
          />
        )}

        {/* ── TypeScript output ────────────────────────────────── */}
        {state.tsOutput && (
          <TsPanel
            theme={state.theme}
            tsOutput={state.tsOutput}
            performanceMode={state.performanceMode}
            onCopy={() => clipboard.copyTs(state.tsOutput)}
            onDownload={() => ops.downloadTs(state.tsOutput)}
          />
        )}

        <FooterBrand />
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      <StructureMenu
        open={state.showStructureMenu}
        onClose={() => state.setShowStructureMenu(false)}
        theme={state.theme}
        onFlatten={ops.flatten}
        onGroup={ops.group}
        onSmart={ops.smartNorm}
        onCustom={() => state.setShowTemplateModal(true)}
      />
      <CustomTemplateModal
        open={state.showTemplateModal}
        onClose={() => state.setShowTemplateModal(false)}
        theme={state.theme}
        template={state.templateText}
        setTemplate={state.setTemplateText}
        onGenerate={ops.applyCustomTemplate}
      />
      <TreeViewer
        open={state.showTreeViewer}
        onClose={() => state.setShowTreeViewer(false)}
        theme={state.theme}
        json={state.inputJson}
      />
      <FeatureRequestModal
        open={state.showFeatureModal}
        onClose={() => state.setShowFeatureModal(false)}
        theme={state.theme}
      />
      <ImportJsonModal
        open={state.showImportModal}
        onClose={() => state.setShowImportModal(false)}
        theme={state.theme}
        onImport={fileImport.handleImportString}
      />
      <SqlConfigModal
        open={state.showSqlModal}
        onClose={() => state.setShowSqlModal(false)}
        theme={state.theme}
        config={state.sqlConfig}
        onConfigChange={state.setSqlConfig}
        onGenerate={ops.toSql}
      />

      {/* ── Docks ────────────────────────────────────────────────── */}
      <ActionDock
        compareMode={state.compareMode}
        showStructureMenu={state.showStructureMenu}
        showTreeViewer={state.showTreeViewer}
        showSqlModal={state.showSqlModal}
        showImportModal={state.showImportModal}
        performanceMode={state.performanceMode}
        isLargeFile={largeJson.isLargeFile}
        onImport={() => state.setShowImportModal(true)}
        onFormat={ops.format}
        onMinify={ops.minify}
        onFix={ops.fix}
        onTypeScript={ops.toTypeScript}
        onYaml={ops.toYaml}
        onCsv={ops.toCsv}
        onXml={ops.toXml}
        onToml={ops.toToml}
        onIni={ops.toIni}
        onMarkdown={ops.toMarkdown}
        onExcel={ops.toExcel}
        onSql={() => state.setShowSqlModal(true)}
        onDiff={() => {
          const next = !state.compareMode;
          state.setCompareMode(next);
          if (next && state.compareJson) ops.diff();
        }}
        onStructure={() => state.setShowStructureMenu(true)}
        onSchema={ops.toSchema}
        onTree={() => state.setShowTreeViewer(true)}
        onSuggest={() => state.setShowFeatureModal(true)}
        onSnapshot={() => ops.saveSnapshot(state.inputJson, state.outputJson)}
        onTogglePerformanceMode={() => state.setPerformanceMode(!state.performanceMode)}
      />

      <MobileDock
        theme={state.theme}
        isOpen={state.showMobileActions}
        actions={mobileActions}
        onOpen={() => state.setShowMobileActions(true)}
        onClose={() => state.setShowMobileActions(false)}
      />
    </div>
  );
};

export default JsonFormatter;
