import { useEffect, useRef } from "react";

interface ShortcutHandlers {
  onFormat: () => void;
  onMinify: () => void;
  onFix: () => void;
  onToggleDiff: () => void;
  onToggleTree: () => void;
  onDownload: () => void;
  onOpenSql: () => void;
  onOpenImport: () => void;
  onCopyOutput: () => void;
  onTogglePerformanceMode: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  // Always use the latest handlers without re-registering the event listener
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      const h = ref.current;
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          h.onFormat();
          break;
        case "m":
          e.preventDefault();
          h.onMinify();
          break;
        case "k":
          e.preventDefault();
          h.onFix();
          break;
        case "d":
          e.preventDefault();
          h.onToggleDiff();
          break;
        case "t":
          e.preventDefault();
          h.onToggleTree();
          break;
        case "s":
          e.preventDefault();
          if (e.shiftKey) h.onOpenSql();
          else h.onDownload();
          break;
        case "i":
          if (e.shiftKey) {
            e.preventDefault();
            h.onOpenImport();
          }
          break;
        case "c":
          if (e.shiftKey) {
            e.preventDefault();
            h.onCopyOutput();
          }
          break;
        case "p":
          if (e.shiftKey) {
            e.preventDefault();
            h.onTogglePerformanceMode();
          }
          break;
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []); // empty deps — listener registered once, ref always has fresh handlers
}
