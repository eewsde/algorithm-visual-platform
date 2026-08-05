import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseLCSInput, generateLCSSteps } from "./algorithm";


interface LCSInputData extends ProblemInput {
  input: string;
}

function LCSVisualizer() {
  return (
    <ConfigurableVisualizer<LCSInputData, any>
      config={{
        defaultInput: {
          input: "abcde\nace",
        },
        algorithm: (input) => {
          return generateLCSSteps(parseLCSInput(input.input));
        },
        inputTypes: [{ type: "string", key: "input", label: "两个字符串" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "两个字符串（空格分隔或分两行）",
            placeholder: "abcde ace",
          },
        ],
        testCases: [
          {
            label: "示例1",
            value: { input: "abcde\nace" },
          },
          {
            label: "示例2",
            value: { input: "abc\nabc" },
          },
          {
            label: "示例2b（不匹配）",
            value: { input: "abc\ndef" },
          },
          {
            label: "示例3（长串）",
            value: { input: "AGGTAB\nGXTXAYB" },
          },
        ],
        keyLines: [5,8,9,11,13],
        customStepVariables: (variables) => {
          if (!variables || Object.keys(variables).length === 0) return null;
          return (
            <div className="grid grid-cols-2 gap-3">
              {variables.i !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-blue-600 font-semibold">i</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.i)}</span>
                  {variables.char1 && (
                    <span className="text-gray-400 ml-1">(char='{variables.char1}')</span>
                  )}
                </div>
              )}
              {variables.j !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-orange-600 font-semibold">j</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.j)}</span>
                  {variables.char2 && (
                    <span className="text-gray-400 ml-1">(char='{variables.char2}')</span>
                  )}
                </div>
              )}
              {variables.dpVal !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-purple-600 font-semibold">dp[i][j]</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.dpVal)}</span>
                </div>
              )}
              {variables.lcsLength !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-green-600 font-semibold">LCS长度</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.lcsLength)}</span>
                </div>
              )}
              {variables.match !== undefined && (
                <div className="text-sm col-span-2">
                  {variables.match ? (
                    <span className="text-green-600 font-bold">✓ 字符匹配 → 左上+1</span>
                  ) : (
                    <span className="text-red-500 font-medium">✗ 不匹配 → max(上, 左)</span>
                  )}
                </div>
              )}
            </div>
          );
        },
        render: ({ data }) => {
          const text1: string[] = data.text1 || [];
          const text2: string[] = data.text2 || [];
          const dp: number[][] = data.dp || [];
          const highlightI = data.highlightI ?? -1;
          const highlightJ = data.highlightJ ?? -1;
          const match = data.match ?? false;
          const updated = data.updated || false;
          const lcs = data.lcs || "";
          const backtrackPath: [number, number][] = data.backtrackPath || [];
          const finished = data.finished || false;

          const backtrackSet = new Set(backtrackPath.map(([r, c]) => `${r},${c}`));
          const m = text1.length;
          const n = text2.length;
          const cellSize = Math.min(40, Math.max(28, 600 / Math.max(m + 1, n + 1, 8)));

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea='dp[i][j] = text1[0..i-1] 与 text2[0..j-1] 的LCS长度。字符相同时 dp[i][j] = dp[i-1][j-1] + 1；否则 dp[i][j] = max(dp[i-1][j], dp[i][j-1])。'
                color="purple"
                features={[
                  "时间复杂度 O(m×n)",
                  "空间复杂度 O(m×n)，可优化到 O(min(m,n))",
                  "经典二维DP",
                  "回溯可得LCS序列",
                ]}
              />


              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  LCS DP 表
                </h3>

                {/* Strings display */}
                <div className="mb-4 flex items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-700">text1:</span>
                  <span className="font-mono text-gray-800">
                    {text1.map((ch: string, idx: number) => (
                      <span
                        key={idx}
                        className={`inline-block w-7 h-7 leading-7 text-center rounded ${
                          idx === highlightI - 1 && highlightI > 0
                            ? "bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-400"
                            : "bg-gray-100"
                        }`}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="mb-6 flex items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-700">text2:</span>
                  <span className="font-mono text-gray-800">
                    {text2.map((ch: string, idx: number) => (
                      <span
                        key={idx}
                        className={`inline-block w-7 h-7 leading-7 text-center rounded ${
                          idx === highlightJ - 1 && highlightJ > 0
                            ? "bg-orange-100 text-orange-700 font-bold ring-2 ring-orange-400"
                            : "bg-gray-100"
                        }`}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </div>

                {/* DP Table */}
                <div className="overflow-auto max-h-[360px] border border-gray-200 rounded-lg">
                  <table className="border-collapse text-xs font-mono" style={{ minWidth: (n + 1) * cellSize }}>
                    <thead>
                      <tr>
                        <th
                          className="sticky top-0 bg-gray-100 border border-gray-200 text-gray-500 p-1"
                          style={{ width: cellSize }}
                        >
                          Ø
                        </th>
                        <th
                          className="sticky top-0 bg-gray-100 border border-gray-200 text-gray-500 p-1"
                          style={{ width: cellSize }}
                        >
                          Ø
                        </th>
                        {text2.map((ch: string, j: number) => (
                          <th
                            key={j}
                            className={`sticky top-0 border border-gray-200 p-1 ${
                              j + 1 === highlightJ && highlightJ > 0
                                ? "bg-orange-100 text-orange-700 font-bold"
                                : "bg-gray-100 text-gray-500"
                            }`}
                            style={{ width: cellSize }}
                          >
                            {ch}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 0 */}
                      <tr>
                        <td className="bg-gray-100 border border-gray-200 text-gray-400 p-1 text-center">Ø</td>
                        {dp[0]?.map((val: number, j: number) => (
                          <td
                            key={j}
                            className={`border border-gray-200 p-1 text-center ${
                              highlightI === 0 && highlightJ === j
                                ? "bg-green-200 font-bold"
                                : backtrackSet.has(`0,${j}`) && finished
                                  ? "bg-green-100"
                                  : "bg-gray-50 text-gray-400"
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                      {/* Data rows */}
                      {dp.slice(1).map((row: number[], ri: number) => {
                        const i = ri + 1;
                        return (
                          <tr key={i}>
                            <td
                              className={`border border-gray-200 p-1 text-center font-bold ${
                                i === highlightI
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {text1[i - 1]}
                            </td>
                            {row.map((val: number, j: number) => {
                              const isCurrent = i === highlightI && j === highlightJ;
                              const isUpdated = isCurrent && updated;
                              const onPath = backtrackSet.has(`${i},${j}`) && finished;
                              const isCorner = isCurrent && match;

                              let bg = "bg-white";
                              if (isUpdated) bg = "bg-green-200";
                              else if (isCorner) bg = "bg-green-100";
                              else if (isCurrent) bg = "bg-yellow-100";
                              else if (onPath) bg = "bg-green-50";

                              return (
                                <td
                                  key={j}
                                  className={`border border-gray-200 p-1 text-center transition-colors ${bg} ${
                                    isCurrent ? "ring-2 ring-yellow-400 font-bold" : ""
                                  } ${onPath ? "ring-1 ring-green-400" : ""}`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Result */}
                {finished && (
                  <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-lg text-center">
                    <p className="text-lg font-bold text-violet-700">
                      LCS = "{lcs}"，长度 = {lcs.length}
                    </p>
                    <p className="text-sm text-violet-500 mt-1">
                      绿色高亮路径 = 回溯路径（从右下角沿匹配字符斜上移动）
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default LCSVisualizer;
