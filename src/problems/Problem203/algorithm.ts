import { VisualizationStep } from "@/types";

export function parseKnapsackInput(input: string): { capacity: number; items: [number, number][] } {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) {
    throw new Error("请输入背包容量和物品数据");
  }
  const firstLine = lines[0].trim().split(/\s+/);
  // 容量必须为整数且 1 ≤ capacity ≤ 1000
  const capacity = Number(firstLine[0]);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000) {
    throw new Error("容量必须是 1~1000 的整数");
  }
  const m = parseInt(firstLine[1]);
  if (m > 50) {
    throw new Error("物品数最多 50");
  }
  const items: [number, number][] = [];
  for (let i = 1; i <= m && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 2) {
      // 每个物品的重量/价值必须是有限数且 ≥ 0（NaN/负数直接报错）
      const weight = Number(parts[0]);
      const value = Number(parts[1]);
      if (!Number.isFinite(weight) || !Number.isFinite(value) || weight < 0 || value < 0) {
        throw new Error(`物品${i}的重量和价值必须是非负数字`);
      }
      items.push([weight, value]);
    }
  }
  return { capacity, items };
}

export function generateKnapsackSteps(data: {
  capacity: number;
  items: [number, number][];
}): VisualizationStep[] {
  const { capacity, items } = data;
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const n = items.length;

  const dp: number[] = new Array(capacity + 1).fill(0);

  steps.push({
    id: stepId++,
    description: `初始化：背包容量=${capacity}，共${n}个物品。dp数组全部为0。`,
    data: {
      dp: [...dp],
      itemIndex: -1,
      capacity,
      items: items.map(([w, v]) => ({ weight: w, value: v })),
    },
    variables: { itemIndex: -1, phase: "init", n, capacity },
  });

  for (let i = 0; i < n; i++) {
    const [weight, value] = items[i];

    steps.push({
      id: stepId++,
      description: `考虑物品${i + 1}：重量=${weight}，价值=${value}`,
      data: {
        dp: [...dp],
        itemIndex: i,
        currentWeight: weight,
        currentValue: value,
        capacity,
        items: items.map(([w, val]) => ({ weight: w, value: val })),
      },
      variables: { itemIndex: i + 1, weight, value, phase: "consider" },
    });

    // Backward iteration (01 knapsack)
    for (let j = capacity; j >= weight; j--) {
      if (dp[j - weight] + value > dp[j]) {
        const oldVal = dp[j];
        dp[j] = dp[j - weight] + value;

        steps.push({
          id: stepId++,
          description: `更新！容量${j}：dp[${j}] = max(${oldVal}, dp[${j - weight}]+${value}) = dp[${j - weight}]+${value} = ${dp[j]}`,
          data: {
            dp: [...dp],
            itemIndex: i,
            currentWeight: weight,
            currentValue: value,
            currentCapacity: j,
            capacity,
            items: items.map(([w, val]) => ({ weight: w, value: val })),
          },
          variables: {
            itemIndex: i + 1,
            capacity: j,
            oldVal,
            newVal: dp[j],
            weight,
            value,
            phase: "update",
          },
        });
      }
    }

    // Show items that couldn't be updated because capacity < weight
    if (weight > capacity) {
      steps.push({
        id: stepId++,
        description: `物品${i + 1}重量(${weight})超过背包容量(${capacity})，无法放入。`,
        data: {
          dp: [...dp],
          itemIndex: i,
          currentWeight: weight,
          currentValue: value,
          capacity,
          items: items.map(([w, val]) => ({ weight: w, value: val })),
        },
        variables: {
          itemIndex: i + 1,
          weight,
          phase: "skip-heavy",
        },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `01背包完成！dp[${capacity}] = ${dp[capacity]} 即最大总价值。`,
    data: {
      dp: [...dp],
      itemIndex: n,
      capacity,
      items: items.map(([w, v]) => ({ weight: w, value: v })),
    },
    variables: { phase: "done", result: dp[capacity], n, capacity },
  });

  return steps;
}
