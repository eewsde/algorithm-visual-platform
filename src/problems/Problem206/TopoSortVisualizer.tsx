import { GraphTemplate, GraphNodeState, GraphEdgeState } from "@/components/visualizers/templates/GraphTemplate";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseTopoInput, generateTopoSteps } from "./algorithm";


interface TopoInput extends ProblemInput {
  input: string;
}

function TopoSortVisualizer() {
  return (
    <ConfigurableVisualizer<TopoInput, any>
      config={{
        defaultInput: {
          input: "7\n1 5 0\n2 2 1 0\n3 3 2 0\n4 6 1 0\n5 1 2 4 0\n6 8 2 4 0\n7 4 3 5 6 0",
        },
        algorithm: (input) => {
          return generateTopoSteps(parseTopoInput(input.input));
        },
        inputTypes: [{ type: "string", key: "input", label: "杂务数据" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "杂务数据（第一行 n；之后每行：序号 耗时 前置... 0）",
            placeholder: "7\n1 5 0\n2 2 1 0\n3 3 2 0\n4 6 1 0\n5 1 2 4 0\n6 8 2 4 0\n7 4 3 5 6 0",
          },
        ],
        testCases: [
          {
            label: "示例1（洛谷官方样例）",
            value: {
              input: "7\n1 5 0\n2 2 1 0\n3 3 2 0\n4 6 1 0\n5 1 2 4 0\n6 8 2 4 0\n7 4 3 5 6 0",
            },
          },
          {
            label: "示例2（并行杂务）",
            value: { input: "4\n1 3 0\n2 4 1 0\n3 5 1 0\n4 2 2 3 0" },
          },
          {
            label: "示例3（单链）",
            value: { input: "3\n1 2 0\n2 3 1 0\n3 4 2 0" },
          },
        ],
        keyLines: [5, 6, 8, 10, 11],
        customStepVariables: (variables) => {
          if (!variables || Object.keys(variables).length === 0) return null;
          return (
            <div className="grid grid-cols-2 gap-3">
              {variables.currentTask !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-blue-600 font-semibold">当前杂务</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.currentTask)}</span>
                </div>
              )}
              {variables.taskLen !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-orange-600 font-semibold">耗时</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.taskLen)}</span>
                </div>
              )}
              {variables.prereqList !== undefined && (
                <div className="text-sm col-span-2">
                  <span className="font-mono text-purple-600 font-semibold">前置杂务</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.prereqList)}</span>
                </div>
              )}
              {variables.maxPre !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-cyan-600 font-semibold">前置最早完成</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.maxPre)}</span>
                </div>
              )}
              {variables.finishTime !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-green-600 font-semibold">f[k] 最早完成</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.finishTime)}</span>
                </div>
              )}
              {variables.answer !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-red-600 font-semibold">全局答案</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.answer)}</span>
                </div>
              )}
            </div>
          );
        },
        render: ({ data }) => {
          const nodeList: any[] = data.nodes || [];
          const edgeList: any[] = data.edges || [];
          const answer = data.answer ?? 0;

          const graphNodes: GraphNodeState[] = nodeList.map((n) => ({
            id: n.id,
            label: `${n.id}`,
            isCurrent: n.state === "current",
            isVisited: n.state === "visited",
            customState: { state: n.state, len: n.len, finish: n.finish },
          }));

          const graphEdges: GraphEdgeState[] = edgeList.map((e) => ({
            from: e.from,
            to: e.to,
            isCurrent: e.isCurrent || false,
          }));

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea="杂务 k 的前置只可能在 1..k-1 中——按编号顺序天然是拓扑序。f[k] = 耗时 + max(f[前置])，答案 = max(f[i])，即 DAG 上的关键路径。"
                color="purple"
                features={[
                  "时间复杂度 O(n + 前置总数)",
                  "空间复杂度 O(n)",
                  "拓扑序 + DP",
                  "无依赖的杂务可以并行",
                ]}
              />

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">杂务依赖图（前置 → 杂务）</h3>
                  <span className="text-sm text-gray-500">
                    当前最短完成时间：
                    <span className="font-mono font-bold text-green-600">{answer}</span>
                  </span>
                </div>

                <GraphTemplate
                  nodes={graphNodes}
                  edges={graphEdges}
                  directed={true}
                  layout={{ type: "hierarchical", nodeSize: 64, width: 700, height: 420 }}
                  renderNode={(node) => {
                    const st = (node as any).customState?.state || "unvisited";
                    const len = (node as any).customState?.len ?? 0;
                    const fin = (node as any).customState?.finish ?? 0;
                    let bgColor = "bg-gray-300 text-gray-600";
                    if (node.isCurrent) bgColor = "bg-yellow-400 text-white shadow-lg";
                    else if (st === "prereq") bgColor = "bg-cyan-400 text-white";
                    else if (st === "visited") bgColor = "bg-emerald-500 text-white";
                    return (
                      <div className={`w-full h-full rounded-full flex flex-col items-center justify-center text-xs font-bold transition-colors ${bgColor}`}>
                        <span className="text-sm">{node.label}</span>
                        <span className="opacity-90">t={len}{fin > 0 ? ` f=${fin}` : ""}</span>
                      </div>
                    );
                  }}
                  renderLegend={() => (
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-gray-700">未开始</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        <span className="text-gray-700">前置杂务（等待中）</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="text-gray-700">当前杂务</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-700">已完成</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="text-gray-500">→</span>
                        <span className="text-gray-700">依赖边（前置 → 杂务）</span>
                      </div>
                    </div>
                  )}
                />

                {/* 完成时间表 */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">各杂务最早完成时间</h4>
                  <div className="flex flex-wrap gap-2">
                    {nodeList.map((n) => (
                      <span
                        key={n.id}
                        className={`px-2 py-1 rounded text-xs font-mono border ${
                          n.finish > 0
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-gray-50 border-gray-200 text-gray-500"
                        }`}
                      >
                        {n.id}: {n.finish > 0 ? n.finish : "—"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default TopoSortVisualizer;
