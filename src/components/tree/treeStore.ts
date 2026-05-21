// components/tree/treeStore.ts

import { create } from "zustand";

interface TreeStore {
  expanded: Set<string>;
  focusedId: string | null;
  highlights: string[];
  expandAll: (ids: string[]) => void;
  collapseAll: () => void;
  toggle: (id: string) => void;
  setFocused: (id: string) => void;
  setHighlights: (ids: string[]) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  expanded: new Set(),
  focusedId: null,
  highlights: [],

  expandAll: (ids) =>
    set(() => ({ expanded: new Set(ids) })),

  collapseAll: () =>
    set(() => ({ expanded: new Set() })),

  toggle: (id) =>
    set((state) => {
      const next = new Set(state.expanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expanded: next };
    }),

  setFocused: (id) => set(() => ({ focusedId: id })),

  setHighlights: (ids) => set(() => ({ highlights: ids })),
}));
