import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseFloydInput, generateFloydSteps } from "./algorithm";

interface FloydInput extends ProblemInput {
  input: string;
}

interface FloydData {
  matrix?: number[][];
  k?: number;
  i?: number;
  j?: number;
  n?: number;
}

const INF = Infinity;

function FloydVisualizer() {
  return (
    <ConfigurableVisualizer<FloydInput, FloydData>
      config={{
        defaultInput: {
          input: "3\n0 1 0\n0 0 1\n0 0 0",
        },
        algorithm: (input) => {
          return generateFloydSteps(parseFloydInput(input.input));
        },
        inputTypes: [{ type: "string", key: "input", label: "邻接矩阵" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "邻接矩阵（第一行 n，接下来 n 行），0 表示无边",
            placeholder: "3\n0 1 0\n0 0 1\n0 0 0",
          },
        ],
        testCases: [
          {
            label: "示例1",
            value: { input: "3\n0 1 0\n0 0 1\n0 0 0" },
          },
          {
            label: "示例2",
            value: { input: "4\n0 3 0 7\n8 0 2 0\n5 0 0 1\n2 0 0 0" },
          },
        ],
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="flex flex-wrap gap-3">
                {variables.k !== undefined && String(variables.k) !== "-1" && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                    中间节点 k = {String(variables.k)}
                  </span>
                )}
                {variables.i !== undefined && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    i = {String(variables.i)}
                  </span>
                )}
                {variables.j !== undefined && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    j = {String(variables.j)}
                  </span>
                )}
                {variables.oldDist !== undefined && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    旧值: {String(variables.oldDist)}
                  </span>
                )}
                {variables.newDist !== undefined && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    新值: {String(variables.newDist)}
                  </span>
                )}
              </div>
            );
          }
          return null;
        },
        render: ({ data }) => {
          const matrix = data.matrix || [];
          const n = data.n || matrix.length;
          const k = data.k ?? -1;

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea="dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])，三重循环，k 在最外层。DP思想：每次尝试以节点k为中转来缩短i→j的路径。"
                color="indigo"
                features={[
                  "时间复杂度 O(n³)",
                  "空间复杂度 O(n²)",
                  "可求全源最短路径",
                  "可处理负权边（无负环）",
                ]}
              />

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  距离矩阵 {k >= 0 && k < n && <span className="text-purple-600">(尝试以节点 {k + 1} 为中转)</span>}
                </h3>

                <div className="overflow-x-auto">
                  <table className="border-collapse border border-gray-300 text-sm mx-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-1 w-10"></th>
                        {Array.from({ length: n }, (_, j) => (
                          <th key={j} className="border border-gray-300 px-3 py-1 text-center font-mono font-bold text-gray-600">
                            {j + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.map((row, i) => (
                        <tr key={i}>
                          <td className="border border-gray-300 px-2 py-1 bg-gray-100 font-mono font-bold text-gray-600 text-center">
                            {i + 1}
                          </td>
                          {row.map((val, j) => {
                            const isHighlighted =
                              data.i === i && data.j === j && k >= 0;
                            const isKRowOrCol =
                              k >= 0 && (i === k || j === k) && !(i === k && j === k);
                            const isDiag = i === j;

                            let bgColor = "";
                            if (isHighlighted) {
                              bgColor = "bg-green-200 font-extrabold";
                            } else if (isKRowOrCol && k >= 0) {
                              bgColor = "bg-purple-100";
                            } else if (isDiag) {
                              bgColor = "bg-gray-100";
                            }

                            return (
                              <td
                                key={j}
                                className={`border border-gray-300 px-3 py-2 text-center font-mono text-sm transition-colors duration-300 ${bgColor} ${
                                  val === INF ? "text-gray-400" : "text-gray-800"
                                }`}
                              >
                                {val === INF ? "∞" : val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-purple-100 border border-purple-300" />
                    <span className="text-gray-600">中转节点k的行/列</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-green-200 border border-green-400" />
                    <span className="text-gray-600">正在更新</span>
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

export default FloydVisualizer;
