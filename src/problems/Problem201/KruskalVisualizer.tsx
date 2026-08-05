import { GraphTemplate, GraphNodeState, GraphEdgeState } from "@/components/visualizers/templates/GraphTemplate";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseKruskalInput, generateKruskalSteps } from "./algorithm";
import { PerformancePanel, createMSTBenchmark } from "@/components/PerformancePanel";
import { getProblemById } from "@/data";

interface KruskalInput extends ProblemInput {
  input: string;
}

interface EdgeStatus {
  from: number;
  to: number;
  weight: number;
  status: "pending" | "current" | "selected" | "rejected";
}

interface NodeInfo {
  id: number;
  label: string;
  parent: number;
}

interface KruskalData {
  sortedEdges?: EdgeStatus[];
  selectedEdges?: { from: number; to: number; weight: number; isSelected?: boolean }[];
  nodes?: NodeInfo[];
  highlightedEdgeIdx?: number;
}

function KruskalVisualizer() {
  return (
    <ConfigurableVisualizer<KruskalInput, KruskalData>
      config={{
        defaultInput: {
          input: "4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 3",
        },
        algorithm: (input) => {
          return generateKruskalSteps(parseKruskalInput(input.input));
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
            label: "示例1",
            value: { input: "4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 3" },
          },
          {
            label: "示例2",
            value: { input: "5 7\n1 2 3\n1 5 1\n2 3 5\n2 5 4\n3 4 2\n3 5 6\n4 5 7" },
          },
        ],
        keyLines: [2,11,12,22,23,24,25,27],
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
                {variables.action === "selected" && (
                  <div className="text-sm col-span-2">
                    <span className="text-green-600 font-bold">✓ 选择</span>
                  </div>
                )}
                {variables.action === "rejected" && (
                  <div className="text-sm col-span-2">
                    <span className="text-red-600 font-bold">✗ 跳过（会形成环）</span>
                  </div>
                )}
              </div>
            );
          }
          return null;
        },
        render: ({ data }) => {
          const edgeList = data.sortedEdges || [];
          const selected = data.selectedEdges || [];
          const allNodes = data.nodes || [];

          // Build graph nodes
          const graphNodes: GraphNodeState[] = allNodes.map((n) => ({
            id: n.id,
            label: `${n.id}`,
            value: n.parent,
          }));

          // Build graph edges from selected + current
          const graphEdges: GraphEdgeState[] = [];
          const selectedSet = new Set(
            selected.map((e) => `${e.from}-${e.to}`)
          );

          for (const e of edgeList) {
            if (e.status === "selected" || selectedSet.has(`${e.from}-${e.to}`)) {
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
            }
          }

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea="按边权从小到大排序，依次检查每条边。若边的两端不在同一集合（并查集判断），则选择该边合并两集合。选满 n-1 条边即得 MST。"
                color="green"
                features={[
                  "时间复杂度 O(E log E)",
                  "空间复杂度 O(V+E)",
                  "并查集 + 路径压缩",
                  "稀疏图首选",
                ]}
              />


              {/* Edge list */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">边选择过程</h3>
                <div className="grid grid-cols-1 gap-1">
                  {edgeList.map((e, i) => {
                    let bgColor = "bg-gray-50 border-gray-200";
                    let emoji = "";
                    if (e.status === "selected") { bgColor = "bg-green-50 border-green-300"; emoji = "✓"; }
                    else if (e.status === "current") { bgColor = "bg-yellow-50 border-yellow-400"; emoji = "→"; }
                    else if (e.status === "rejected") { bgColor = "bg-red-50 border-red-200"; emoji = "✗"; }
                    return (
                      <div key={i} className={`flex items-center gap-3 px-3 py-1.5 border rounded text-sm ${bgColor}`}>
                        <span className="text-gray-400 w-6 text-right">{i + 1}.</span>
                        <span className="font-mono">({e.from}, {e.to})</span>
                        <span className="text-gray-500 font-mono text-xs">w={e.weight}</span>
                        {emoji && <span className="ml-auto font-bold">{emoji}</span>}
                      </div>
                    );
                  })}
                </div>

                {graphEdges.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">MST 图（已选边）</h3>
                    <GraphTemplate
                      nodes={graphNodes}
                      edges={graphEdges}
                      directed={false}
                      layout={{ type: "circle", nodeSize: 44, width: 650, height: 400 }}
                      renderNode={(node) => (
                        <div className="w-full h-full rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                          {node.label}
                        </div>
                      )}
                      renderLegend={() => (
                        <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-0.5 bg-green-400" />
                            <span className="text-gray-700">已选边</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-0.5 bg-yellow-400" />
                            <span className="text-gray-700">当前检查</span>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                )}

                <PerformancePanel
                  comparisons={getProblemById(201)?.solution?.comparisons || []}
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

export default KruskalVisualizer;
