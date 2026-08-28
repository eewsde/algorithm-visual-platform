import { GraphTemplate, GraphNodeState, GraphEdgeState } from "@/components/visualizers/templates/GraphTemplate";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseDijkstraInput, generateDijkstraSteps } from "./algorithm";
import { PerformancePanel, createDijkstraBenchmark } from "@/components/PerformancePanel";

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

interface DijkstraData {
  nodes?: DijkstraNode[];
  edges?: DijkstraEdge[];
  visited?: boolean[];
}

function DijkstraVisualizer() {
  return (
    <ConfigurableVisualizer<DijkstraInput, DijkstraData>
      config={{
        defaultInput: {
          input: "4 6 1\n1 2 2\n2 3 2\n2 4 1\n1 3 5\n3 4 3\n1 4 4",
        },
        algorithm: (input) => {
          return generateDijkstraSteps(parseDijkstraInput(input.input));
        },
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
                idea="每次选择未访问节点中距离最小的节点，对其所有邻居进行松弛操作。dist[v] = min(dist[v], dist[u] + w(u,v))"
                color="blue"
                features={[
                  "可视化实现 O(V²+E)（便于逐步展示）",
                  "堆优化可达 O((V+E)logV)",
                  "空间复杂度 O(V+E)",
                  "贪心策略 — 每次选最近的未访问节点",
                  "不允许负权边",
                ]}
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
  );
}

export default DijkstraVisualizer;
