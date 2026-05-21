import { notify } from "../utils/notify";

export function useClipboard() {
  const copy = (text: string, label: string) => {
    if (!text.trim()) {
      notify({ type: "warning", message: `No ${label} to copy` });
      return;
    }
    navigator.clipboard.writeText(text);
    notify({ type: "success", message: `${label} copied to clipboard` });
  };

  return {
    copyInput: (text: string) => copy(text, "input"),
    copyOutput: (text: string) => copy(text, "output"),
    copyCompare: (text: string) => copy(text, "compare text"),
    copyDiff: (text: string) => copy(text, "diff"),
    copyTs: (text: string) => copy(text, "TypeScript"),
  };
}
