import { create } from "zustand";

interface CodeState {
  highlightLines: number[];
  setHighlightLines: (lines: number[]) => void;
}

export const useCodeStore = create<CodeState>()((set) => ({
  highlightLines: [],
  setHighlightLines: (lines) => set({ highlightLines: lines }),
}));
