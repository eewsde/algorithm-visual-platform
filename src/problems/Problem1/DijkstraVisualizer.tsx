import { useState } from "react";
import { GraphTemplate, GraphNodeState, GraphEdgeState } from "@/components/visualizers/templates/GraphTemplate";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseDijkstraInput, generateDijkstraSteps, generateDijkstraHeapSteps } from "./algorithm";
import { PerformancePanel, createDijkstraBenchmark } from "@/components/PerformancePanel";
import { useAlgoModeStore } from "@/store/useAlgoModeStore";

import { getProblemById } from "@/data";

interface DijkstraInput extends ProblemInput {
  input: string;
}

interface DijkstraNode {
  id: number;
  label: string;
  distance: number;
}

interface DijkstraEdge {
  from: number;
  to: number;
  weight: number;
  isCurrent?: boolean;
  isVisited?: boolean;
}

/** 堆快照元素：[距离, 节点] */
interface HeapEntry {
  d: number;
  n: number;
}

interface DijkstraData {
  nodes?: DijkstraNode[];
  edges?: DijkstraEdge[];
  visited?: boolean[];
  /** 堆优化模式：当前堆内容快照 */
  heap?: HeapEntry[];
  /** 堆最近一次动作：push=入堆 / pop=弹出 / relax-skip=检查不更新 / done=完成 */
  heapAction?: string;
  /** 最近一次入堆的节点（高亮显示） */
  pushedNode?: number;
  /** 最近一次弹出的节点 */
  poppedNode?: number;
  /** 弹出的是过期记录 */
  stale?: boolean;
}

type DijkstraMode = "brute" | "heap";

