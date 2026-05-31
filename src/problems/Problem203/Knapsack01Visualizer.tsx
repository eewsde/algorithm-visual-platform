import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { parseKnapsackInput, generateKnapsackSteps } from "./algorithm";

interface KnapsackInput extends ProblemInput {
  input: string;
}

interface ItemInfo {
  weight: number;
  value: number;
}

interface KnapsackData {
  dp?: number[];
  itemIndex?: number;
  currentWeight?: number;
  currentValue?: number;
  currentCapacity?: number;
  capacity?: number;
  items?: ItemInfo[];
}

function Knapsack01Visualizer() {
  return (
    <ConfigurableVisualizer<KnapsackInput, KnapsackData>
      config={{
        defaultInput: {
          input: "70 3\n71 100\n69 1\n1 2",
        },
        algorithm: (input) => {
          return generateKnapsackSteps(parseKnapsackInput(input.input));
        },
        inputTypes: [{ type: "string", key: "input", label: "背包数据" }],
        inputFields: [
          {
            type: "string",
            key: "input",
            label: "数据（格式：T M，然后 M 行 weight value）",
            placeholder: "70 3\n71 100\n69 1\n1 2",
          },
        ],
        testCases: [
          {
            label: "P1048示例",
            value: { input: "70 3\n71 100\n69 1\n1 2" },
          },
          {
            label: "示例2",
            value: { input: "10 4\n2 3\n3 4\n4 5\n5 6" },
          },
        ],
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {variables.itemIndex !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-blue-600 font-semibold">物品</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">第{String(variables.itemIndex)}个</span>
                  </div>
                )}
                {variables.weight !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-purple-600 font-semibold">重量</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800">{String(variables.weight)}</span>
                  </div>
                )}
                {variables.value !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-orange-600 font-semibold">价值</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800">{String(variables.value)}</span>
                  </div>
                )}
                {variables.capacity !== undefined && (
                  <div className="text-sm">
                    <span className="font-mono text-teal-600 font-semibold">当前容量位</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-bold">{String(variables.capacity)}</span>
                  </div>
                )}
                {variables.newVal !== undefined && (
                  <div className="text-sm col-span-2">
                    <span className="text-green-600 font-bold">
                      dp[{String(variables.capacity)}] = {String(variables.newVal)}
                    </span>
                  </div>
                )}
              </div>
            );
          }
          return null;
        },
        render: ({ data }) => {
          const dp = data.dp || [];
          const capacity = data.capacity || 0;
          const items = data.items || [];
          const itemIndex = data.itemIndex ?? -1;
          const currentCap = data.currentCapacity ?? -1;

          const maxVal = Math.max(...dp, 1);

          return (
            <div className="p-4">
              <CoreIdeaBox
                idea="dp[j] = max(dp[j], dp[j-w[i]] + v[i])。逆序遍历容量j（从大到小），保证每个物品只考虑一次。顺序遍历会变成完全背包。"
                color="amber"
                features={[
                  "时间复杂度 O(M×T)",
                  "空间复杂度 O(T)",
                  "逆序遍历（01背包关键）",
                  "每个物品选或不选",
                ]}
              />

              {/* Items list */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  物品列表（容量={capacity}）
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        i === itemIndex
                          ? "bg-blue-100 border-blue-400 shadow-sm"
                          : i < itemIndex
                          ? "bg-gray-100 border-gray-300 text-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <span className="font-bold">物品{i + 1}</span>
                      <span className="text-gray-500 ml-2">
                        w={item.weight} v={item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* DP array visualization as bar chart */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  dp 数组（最优价值）
                </h3>
                <div className="relative border border-gray-200 rounded-lg bg-gray-50 p-3">
                  <div className="flex items-end gap-0.5" style={{ minHeight: 120 }}>
                    {dp.map((val, j) => {
                      const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
                      return (
                        <div
                          key={j}
                          className="flex-1 flex flex-col items-center"
                          style={{ minWidth: 0 }}
                        >
                          <span className="text-[10px] font-mono text-gray-700 mb-1">
                            {val}
                          </span>
                          <div
                            className={`w-full rounded-t transition-all duration-300 ${
                              j === currentCap
                                ? "bg-green-500"
                                : itemIndex >= 0 && j >= (items[itemIndex]?.weight || 0)
                                ? "bg-blue-400"
                                : "bg-gray-300"
                            }`}
                            style={{ height: `${Math.max(height, 2)}px` }}
                          />
                          <span className="text-[9px] text-gray-400 mt-1">{j}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-gray-300 rounded" />
                    <span className="text-gray-600">未更新</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-blue-400 rounded" />
                    <span className="text-gray-600">物品可放入区域</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-600">当前更新位置</span>
                  </div>
                </div>

                {/* Final result */}
                {itemIndex >= items.length && items.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <span className="text-lg font-bold text-green-700">
                      最优解：dp[{capacity}] = {dp[capacity]}
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

export default Knapsack01Visualizer;
