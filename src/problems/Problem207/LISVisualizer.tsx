import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseLISInput, generateLISSteps } from "./algorithm";


interface LISInputData extends ProblemInput {
  input: string;
}

function LISVisualizer() {
  return (
    <ConfigurableVisualizer<LISInputData, any>
      config={{
        defaultInput: {
          input: "10 9 2 5 3 7 101 18",
        },
        algorithm: (input) => {
          return generateLISSteps(parseLISInput(input.input));
        },
        inputTypes: [{ type: "string", key: "input", label: "数组" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "数组（空格或逗号分隔）",
            placeholder: "10 9 2 5 3 7 101 18",
          },
        ],
        testCases: [
          {
            label: "示例1",
            value: { input: "10 9 2 5 3 7 101 18" },
          },
          {
            label: "示例2",
            value: { input: "0 1 0 3 2 3" },
          },
          {
            label: "示例3",
            value: { input: "7 7 7 7 7" },
          },
        ],
        keyLines: [3,8,9,12],
        customStepVariables: (variables) => {
          if (!variables || Object.keys(variables).length === 0) return null;
          return (
            <div className="grid grid-cols-2 gap-3">
              {variables.currentI !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-blue-600 font-semibold">i</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.currentI)}</span>
                  <span className="text-gray-400 ml-1">(值={variables.valI})</span>
                </div>
              )}
              {variables.currentJ !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-orange-600 font-semibold">j</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.currentJ)}</span>
                  <span className="text-gray-400 ml-1">(值={variables.valJ})</span>
                </div>
              )}
              {variables.dp_i !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-purple-600 font-semibold">dp[i]</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.dp_i)}</span>
                </div>
              )}
              {variables.maxLen !== undefined && (
                <div className="text-sm">
                  <span className="font-mono text-green-600 font-semibold">全局最大</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-bold">{String(variables.maxLen)}</span>
                </div>
              )}
              {variables.oldDp !== undefined && (
                <div className="text-sm col-span-2">
                  <span className="text-green-600 font-bold">
                    ↑ dp[{variables.currentI}]: {variables.oldDp} → {variables.newDp}
                  </span>
                </div>
              )}
              {variables.canExtend === false && (
                <div className="text-sm col-span-2">
                  <span className="text-red-500 font-medium">nums[j] ≥ nums[i]，不可拼接</span>
                </div>
              )}
            </div>
          );
        },
        render: ({ data }) => {
          const nums = data.nums || [];
          const dp = data.dp || [];
          const highlightI = data.highlightI ?? -1;
          const highlightJ = data.highlightJ ?? -1;
          const maxLen = data.maxLen ?? 1;
          const lis = data.lis || [];
          const updated = data.updated || false;
          const finished = data.finished || false;

          const maxDp = Math.max(...dp, 1);

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea="dp[i] = 以 nums[i] 结尾的最长递增子序列长度。对每个 i，检查所有 j < i：若 nums[j] < nums[i]，则 dp[i] = max(dp[i], dp[j] + 1)。"
                color="indigo"
                features={[
                  "时间复杂度 O(n²)",
                  "空间复杂度 O(n)",
                  "可用二分优化到 O(n log n)",
                  "prev 数组可回溯序列",
                ]}
              />


              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  LIS 动态规划过程
                </h3>

                {/* Array display with dp values */}
                <div className="flex items-end gap-1 mb-8 overflow-x-auto pb-2">
                  {nums.map((item: any, idx: number) => {
                    const isI = idx === highlightI;
                    const isJ = idx === highlightJ;
                    const isInLIS = finished && lis.includes(item.value);
                    const dpVal = dp[idx] || 1;
                    const height = Math.max((dpVal / maxDp) * 80, 8);

                    let barColor = "bg-gray-300";
                    if (isInLIS) barColor = "bg-green-500";
                    else if (isI) barColor = "bg-blue-500";
                    else if (isJ) barColor = "bg-orange-400";
                    else if (dpVal > 1) barColor = "bg-indigo-300";

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center" style={{ minWidth: 36 }}>
                        {/* dp value label */}
                        <span
                          className={`text-xs font-mono font-bold mb-1 px-1 rounded ${
                            updated && isI
                              ? "bg-green-100 text-green-700"
                              : isI
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-700"
                          }`}
                        >
                          dp={dpVal}
                        </span>
                        {/* bar */}
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${barColor}`}
                          style={{ height: `${height}px` }}
                        />
                        {/* index */}
                        <span className="text-[10px] text-gray-400 mt-0.5">{idx}</span>
                        {/* value */}
                        <span
                          className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded ${
                            isI
                              ? "bg-blue-100 text-blue-700 ring-2 ring-blue-400"
                              : isJ
                                ? "bg-orange-100 text-orange-700"
                                : isInLIS
                                  ? "bg-green-100 text-green-700"
                                  : "text-gray-700"
                          }`}
                        >
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 text-sm flex-wrap mb-6">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-gray-700">当前 i</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-orange-400 rounded" />
                    <span className="text-gray-700">比较 j</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-700">最终LIS序列</span>
                  </div>
                </div>

                {/* DP table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-gray-500 w-16">索引</th>
                        {nums.map((_: any, idx: number) => (
                          <th
                            key={idx}
                            className={`p-2 text-center min-w-[36px] ${
                              idx === highlightI
                                ? "bg-blue-100 text-blue-700"
                                : idx === highlightJ
                                  ? "bg-orange-100 text-orange-700"
                                  : "text-gray-500"
                            }`}
                          >
                            {idx}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2 text-gray-500">nums</td>
                        {nums.map((item: any, idx: number) => (
                          <td
                            key={idx}
                            className={`p-2 text-center font-bold ${
                              idx === highlightI
                                ? "bg-blue-100 text-blue-700"
                                : idx === highlightJ
                                  ? "bg-orange-100 text-orange-700"
                                  : "text-gray-800"
                            }`}
                          >
                            {item.value}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 text-indigo-600 font-bold">dp</td>
                        {dp.map((val: number, idx: number) => (
                          <td
                            key={idx}
                            className={`p-2 text-center font-bold ${
                              updated && idx === highlightI
                                ? "bg-green-100 text-green-700"
                                : idx === highlightI
                                  ? "bg-blue-100 text-blue-700"
                                  : val === maxLen
                                    ? "text-indigo-600"
                                    : "text-gray-700"
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Result */}
                {finished && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <span className="text-lg font-bold text-green-700">
                      LIS 长度 = {maxLen}，序列：[{lis.join(", ")}]
                    </span>
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

export default LISVisualizer;
