import { useState } from "react";
import { GraphTemplate, GraphNodeState, GraphEdgeState } from "@/components/visualizers/templates/GraphTemplate";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import {
  parseTraversalInput,
  generateBFSSteps,
  generateDFSSteps,
  TraversalMode,
} from "./algorithm";
import { PerformancePanel, createTraversalBenchmark } from "@/components/PerformancePanel";
import { getProblemById } from "@/data";

// 模块级常量：benchmark 配置与题目信息只创建/查询一次，避免每步渲染重复创建
const traversalBenchmark = createTraversalBenchmark();
const bfsDfsProblem = getProblemById(205);

interface TraversalInputData extends ProblemInput {
  input: string;
}

function BFSDFSPage() {
  const [mode, setMode] = useState<TraversalMode>("bfs");

  return (
    <div className="h-full flex flex-col">
      {/* Mode toggle */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 p-3 bg-gray-50 border-b">
        <span className="text-sm text-gray-600 mr-2">遍历模式：</span>
        <button
          onClick={() => setMode("bfs")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            mode === "bfs"
              ? "bg-blue-600 text-white shadow"
              : "bg-white text-gray-600 border hover:bg-gray-100"
          }`}
        >
          BFS（广度优先）
        </button>
        <button
          onClick={() => setMode("dfs")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            mode === "dfs"
              ? "bg-green-600 text-white shadow"
              : "bg-white text-gray-600 border hover:bg-gray-100"
          }`}
        >
          DFS（深度优先）
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ConfigurableVisualizer<TraversalInputData, any>
          config={{
            defaultInput: {
              input: "8 9\n1 2\n1 3\n1 4\n2 5\n2 6\n3 7\n4 7\n4 8\n7 8",
            },
            algorithm: (input) => {
              const parsed = parseTraversalInput(input.input, 1);
              return mode === "bfs" ? generateBFSSteps(parsed) : generateDFSSteps(parsed);
            },
            // 模式切换时重新生成步骤但保留当前输入（不重挂载组件）
            regenKey: mode,
          inputTypes: [{ type: "string", key: "input", label: "图数据" }],
          inputFields: [
            {
              type: "string",
              key: "input",
              label: "图数据（格式：n m，然后 m 行 u v，u→v 有向引用边）",
              placeholder: "8 9\n1 2\n1 3\n1 4\n2 5\n2 6\n3 7\n4 7\n4 8\n7 8",
            },
          ],
          testCases: [
            {
              label: "示例1（洛谷官方样例）",
              value: {
                input: "8 9\n1 2\n1 3\n1 4\n2 5\n2 6\n3 7\n4 7\n4 8\n7 8",
              },
            },
            {
              label: "示例2（连通图）",
              value: {
                input: "6 7\n1 2\n1 3\n2 4\n2 5\n3 6\n4 5\n5 6",
              },
            },
            {
              label: "示例3（树形图）",
              value: {
                input: "7 6\n1 2\n1 3\n2 4\n2 5\n3 6\n3 7",
              },
            },
            {
              label: "示例4（链形图）",
              value: {
                input: "5 4\n1 2\n2 3\n3 4\n4 5",
              },
            },
          ],
        keyLines: [8, 9, 23, 26, 27, 30],
          customStepVariables: (variables) => {
            if (!variables || Object.keys(variables).length === 0) return null;
            return (
              <div className="grid grid-cols-2 gap-3">
                {variables.currentNode !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-blue-600 font-semibold">当前节点</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.currentNode)}</span>
                  </div>
                )}
                {variables.discoveredNode !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-green-600 font-semibold">发现节点</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.discoveredNode)}</span>
                  </div>
                )}
                {variables.visitedCount !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-purple-600 font-semibold">已访问</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.visitedCount)}</span>
                  </div>
                )}
                {variables.queueSize !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-orange-600 font-semibold">{mode === "bfs" ? "队列大小" : "栈大小"}</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.queueSize)}</span>
                  </div>
                )}
                {variables.action === "backtrack" && (
                  <div className="text-sm col-span-2">
                    <span className="text-amber-600 font-bold">↩ 回溯</span>
                  </div>
                )}
              </div>
            );
          },
          render: ({ data }) => {
            const nodeList = data.nodes || [];
            const edgeList = data.edges || [];
            const queueContent = data.queue || [];
            const order = data.discoveryOrder || [];

            const graphNodes: GraphNodeState[] = nodeList.map((n: any) => ({
              id: n.id,
              label: `${n.id}`,
              isCurrent: n.isCurrent,
              isInQueue: n.state === "in_queue" || n.state === "visiting",
              isVisited: n.state === "visited",
              customState: { state: n.state },
            }));

            const graphEdges: GraphEdgeState[] = edgeList.map((e: any) => ({
              from: e.from,
              to: e.to,
              isCurrent: e.type === "current",
              isVisited: e.type === "visited",
            }));

            return (
              <div className="p-4">
                <CoreIdeaBox
                  idea={
                    mode === "bfs"
                      ? "从起点出发，逐层访问。使用队列（先进先出），每次取出队首节点，将其所有未访问邻居入队。保证按距离递增顺序访问。"
                      : "从起点出发，沿一条路径深入到底再回溯。使用递归/栈（后进先出），每遇到未访问邻居就立即进入。适合搜索所有路径。"
                  }
                  color={mode === "bfs" ? "blue" : "green"}
                  features={
                    mode === "bfs"
                      ? [
                          "时间复杂度 O(V+E)",
                          "空间复杂度 O(V)",
                          "队列实现（FIFO）",
                          "适合：最短路径（无权图）、层次遍历",
                        ]
                      : [
                          "时间复杂度 O(V+E)",
                          "空间复杂度 O(V)（递归栈深度）",
                          "递归/栈实现（LIFO）",
                          "适合：拓扑排序、连通分量、环检测",
                        ]
                  }
                />


                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {mode === "bfs" ? "BFS" : "DFS"} 遍历过程
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        发现顺序：<span className="font-mono text-gray-800 font-bold">{order.join(" → ") || "—"}</span>
                      </span>
                    </div>
                  </div>

                  <GraphTemplate
                    nodes={graphNodes}
                    edges={graphEdges}
                    directed={true}
                    layout={{ type: "circle", nodeSize: 44, width: 650, height: 400 }}
                    renderNode={(node) => {
                      const state = (node as any).customState?.state || "unvisited";
                      const isCurrent = node.isCurrent;
                      let bgColor = "bg-gray-300 text-gray-600";
                      if (isCurrent) bgColor = "bg-yellow-400 text-white shadow-lg";
                      else if (state === "in_queue" || state === "visiting") bgColor = "bg-cyan-400 text-white";
                      else if (state === "visited") bgColor = "bg-emerald-500 text-white";

                      return (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center text-sm font-bold transition-all ${bgColor}`}
                          style={{ transform: isCurrent ? "scale(1.15)" : "scale(1)" }}
                        >
                          {node.label}
                        </div>
                      );
                    }}
                    renderLegend={() => (
                      <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <div className="w-3 h-0.5 bg-yellow-400" />
                          <span className="text-gray-700">当前遍历边</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <div className="w-3 h-0.5 bg-green-400" />
                          <span className="text-gray-700">已遍历边</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <span className="text-gray-500">→</span>
                          <span className="text-gray-700">箭头 = 引用方向（X→Y）</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <div className="w-3 h-3 rounded-full bg-gray-300" />
                          <span className="text-gray-700">未访问</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <div className="w-3 h-3 rounded-full bg-cyan-400" />
                          <span className="text-gray-700">{mode === "bfs" ? "队列中" : "递归栈中"}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-gray-700">已访问</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <span className="text-gray-700">当前节点</span>
                        </div>
                      </div>
                    )}
                  />

                  {/* Queue/Stack display */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-700">
                        {mode === "bfs" ? "队列 (Queue)" : "栈 (Stack)"}：
                      </span>
                      <div className="flex items-center gap-1">
                        {queueContent.length === 0 ? (
                          <span className="text-gray-400 text-xs">空</span>
                        ) : (
                          queueContent.map((id: number, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1">
                              {i > 0 && <span className="text-gray-300">|</span>}
                              <span className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono text-xs text-gray-800">
                                {id}
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                      {mode === "bfs" ? (
                        <span className="text-gray-400 text-xs ml-2">← 队首出队 / 队尾入队 →</span>
                      ) : (
                        <span className="text-gray-400 text-xs ml-2">← 栈顶（进出）</span>
                      )}
                    </div>

                    <PerformancePanel
                      comparisons={bfsDfsProblem?.solution?.comparisons || []}
                      benchmark={traversalBenchmark}
                    />
                  </div>
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

export default BFSDFSPage;
