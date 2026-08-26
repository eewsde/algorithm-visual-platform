import { GraphTemplate, GraphNodeState, GraphEdgeState } from "@/components/visualizers/templates/GraphTemplate";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parsePrimInput, generatePrimSteps } from "./algorithm";
import { PerformancePanel, createMSTBenchmark } from "@/components/PerformancePanel";
import { getProblemById } from "@/data";

interface PrimInputData extends ProblemInput {
  input: string;
}

interface EdgeStatus {
  from: number;
  to: number;
  weight: number;
  index: number;
  status: "pending" | "candidate" | "current" | "selected";
}

interface NodeInfo {
  id: number;
  label: string;
  inMST: boolean;
  isCurrent?: boolean;
}

interface PrimData {
  nodes?: NodeInfo[];
  edges?: EdgeStatus[];
  totalWeight?: number;
  selectedCount?: number;
}

function PrimVisualizer() {
  return (
    <ConfigurableVisualizer<PrimInputData, PrimData>
      config={{
        defaultInput: {
          input: "4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 3",
        },
        algorithm: (input) => {
          return generatePrimSteps(parsePrimInput(input.input));
        },
        inputTypes: [{ type: "string", key: "input", label: "图数据" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "图数据（格式：n m，然后 m 行 u v w）",
            placeholder: "4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 3",
          },
        ],
        testCases: [
          {
            label: "示例1（与Kruskal相同）",
            value: { input: "4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 3" },
          },
          {
            label: "示例2（稠密图）",
            value: { input: "5 7\n1 2 3\n1 5 1\n2 3 5\n2 5 4\n3 4 2\n3 5 6\n4 5 7" },
          },
        ],
        keyLines: [11, 13, 14, 27, 28, 29],
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {variables.currentFrom !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-blue-600 font-semibold">边</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">
                      ({String(variables.currentFrom)}, {String(variables.currentTo)})
                    </span>
                  </div>
                )}
                {variables.currentWeight !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-purple-600 font-semibold">权重</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.currentWeight)}</span>
                  </div>
                )}
                {variables.totalWeight !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-green-600 font-semibold">累计权重</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.totalWeight)}</span>
                  </div>
                )}
                {variables.selectedCount !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-orange-600 font-semibold">已选边数</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.selectedCount)}</span>
                  </div>
                )}
                {variables.candidateCount !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-cyan-600 font-semibold">候选边数</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.candidateCount)}</span>
                  </div>
                )}
                {variables.action === "selected" && (
                  <div className="text-sm col-span-2">
                    <span className="text-green-600 font-bold">✓ 选择此边，新节点加入MST</span>
                  </div>
                )}
              </div>
            );
          }
          return null;
        },
        render: ({ data }) => {
          const allEdges = data.edges || [];
          const allNodes = data.nodes || [];
          const totalWeight = data.totalWeight ?? 0;
          const selectedCount = data.selectedCount ?? 0;

          const graphNodes: GraphNodeState[] = allNodes.map((n) => ({
            id: n.id,
            label: `${n.id}`,
            isCurrent: n.isCurrent,
            isVisited: n.inMST,
            customState: { inMST: n.inMST },
          }));

          const graphEdges: GraphEdgeState[] = [];
          const selectedEdges: EdgeStatus[] = [];
          const candidateEdges: EdgeStatus[] = [];

          for (const e of allEdges) {
            if (e.status === "selected") {
              selectedEdges.push(e);
              graphEdges.push({
                from: e.from,
                to: e.to,
                weight: e.weight,
                label: `${e.weight}`,
                isVisited: true,
              });
            } else if (e.status === "current") {
              graphEdges.push({
                from: e.from,
                to: e.to,
                weight: e.weight,
                label: `${e.weight}`,
                isCurrent: true,
              });
            } else if (e.status === "candidate") {
              candidateEdges.push(e);
              graphEdges.push({
                from: e.from,
                to: e.to,
                weight: e.weight,
                label: `${e.weight}`,
                isHighlighted: true,
              });
            } else {
              // 尚未进入候选的边：浅灰显示，保证整张图可见
              graphEdges.push({
                from: e.from,
                to: e.to,
                weight: e.weight,
                label: `${e.weight}`,
              });
            }
          }

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea="从任意起点出发，每次选择一条连接「已选集合」与「未选集合」的最小权边，将边和新节点加入MST。重复直到所有节点都在MST中。"
                color="blue"
                features={[
                  "可视化实现 O(V·E)（便于逐步展示候选边）",
                  "堆优化可达 O((V+E)logV)",
                  "空间复杂度 O(V+E)",
                  "基于节点的贪心策略",
                  "稠密图首选（邻接矩阵 O(V²)）",
                ]}
              />


              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    MST 构建过程
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>边: {selectedCount}/{allNodes.length - 1}</span>
                    <span className="font-mono text-green-600 font-bold">∑={totalWeight}</span>
                  </div>
                </div>

                {graphEdges.length > 0 && (
                  <div>
                    <GraphTemplate
                      nodes={graphNodes}
                      edges={graphEdges}
                      directed={false}
                      layout={{ type: "circle", nodeSize: 44, width: 650, height: 400 }}
                      renderNode={(node) => {
                        const isInMST = node.customState?.inMST || node.isVisited;
                        let bgColor = "bg-gray-300 text-gray-600";
                        if (node.isCurrent) bgColor = "bg-yellow-400 text-white shadow-lg";
                        else if (isInMST) bgColor = "bg-blue-500 text-white shadow-sm";
                        return (
                          <div
                            className={`w-full h-full rounded-full flex items-center justify-center text-sm font-bold transition-colors ${bgColor}`}
                          >
                            {node.label}
                          </div>
                        );
                      }}
                      renderLegend={() => (
                        <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-0.5 bg-green-400" />
                            <span className="text-gray-700">已选边</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-0.5 bg-yellow-400" />
                            <span className="text-gray-700">当前选择</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-0.5 bg-blue-300" />
                            <span className="text-gray-700">候选边</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-gray-700">已选节点</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                            <span className="text-gray-700">未选节点</span>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      已选边 ({selectedEdges.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedEdges.length === 0 && (
                        <p className="text-xs text-gray-400">暂无</p>
                      )}
                      {selectedEdges.map((e, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded text-sm"
                        >
                          <span className="font-mono">
                            ({e.from}, {e.to})
                          </span>
                          <span className="text-gray-500 font-mono text-xs">
                            w={e.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      当前候选边 ({candidateEdges.length})
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {candidateEdges.length === 0 && (
                        <p className="text-xs text-gray-400">暂无候选边</p>
                      )}
                      {candidateEdges
                        .sort((a, b) => a.weight - b.weight)
                        .map((e, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm"
                          >
                            <span className="font-mono">
                              ({e.from}, {e.to})
                            </span>
                            <span className="text-gray-500 font-mono text-xs">
                              w={e.weight}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <PerformancePanel
                  comparisons={getProblemById(204)?.solution?.comparisons || []}
                  benchmark={createMSTBenchmark()}
                />
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default PrimVisualizer;
