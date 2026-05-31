import { VisualizationStep } from "@/types";

export function parseFloydInput(input: string): number[][] {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  const n = parseInt(lines[0].trim());
  const matrix: number[][] = [];
  for (let i = 1; i <= n && i < lines.length; i++) {
    matrix.push(lines[i].trim().split(/\s+/).map(Number));
  }
  return matrix;
}

export function generateFloydSteps(matrix: number[][]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const n = matrix.length;
  const INF = Infinity;

  // Deep copy
  const dist: number[][] = matrix.map((row) =>
    row.map((v) => (v === 0 ? INF : v))
  );
  for (let i = 0; i < n; i++) dist[i][i] = 0;

  steps.push({
    id: stepId++,
    description: `初始化距离矩阵（${n}×${n}）。dist[i][i]=0，无边记为∞。`,
    data: {
      matrix: dist.map((row) => [...row]),
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
        matrix: dist.map((row) => [...row]),
        k,
        n,
      },
      variables: { phase: "select-k", k: k + 1 },
    });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== INF && dist[k][j] !== INF && dist[i][k] + dist[k][j] < dist[i][j]) {
          const old = dist[i][j];
          dist[i][j] = dist[i][k] + dist[k][j];
          updated = true;

          steps.push({
            id: stepId++,
            description: `更新！dist[${i + 1}][${j + 1}] = min(${old === INF ? "∞" : old}, ${dist[i][k]} + ${dist[k][j]}) = ${dist[i][j]}（经节点${k + 1}中转）`,
            data: {
              matrix: dist.map((row) => [...row]),
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
              oldDist: old === INF ? "∞" : old,
              newDist: dist[i][j],
            },
            highlightedNodes: [`${i + 1}`, `${j + 1}`, `${k + 1}`],
          });
        }
      }
    }

    if (!updated) {
      steps.push({
        id: stepId++,
        description: `以节点 ${k + 1} 为中转，没有发现更短的路径。`,
        data: {
          matrix: dist.map((row) => [...row]),
          k,
          n,
        },
        variables: { phase: "no-update", k: k + 1 },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: "Floyd 算法完成！矩阵已包含所有节点对的最短距离。",
    data: {
      matrix: dist.map((row) => [...row]),
      k: n,
      n,
    },
    variables: { phase: "done", n },
  });

  return steps;
}
