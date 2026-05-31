import { VisualizationStep } from "@/types";

export function parseKnapsackInput(input: string): { capacity: number; items: [number, number][] } {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  const firstLine = lines[0].trim().split(/\s+/);
  const capacity = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);
  const items: [number, number][] = [];
  for (let i = 1; i <= m && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 2) {
      items.push([parseInt(parts[0]), parseInt(parts[1])]);
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
