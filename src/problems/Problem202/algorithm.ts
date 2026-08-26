import { VisualizationStep } from "@/types";

/**
 * 解析传递闭包输入：第一行 n，接下来 n 行 n 列的 0/1 邻接矩阵
 * 1 表示有直接边，0 表示无边（自己可达自己的对角线在算法中自动置 1）
 */
export function parseFloydInput(input: string): number[][] {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) {
    throw new Error("请输入图数据");
  }
  const n = parseInt(lines[0].trim());
  if (isNaN(n) || n <= 0) {
    throw new Error("输入必须是 n×n 的方阵");
  }
  if (n > 25) {
    throw new Error("节点数最多 25，否则步骤量过大会卡死页面");
  }
  if (lines.length < n + 1) {
    throw new Error("输入必须是 n×n 的方阵");
  }

  const matrix: number[][] = [];
  for (let i = 1; i <= n; i++) {
    const row = lines[i].trim().split(/\s+/).map(Number);
    // 传递闭包输入是 0/1 矩阵：每行必须是 n 个数，且只能为 0 或 1
    if (
      row.length !== n ||
      row.some((v) => isNaN(v) || !isFinite(v) || (v !== 0 && v !== 1))
    ) {
      throw new Error("传递闭包输入必须是 n×n 的 0/1 矩阵");
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * 生成传递闭包（Floyd-Warshall 布尔版）的可视化步骤：
 * reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])
 */
export function generateFloydSteps(matrix: number[][]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const n = matrix.length;

  // Deep copy
  const reach: number[][] = matrix.map((row) => [...row]);
  // 注意：对角线不预先置 1——只有节点在环上时才能"间接到达自己"
  // （b[i][i] 会在三重循环中经环自动变为 1，与官方定义一致）

  steps.push({
    id: stepId++,
    description: `初始化可达矩阵（${n}×${n}）：直接边为 1，其余为 0。`,
    data: {
      matrix: reach.map((row) => [...row]),
      k: -1,
      n,
    },
    variables: { phase: "init", n },
  });

  for (let k = 0; k < n; k++) {
    let updated = false;

    steps.push({
      id: stepId++,
      description: `第 ${k + 1} 轮：尝试以节点 ${k + 1} 为中间节点`,
      data: {
        matrix: reach.map((row) => [...row]),
        k,
        n,
      },
      variables: { phase: "select-k", k: k + 1 },
    });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!reach[i][j] && reach[i][k] && reach[k][j]) {
          reach[i][j] = 1;
          updated = true;

          steps.push({
            id: stepId++,
            description: `更新！节点 ${i + 1} 可经 ${k + 1} 到达 ${j + 1}，reach[${i + 1}][${j + 1}] = 1${
              i === k || j === k ? `（k=${k + 1} 为端点，不构成中转）` : `（经节点${k + 1}中转）`
            }`,
            data: {
              matrix: reach.map((row) => [...row]),
              k,
              i,
              j,
              n,
            },
            variables: {
              phase: "update",
              k: k + 1,
              i: i + 1,
              j: j + 1,
              oldDist: 0,
              newDist: 1,
            },
            highlightedNodes: [`${i + 1}`, `${j + 1}`, `${k + 1}`],
          });
        }
      }
    }

    if (!updated) {
      steps.push({
        id: stepId++,
        description: `以节点 ${k + 1} 为中转，没有发现新的可达关系。`,
        data: {
          matrix: reach.map((row) => [...row]),
          k,
          n,
        },
        variables: { phase: "no-update", k: k + 1 },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: "传递闭包完成！矩阵中 1 表示从 i 可以到达 j。",
    data: {
      matrix: reach.map((row) => [...row]),
      k: n,
      n,
    },
    variables: { phase: "done", n },
  });

  return steps;
}
