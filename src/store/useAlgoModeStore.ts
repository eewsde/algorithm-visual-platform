import { create } from "zustand";

/**
 * 算法变体模式全局状态
 *
 * 用于让"可视化组件的算法版本切换"与"题解区代码显示"保持同步：
 * - DijkstraVisualizer 切换暴力版/堆优化版时写入 mode
 * - SolutionSection 读取 mode，过滤 codeVersions 中对应 variant 的代码
 *
 * 目前只有 Dijkstra（P4779）用到；后续若其他题也做双版本可扩展。
 */
interface AlgoModeState {
  /** 当前算法变体："brute" 暴力版 / "heap" 堆优化版 */
  dijkstraMode: "brute" | "heap";
  setDijkstraMode: (mode: "brute" | "heap") => void;
}

export const useAlgoModeStore = create<AlgoModeState>()((set) => ({
  dijkstraMode: "brute",
  setDijkstraMode: (mode) => set({ dijkstraMode: mode }),
}));
