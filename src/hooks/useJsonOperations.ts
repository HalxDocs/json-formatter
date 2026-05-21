import { notify } from "../utils/notify";
import { safeParse } from "../utils/json/safeParse";
import { autoFixJson } from "../utils/json/autoFixJson";
import { csvToJson } from "../utils/convert/toJson/csvToJson";
import { jsonToSchema } from "../utils/json/jsonToSchema";
import { jsonToTs } from "../utils/convert/fromJson/jsonToTs";
import { jsonToYaml } from "../utils/convert/fromJson/jsonToYaml";
import { jsonToToml } from "../utils/convert/fromJson/jsonToToml";
import { jsonToIni } from "../utils/convert/fromJson/jsonToIni";
import { jsonToMarkdown } from "../utils/convert/fromJson/jsonToMarkdown";
import { jsonToExcel } from "../utils/convert/fromJson/jsonToExcel";
import {
  flattenJSON,
  groupJSON,
  buildCustomTemplate,
  smartNormalize,
  jsonToXML,
  jsonToSQLInsert,
} from "../utils/transform";
import type { SqlConfig } from "../types";

const LARGE_THRESHOLD = 5 * 1024 * 1024; // 5 MB

interface OperationsContext {
  inputJson: string;
  compareJson: string;
  performanceMode: boolean;
  sqlConfig: SqlConfig;
  templateText: string;
  executeOperation: (op: string, payload: unknown) => Promise<unknown>;
  setOutputJson: (v: string) => void;
  setTsOutput: (v: string) => void;
  setDiffOutput: (v: string) => void;
  setShowTemplateModal: (v: boolean) => void;
}

function isLarge(str: string, mode: boolean) {
  return str.length > LARGE_THRESHOLD || mode;
}

