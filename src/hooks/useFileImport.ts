import { useRef } from "react";
import { notify } from "../utils/notify";
import type { UseLargeJsonReturn } from "./useLargeJson";

interface FileImportOptions {
  largeJson: UseLargeJsonReturn;
  performanceMode: boolean;
  setInputJson: (v: string) => void;
  setShowPerformanceWarning: (v: boolean) => void;
}

const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;
const PERF_WARNING_THRESHOLD = 10 * 1024 * 1024;

export function useFileImport({
  largeJson,
  performanceMode,
  setInputJson,
  setShowPerformanceWarning,
}: FileImportOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > LARGE_FILE_THRESHOLD) {
      try {
        const result = await largeJson.processFile(file);
        if (result.data) {
          setInputJson(JSON.stringify(result.data, null, 2));
          if (file.size > PERF_WARNING_THRESHOLD) setShowPerformanceWarning(true);
        }
        notify({
          type: "success",
          message: `Large JSON imported (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        });
      } catch {
        notify({ type: "error", message: "Failed to import large file" });
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          JSON.parse(content);
          setInputJson(content);
          notify({ type: "success", message: `JSON imported from ${file.name}` });
        } catch {
          notify({ type: "error", message: "Invalid JSON file" });
        }
      };
      reader.readAsText(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportString = (json: string) => {
    setInputJson(json);
    if (json.length > LARGE_FILE_THRESHOLD && !performanceMode) {
      setShowPerformanceWarning(true);
    }
  };

  return { fileInputRef, triggerFilePicker, handleFileChange, handleImportString };
}
