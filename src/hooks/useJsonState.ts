import { useState, useEffect } from "react";
import type { Theme, SqlConfig } from "../types";

export interface JsonState {
  theme: Theme;
  setTheme: (t: Theme) => void;

  inputJson: string;
  setInputJson: (v: string) => void;

  outputJson: string;
  setOutputJson: (v: string) => void;

  tsOutput: string;
  setTsOutput: (v: string) => void;

  compareMode: boolean;
  setCompareMode: (v: boolean) => void;

  compareJson: string;
  setCompareJson: (v: string) => void;

  diffOutput: string;
  setDiffOutput: (v: string) => void;

  templateText: string;
  setTemplateText: (v: string) => void;

  performanceMode: boolean;
  setPerformanceMode: (v: boolean) => void;

  showStructureMenu: boolean;
  setShowStructureMenu: (v: boolean) => void;

  showTemplateModal: boolean;
  setShowTemplateModal: (v: boolean) => void;

  showTreeViewer: boolean;
  setShowTreeViewer: (v: boolean) => void;

  showFeatureModal: boolean;
  setShowFeatureModal: (v: boolean) => void;

  showSqlModal: boolean;
  setShowSqlModal: (v: boolean) => void;

  showImportModal: boolean;
  setShowImportModal: (v: boolean) => void;

  showMobileActions: boolean;
  setShowMobileActions: (v: boolean) => void;

  showPerformanceWarning: boolean;
  setShowPerformanceWarning: (v: boolean) => void;

  sqlConfig: SqlConfig;
  setSqlConfig: (c: SqlConfig) => void;
}

export function useJsonState(): JsonState {
  const [theme, setTheme] = useState<Theme>("dark");
  const [inputJson, setInputJsonRaw] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [tsOutput, setTsOutput] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [compareJson, setCompareJson] = useState("");
  const [diffOutput, setDiffOutput] = useState("");
  const [templateText, setTemplateText] = useState("");
  const [performanceMode, setPerformanceMode] = useState(false);

  const [showStructureMenu, setShowStructureMenu] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTreeViewer, setShowTreeViewer] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);

  const [sqlConfig, setSqlConfig] = useState<SqlConfig>({
    tableName: "data",
    dialect: "postgres",
    includeDrop: false,
    includeCreate: true,
    useBatch: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("jsonInput");
    if (saved) setInputJsonRaw(saved);
  }, []);

  const setInputJson = (v: string) => {
    setInputJsonRaw(v);
    // Skip localStorage for large payloads — browsers cap storage at ~5 MB
    if (v.length < 4 * 1024 * 1024) {
      try {
        localStorage.setItem("jsonInput", v);
      } catch {
        // QuotaExceededError — silently ignore
      }
    }
  };

  return {
    theme, setTheme,
    inputJson, setInputJson,
    outputJson, setOutputJson,
    tsOutput, setTsOutput,
    compareMode, setCompareMode,
    compareJson, setCompareJson,
    diffOutput, setDiffOutput,
    templateText, setTemplateText,
    performanceMode, setPerformanceMode,
    showStructureMenu, setShowStructureMenu,
    showTemplateModal, setShowTemplateModal,
    showTreeViewer, setShowTreeViewer,
    showFeatureModal, setShowFeatureModal,
    showSqlModal, setShowSqlModal,
    showImportModal, setShowImportModal,
    showMobileActions, setShowMobileActions,
    showPerformanceWarning, setShowPerformanceWarning,
    sqlConfig, setSqlConfig,
  };
}