export function buildJsonOperations(ctx: OperationsContext) {
  const {
    inputJson, compareJson, performanceMode, sqlConfig, templateText,
    executeOperation, setOutputJson, setTsOutput, setDiffOutput, setShowTemplateModal,
  } = ctx;

  const format = async () => {
    if (!inputJson.trim()) {
      notify({ type: "warning", message: "No input to format" });
      return;
    }
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("LARGE_FORMAT", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "Large JSON formatted (streaming)" });
      } catch {
        notify({ type: "error", message: "Formatting failed for large file" });
      }
    } else {
      const parsed = safeParse(inputJson);
      if (!parsed) return;
      setOutputJson(JSON.stringify(parsed, null, 2));
      notify({ type: "success", message: "JSON formatted successfully" });
    }
  };

  const minify = () => {
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(JSON.stringify(parsed));
    notify({ type: "success", message: "JSON minified successfully" });
  };

  const fix = () => {
    try {
      setOutputJson(autoFixJson(inputJson));
      notify({ type: "success", message: "JSON auto-fixed successfully" });
    } catch {
      notify({ type: "error", message: "Unable to auto-fix JSON" });
    }
  };

  const toTypeScript = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("JSON_TO_TS", inputJson) as string;
        setTsOutput(result);
        notify({ type: "success", message: "TypeScript interface generated (worker)" });
      } catch {
        notify({ type: "error", message: "TypeScript conversion failed" });
      }
    } else {
      const parsed = safeParse(inputJson);
      if (!parsed) return;
      setTsOutput(jsonToTs(parsed));
      notify({ type: "success", message: "TypeScript interface generated" });
    }
  };

  const toCsv = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("JSON_TO_CSV", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "CSV generated (worker)" });
      } catch {
        notify({ type: "error", message: "CSV conversion failed" });
      }
      return;
    }
    const parsed = safeParse(inputJson);
    if (!parsed || !Array.isArray(parsed)) {
      notify({ type: "error", message: "CSV conversion requires an array" });
      return;
    }
    if (parsed.length === 0) {
      setOutputJson("");
      notify({ type: "warning", message: "Empty array — no CSV generated" });
      return;
    }
    const headers = Object.keys(parsed[0] as object);
    const rows = (parsed as Record<string, unknown>[]).map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    setOutputJson([headers.join(","), ...rows].join("\n"));
    notify({ type: "success", message: "CSV generated successfully" });
  };

  const toYaml = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("JSON_TO_YAML", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "YAML generated (worker)" });
      } catch {
        notify({ type: "error", message: "YAML conversion failed" });
      }
      return;
    }
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(jsonToYaml(parsed));
    notify({ type: "success", message: "YAML generated successfully" });
  };

  const toXml = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("JSON_TO_XML", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "XML generated (worker)" });
      } catch {
        notify({ type: "error", message: "XML conversion failed" });
      }
      return;
    }
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(jsonToXML(parsed));
    notify({ type: "success", message: "XML generated successfully" });
  };

  const toToml = () => {
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(jsonToToml(parsed));
    notify({ type: "success", message: "TOML generated successfully" });
  };

  const toIni = () => {
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(jsonToIni(parsed));
    notify({ type: "success", message: "INI generated successfully" });
  };

  const toMarkdown = () => {
    const parsed = safeParse(inputJson);
    if (!parsed || !Array.isArray(parsed)) {
      notify({ type: "error", message: "Markdown requires array data" });
      return;
    }
    setOutputJson(jsonToMarkdown(parsed));
    notify({ type: "success", message: "Markdown table generated" });
  };

  const toExcel = () => {
    const parsed = safeParse(inputJson);
    if (!parsed || !Array.isArray(parsed)) {
      notify({ type: "error", message: "Excel export requires array data" });
      return;
    }
    const blob = jsonToExcel(parsed);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.xlsx";
    a.click();
    notify({ type: "success", message: "Excel file downloaded" });
  };

  const toSql = async () => {
    const parsed = safeParse(inputJson);
    if (!parsed || !Array.isArray(parsed)) {
      notify({ type: "error", message: "SQL requires an array of objects" });
      return;
    }
    try {
      if (isLarge(inputJson, performanceMode)) {
        const result = await executeOperation("JSON_TO_SQL", {
          tableName: sqlConfig.tableName,
          data: parsed,
          dialect: sqlConfig.dialect,
          includeDrop: sqlConfig.includeDrop,
          includeCreate: sqlConfig.includeCreate,
          useBatch: sqlConfig.useBatch,
        }) as string;
        setOutputJson(result);
      } else {
        setOutputJson(
          jsonToSQLInsert(sqlConfig.tableName, parsed as Record<string, unknown>[], {
            dialect: sqlConfig.dialect,
            includeDrop: sqlConfig.includeDrop,
            includeCreate: sqlConfig.includeCreate,
            useBatch: sqlConfig.useBatch,
          })
        );
      }
      notify({
        type: "success",
        message: `SQL (${sqlConfig.dialect}) generated for "${sqlConfig.tableName}"`,
      });
    } catch {
      notify({ type: "error", message: "SQL conversion failed" });
    }
  };

  const diff = async () => {
    const large =
      isLarge(inputJson, performanceMode) || isLarge(compareJson, performanceMode);
    if (large) {
      try {
        const result = await executeOperation("DIFF", { left: inputJson, right: compareJson }) as string;
        setDiffOutput(result);
        notify({ type: "success", message: "Diff generated (worker)" });
      } catch {
        notify({ type: "error", message: "Diff generation failed" });
      }
      return;
    }
    try {
      const left = JSON.stringify(JSON.parse(inputJson), null, 2).split("\n");
      const right = JSON.stringify(JSON.parse(compareJson), null, 2).split("\n");
      let out = "";
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (left[i] === right[i]) {
          out += `  ${left[i] ?? ""}\n`;
        } else {
          out += `- ${left[i] ?? ""}\n`;
          out += `+ ${right[i] ?? ""}\n`;
        }
      }
      setDiffOutput(out);
      notify({ type: "success", message: "Diff generated successfully" });
    } catch {
      notify({ type: "error", message: "Diff generation failed" });
    }
  };

  const toSchema = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("JSON_TO_SCHEMA", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "JSON Schema generated (worker)" });
      } catch {
        notify({ type: "error", message: "Schema generation failed" });
      }
      return;
    }
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(JSON.stringify(jsonToSchema(parsed), null, 2));
    notify({ type: "success", message: "JSON Schema generated successfully" });
  };

  const flatten = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("FLATTEN", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "JSON flattened (worker)" });
      } catch {
        notify({ type: "error", message: "Flatten operation failed" });
      }
      return;
    }
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(JSON.stringify(flattenJSON(parsed), null, 2));
    notify({ type: "success", message: "JSON flattened successfully" });
  };

  const group = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("GROUP", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "JSON grouped (worker)" });
      } catch {
        notify({ type: "error", message: "Group operation failed" });
      }
      return;
    }
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(JSON.stringify(groupJSON(parsed), null, 2));
    notify({ type: "success", message: "JSON grouped successfully" });
  };

  const smartNorm = async () => {
    if (isLarge(inputJson, performanceMode)) {
      try {
        const result = await executeOperation("SMART_NORMALIZE", inputJson) as string;
        setOutputJson(result);
        notify({ type: "success", message: "JSON normalized (worker)" });
      } catch {
        notify({ type: "error", message: "Normalization failed" });
      }
      return;
    }
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    setOutputJson(JSON.stringify(smartNormalize(parsed), null, 2));
    notify({ type: "success", message: "JSON normalized successfully" });
  };

  const applyCustomTemplate = () => {
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    try {
      setOutputJson(buildCustomTemplate(parsed, templateText));
      setShowTemplateModal(false);
      notify({ type: "success", message: "Custom template applied successfully" });
    } catch {
      notify({ type: "error", message: "Template generation failed" });
    }
  };

  const downloadOutput = (outputJson: string) => {
    if (!outputJson.trim()) {
      notify({ type: "warning", message: "No output to download" });
      return;
    }
    const blob = new Blob([outputJson], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "output.json";
    a.click();
    notify({ type: "success", message: "Output downloaded successfully" });
  };

  const downloadTs = (tsOutput: string) => {
    if (!tsOutput.trim()) {
      notify({ type: "warning", message: "No TypeScript to download" });
      return;
    }
    const blob = new Blob([tsOutput], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "types.d.ts";
    a.click();
    notify({ type: "success", message: "TypeScript downloaded successfully" });
  };

  const saveSnapshot = (inputJson: string, outputJson: string) => {
    localStorage.setItem("snapshot_input", inputJson);
    localStorage.setItem("snapshot_output", outputJson);
    notify({ type: "success", message: "Snapshot saved successfully" });
  };

  const sortKeys = () => {
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    function sortObj(v: unknown): unknown {
      if (Array.isArray(v)) return v.map(sortObj);
      if (v && typeof v === "object") {
        const out: Record<string, unknown> = {};
        Object.keys(v as object).sort().forEach(k => {
          out[k] = sortObj((v as Record<string, unknown>)[k]);
        });
        return out;
      }
      return v;
    }
    setOutputJson(JSON.stringify(sortObj(parsed), null, 2));
    notify({ type: "success", message: "Keys sorted alphabetically" });
  };

  const removeNulls = () => {
    const parsed = safeParse(inputJson);
    if (!parsed) return;
    function clean(v: unknown): unknown {
      if (Array.isArray(v)) return v.filter(x => x != null).map(clean);
      if (v && typeof v === "object") {
        const out: Record<string, unknown> = {};
        Object.entries(v as object).forEach(([k, val]) => {
          if (val != null) out[k] = clean(val);
        });
        return out;
      }
      return v;
    }
    setOutputJson(JSON.stringify(clean(parsed), null, 2));
    notify({ type: "success", message: "Null / undefined values removed" });
  };

  const fromCsv = () => {
    if (!inputJson.trim()) {
      notify({ type: "warning", message: "Paste CSV into the input panel first" });
      return;
    }
    try {
      const rows = csvToJson(inputJson);
      if (rows.length === 0) {
        notify({ type: "warning", message: "No data rows found in CSV" });
        return;
      }
      setOutputJson(JSON.stringify(rows, null, 2));
      notify({ type: "success", message: `CSV converted — ${rows.length} rows` });
    } catch {
      notify({ type: "error", message: "CSV parse failed — check format" });
    }
  };

  return {
    format, minify, fix,
    toTypeScript, toCsv, toYaml, toXml, toToml, toIni, toMarkdown, toExcel, toSql,
    diff, toSchema, flatten, group, smartNorm, applyCustomTemplate,
    downloadOutput, downloadTs, saveSnapshot,
    sortKeys, removeNulls, fromCsv,
  };
}