function DijkstraVisualizer() {
  const [mode, setMode] = useState<DijkstraMode>("brute");
  // 全局模式：让左侧题解区的代码也跟着切换
  const setDijkstraMode = useAlgoModeStore((s) => s.setDijkstraMode);

  const switchMode = (next: DijkstraMode) => {
    setMode(next);
    setDijkstraMode(next);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 算法版本切换 */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 p-3 bg-gray-50 border-b">
        <span className="text-sm text-gray-600 mr-2">算法版本：</span>
        <button
          onClick={() => switchMode("brute")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            mode === "brute"
              ? "bg-blue-600 text-white shadow"
              : "bg-white text-gray-600 border hover:bg-gray-100"
          }`}
        >
          暴力版 O(V²)
        </button>
        <button
          onClick={() => switchMode("heap")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            mode === "heap"
              ? "bg-emerald-600 text-white shadow"
              : "bg-white text-gray-600 border hover:bg-gray-100"
          }`}
        >
          堆优化 O((V+E)logV)
        </button>
      </div>

      <div className="flex-1 min-h-0">
    <ConfigurableVisualizer<DijkstraInput, DijkstraData>
      config={{
        defaultInput: {
          input: "4 6 1\n1 2 2\n2 3 2\n2 4 1\n1 3 5\n3 4 3\n1 4 4",
        },
        algorithm: (input) => {
          const parsed = parseDijkstraInput(input.input);
          return mode === "brute" ? generateDijkstraSteps(parsed) : generateDijkstraHeapSteps(parsed);
        },
        // 模式切换时重新生成步骤但保留当前输入
        regenKey: mode,
        inputTypes: [{ type: "string", key: "input", label: "图数据" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "图数据（格式：n m start，然后 m 行 u v w）",
            placeholder: "4 6 1\n1 2 2\n2 3 2\n2 4 1\n1 3 5\n3 4 3\n1 4 4",
          },
        ],
        testCases: [
          {
            label: "示例1（洛谷官方样例）",
            value: { input: "4 6 1\n1 2 2\n2 3 2\n2 4 1\n1 3 5\n3 4 3\n1 4 4" },
          },
          {
            label: "示例2",
            value: { input: "5 7 1\n1 2 10\n1 4 5\n2 3 1\n2 4 2\n3 5 4\n4 2 3\n4 5 2" },
          },
          {
            label: "示例3",
            value: { input: "6 9 1\n1 2 7\n1 3 9\n1 6 14\n2 3 10\n2 4 15\n3 4 11\n3 6 2\n4 5 6\n5 6 9" },
          },
        ],
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {variables.current !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-blue-600 font-semibold">当前节点</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.current)}</span>
                  </div>
                )}
                {variables.neighbor !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-purple-600 font-semibold">相邻节点</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.neighbor)}</span>
                  </div>
                )}
                {variables.edgeWeight !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-orange-600 font-semibold">边权重</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.edgeWeight)}</span>
                  </div>
                )}
                {variables.oldDist !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-red-600 font-semibold">旧距离</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.oldDist)}</span>
                  </div>
                )}
                {variables.newDist !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-green-600 font-semibold">新距离</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.newDist)}</span>
                  </div>
                )}
                {variables.heapSize !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-teal-600 font-semibold">堆大小</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.heapSize)}</span>
                  </div>
                )}
              </div>
            );
          }
          return null;
        },
        render: ({ data, visualization }) => {
          // 当前步骤顶层 highlightedNodes 记录了"当前选中节点 u"（字符串形式的节点 id），映射为节点的 isCurrent 状态
          const highlightedSet = new Set(
            (visualization?.currentStepData?.highlightedNodes || []).map((id) => String(id))
          );

          const nodes: GraphNodeState[] = (data.nodes || []).map((n) => ({
            id: n.id,
            label: `${n.id}`,
            value: n.distance === Infinity ? "∞" : n.distance,
            isCurrent: highlightedSet.has(String(n.id)),
          }));

          const edges: GraphEdgeState[] = (data.edges || []).map((e) => ({
            from: e.from,
            to: e.to,
            weight: e.weight,
            label: `${e.weight}`,
            isCurrent: e.isCurrent || false,
            isVisited: e.isVisited || false,
          }));

          // Determine which node is current
          const visitedMask = data.visited || [];

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea={
                  mode === "brute"
                    ? "每次选择未访问节点中距离最小的节点，对其所有邻居进行松弛操作。dist[v] = min(dist[v], dist[u] + w(u,v))"
                    : "用二叉最小堆（优先队列）维护候选节点：每次 O(log V) 弹出距离最小的节点并松弛其邻居；松弛成功的新距离入堆。堆中可能留有过期记录，弹出时跳过。"
                }
                color={mode === "brute" ? "blue" : "emerald"}
                features={
                  mode === "brute"
                    ? [
                        "可视化实现 O(V²+E)（便于逐步展示）",
                        "堆优化可达 O((V+E)logV)",
                        "空间复杂度 O(V+E)",
                        "贪心策略 — 每次选最近的未访问节点",
                        "不允许负权边",
                      ]
                    : [
                        "优先队列优化 O((V+E)logV)",
                        "空间复杂度 O(V+E)",
                        "懒删除 — 过期记录弹出时跳过",
                        "贪心策略 — 每次选最近的未访问节点",
                        "不允许负权边",
                      ]
                }
              />


              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">最短路径图</h3>

                <GraphTemplate
                  nodes={nodes.map((n) => {
                    const idx = n.id - 1;
                    return {
                      ...n,
                      isVisited: visitedMask[idx] || false,
                    };
                  })}
                  edges={edges}
                  renderNode={(node) => {
                    const dist = node.value;
                    const distStr = dist === "∞" || dist === Infinity
                      ? "∞"
                      : String(dist);
                    const isInf = distStr === "∞";

                    let bgColor = "bg-gray-100";
                    let textColor = "text-gray-700";
                    let borderColor = "border-gray-300";

                    if (node.isCurrent) {
                      // 当前选中节点：独立视觉状态（优先于已访问）
                      bgColor = "bg-yellow-400";
                      textColor = "text-white";
                      borderColor = "border-yellow-500";
                    } else if (node.isVisited) {
                      bgColor = "bg-green-500";
                      textColor = "text-white";
                      borderColor = "border-green-600";
                    }

                    return (
                      <div
                        className={`
                          ${bgColor} ${textColor} ${borderColor}
                          border-2 rounded-full
                          flex flex-col items-center justify-center
                          w-full h-full text-xs font-bold
                          transition-colors duration-300
                          shadow-sm
                        `}
                      >
                        <span>{node.label}</span>
                        {!isInf && (
                          <span className="text-[10px] opacity-80">{distStr}</span>
                        )}
                      </div>
                    );
                  }}
                  layout={{ type: "circle", nodeSize: 56, width: 700, height: 500 }}
                  directed={true}
                  renderLegend={() => (
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded-full" />
                        <span className="text-gray-700">未访问</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                        <span className="text-gray-700">当前选中节点</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-4 h-4 bg-green-500 rounded-full" />
                        <span className="text-gray-700">已访问</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-0.5 bg-yellow-400" />
                        <span className="text-gray-700">当前松弛边</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-0.5 bg-green-400" />
                        <span className="text-gray-700">最短路径树边</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-0.5 bg-gray-300" />
                        <span className="text-gray-700">未使用边</span>
                      </div>
                    </div>
                  )}
                />

                {/* Distance table */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">最短距离表</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {(data.nodes || []).map((n) => (
                            <th key={n.id} className="border border-gray-200 px-3 py-1.5 text-center font-mono">
                              节点{n.id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {(data.nodes || []).map((n) => (
                            <td
                              key={n.id}
                              className={`border border-gray-200 px-3 py-1.5 text-center font-mono font-bold ${
                                n.distance === Infinity ? "text-red-400" : "text-green-700"
                              }`}
                            >
                              {n.distance === Infinity ? "∞" : n.distance}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 堆状态面板（仅堆优化模式） */}
                {mode === "heap" && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      优先队列（最小堆）
                      {data.stale && (
                        <span className="ml-2 text-amber-600 font-medium">⚠ 过期记录，弹出后跳过</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-1 flex-wrap bg-gray-50 rounded-lg border border-gray-200 p-3 min-h-[3rem]">
                      {(data.heap || []).length === 0 ? (
                        <span className="text-gray-400 text-xs">堆已空</span>
                      ) : (
                        (data.heap || []).map((entry, i) => {
                          const isNew = data.heapAction === "push" && data.pushedNode === entry.n && i === (data.heap || []).length - 1;
                          const isPopCandidate = data.heapAction === "pop" && i === 0;
                          return (
                            <span key={i} className="inline-flex items-center gap-1">
                              {i > 0 && <span className="text-gray-300">|</span>}
                              <span
                                className={`px-2 py-1 rounded font-mono text-xs border ${
                                  isNew
                                    ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                                    : isPopCandidate
                                    ? "bg-amber-100 border-amber-400 text-amber-800"
                                    : "bg-white border-gray-300 text-gray-800"
                                }`}
                              >
                                ({entry.d === Infinity ? "∞" : entry.d}, {entry.n})
                              </span>
                            </span>
                          );
                        })
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      堆顶（最左）始终是当前距离最小的节点；新距离入堆时上浮，弹出后下沉。
                    </p>
                  </div>
                )}

                {/* 性能对比 */}
                <PerformancePanel
                  comparisons={getProblemById(1)?.solution?.comparisons || []}
                  benchmark={createDijkstraBenchmark()}
                />
              </div>
            </div>
          );
        },
      }}
    />
      </div>
    </div>
  );
}

export default DijkstraVisualizer;
