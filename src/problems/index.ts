/**
 * 题目可视化组件注册中心
 *
 * 这个文件用于统一管理所有题目的可视化组件映射
 * 使用懒加载优化初始加载时间，只在用户访问具体题目时才加载对应组件
 */

import { ComponentType, lazy } from "react";

/**
 * 懒加载可视化组件注册表
 * 使用 React.lazy 实现按需加载，减少初始包体积
 *
 * key: 题目 ID
 * value: 懒加载的可视化组件
 */
export const visualizerRegistry: Record<number, ComponentType> = {
  200: lazy(() => import("./Problem200/DijkstraVisualizer")),
  201: lazy(() => import("./Problem201/KruskalVisualizer")),
  202: lazy(() => import("./Problem202/FloydVisualizer")),
  203: lazy(() => import("./Problem203/Knapsack01Visualizer")),
  204: lazy(() => import("./Problem204/PrimVisualizer")),
  205: lazy(() => import("./Problem205/BFSTraversalVisualizer")),
  206: lazy(() => import("./Problem206/TopoSortVisualizer")),
  207: lazy(() => import("./Problem207/LISVisualizer")),
  208: lazy(() => import("./Problem208/LCSVisualizer")),
};

/**
 * 检查题目是否有可视化组件
 */
export function hasVisualizer(problemId: number): boolean {
  return problemId in visualizerRegistry;
}

/**
 * 获取题目的可视化组件（懒加载）
 * 返回的组件需要用 Suspense 包裹
 */
export function getVisualizer(problemId: number): ComponentType | null {
  return visualizerRegistry[problemId] || null;
}
