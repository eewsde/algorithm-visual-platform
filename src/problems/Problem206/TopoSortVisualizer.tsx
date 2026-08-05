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
          input: "6 7\n1 2\n1 3\n2 4\n3 4\n4 5\n5 6\n3 6",
        },
        algorithm: (input) => {
          return generateTopoSteps(parseTopoInput(input.input));
        },
        inputTypes: [{ type: "string", key: "input", label: "图数据" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "图数据（格式：n m，然后 m 行 u v，表示 u→v 的有向边）",
            placeholder: "6 7\n1 2\n1 3\n2 4\n3 4\n4 5\n5 6\n3 6",
          },
        ],
        testCases: [
          {
            label: "示例1（DAG）",
            value: { input: "6 7\n1 2\n1 3\n2 4\n3 4\n4 5\n5 6\n3 6" },
          },
          {
            label: "示例2（多起点）",
            value: { input: "5 4\n1 3\n2 3\n3 4\n3 5" },
          },
          {
            label: "示例3（有环·不可排）",
            value: { input: "4 4\n1 2\n2 3\n3 4\n4 2" },
          },
        ],
        keyLines: [10,11,16,18,19,20],
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
              {variables.targetNode !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-purple-600 font-semibold">目标节点</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.targetNode)}</span>
                </div>
              )}
              {variables.newInDegree !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-orange-600 font-semibold">新入度</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.newInDegree)}</span>
                </div>
              )}
              {variables.enqueuedNode !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-green-600 font-semibold">入队节点</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.enqueuedNode)}</span>
                </div>
              )}
              {variables.processed !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-cyan-600 font-semibold">已处理</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">
                    {String(variables.processed)}/{String(variables.totalNodes)}
                  </span>
                </div>
              )}
              {variables.hasCycle && (
                <div className="text-sm col-span-2">
                  <span className="text-red-600 font-bold">⚠ 检测到环！无法完成拓扑排序</span>
                </div>
              )}
            </div>
          );
        },
        render: ({ data }) => {
          const nodeList = data.nodes || [];
          const edgeList = data.edges || [];
          const queueContent = data.queue || [];
          const result = data.result || [];

          const graphNodes: GraphNodeState[] = nodeList.map((n: any) => ({
            id: n.id,
            label: `${n.id}`,
            value: n.inDegree ?? 0,
            isCurrent: n.state === "current",
            isVisited: n.state === "visited",
            isInQueue: n.state === "in_queue",
            customState: { state: n.state, inDegree: n.inDegree },
          }));

          const graphEdges: GraphEdgeState[] = edgeList.map((e: any) => ({
            from: e.from,
            to: e.to,
            isCurrent: e.type === "current",
          }));

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea="计算每个节点的入度（有多少条边指向它）。将入度为0的节点入队，依次出队并删除其所有出边（邻居入度-1），新入度为0的节点入队。重复直到队列为空。若未处理完所有节点则存在环。"
                color="purple"
                features={[
                  "时间复杂度 O(V+E)",
                  "空间复杂度 O(V+E)",
                  "Kahn算法（BFS实现）",
                  "可检测有向图中的环",
                  "应用：任务调度、依赖解析、编译顺序",
                ]}
              />


              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    拓扑排序过程
                  </h3>
                  <span className="text-sm text-gray-500">
                    序列：<span className="font-mono text-gray-800 font-bold">{result.join(" → ") || "—"}</span>
                  </span>
                </div>

                <GraphTemplate
                  nodes={graphNodes}
                  edges={graphEdges}
                  directed={true}
                  layout={{ type: "hierarchical", nodeSize: 48, width: 700, height: 380 }}
                  renderNode={(node) => {
                    const state = (node as any).customState?.state || "unvisited";
                    const inDeg = (node as any).customState?.inDegree ?? 0;
                    let bgColor = "bg-gray-300 text-gray-600";
                    if (state === "current") bgColor = "bg-yellow-400 text-white shadow-lg";
                    else if (state === "visited") bgColor = "bg-emerald-500 text-white";
                    else if (state === "in_queue") bgColor = "bg-cyan-400 text-white";

                    return (
                      <div className="relative w-full h-full">
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center text-sm font-bold transition-all ${bgColor}`}
                        >
                          {node.label}
                        </div>
                        {(inDeg > 0 || state === "in_queue") && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                            {inDeg}
                          </span>
                        )}
                      </div>
                    );
                  }}
                  renderLegend={() => (
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-gray-700">未访问</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        <span className="text-gray-700">入度为0（队列中）</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-700">已处理</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="text-gray-700">当前节点</span>
                      </div>
                    </div>
                  )}
                />

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {/* Queue */}
                  <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <span className="text-sm font-semibold text-cyan-700">
                      队列（入度=0）：
                    </span>
                    <span className="font-mono text-sm text-gray-800 ml-2">
                      [{queueContent.join(", ") || "空"}]
                    </span>
                  </div>

                  {/* In-degree display */}
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-sm font-semibold text-gray-700">
                      各节点入度：
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {nodeList.map((n: any) => (
                        <span
                          key={n.id}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-mono ${
                            n.state === "visited"
                              ? "bg-emerald-100 text-emerald-700"
                              : n.state === "in_queue"
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {n.id}:{n.inDegree ?? 0}
                        </span>
                      ))}
                    </div>
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
