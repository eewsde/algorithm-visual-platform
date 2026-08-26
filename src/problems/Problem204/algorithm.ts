import { VisualizationStep } from "@/types";

export interface PrimEdge {
  from: number;
  to: number;
  weight: number;
  // 输入顺序编号（0-based），用于区分平行边/双向重复边
  index: number;
}

export interface PrimInput {
  nodes: number;
  edges: PrimEdge[];
}

export function parsePrimInput(input: string): PrimInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) {
    throw new Error("请输入图数据");
  }
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);
  if (isNaN(n) || isNaN(m)) {
    throw new Error("n、m 必须为整数");
  }
  if (n < 1) {
    throw new Error("节点数 n 必须 ≥ 1");
  }
  if (n > 200 || m > 5000) {
    throw new Error("规模过大：节点数最多 200、边数最多 5000，以保证可视化流畅");
  }

  const edges: PrimEdge[] = [];
  let edgeIndex = 0;
  for (let i = 1; i <= m && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 3) {
      const from = parseInt(parts[0]);
      const to = parseInt(parts[1]);
      const weight = parseInt(parts[2]);
      if (isNaN(from) || isNaN(to) || isNaN(weight)) {
        throw new Error("边数据格式错误");
      }
      // 端点必须在 [1, n]，否则后面的 adj.get(e.from)! 会崩溃
      if (from < 1 || from > n || to < 1 || to > n) {
        throw new Error("边端点编号超出范围");
      }
      edges.push({ from, to, weight, index: edgeIndex++ });
    }
  }
  return { nodes: n, edges };
}

export function generatePrimSteps(input: PrimInput): VisualizationStep[] {
  const { nodes, edges } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const adj: Map<number, { to: number; weight: number; index: number }[]> = new Map();
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)!.push({ to: e.to, weight: e.weight, index: e.index });
    adj.get(e.to)!.push({ to: e.from, weight: e.weight, index: e.index });
  }

  const inMST = new Array(nodes + 1).fill(false);
  const selectedEdges: PrimEdge[] = [];
  let totalWeight = 0;

  inMST[1] = true;

  steps.push({
    id: stepId++,
    description: `初始化：从节点1开始构建最小生成树。节点1加入已选集合，其余节点待加入。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        inMST: inMST[i + 1],
      })),
      edges: edges.map((e) => ({ ...e, status: "pending" as const })),
      totalWeight: 0,
      selectedCount: 0,
    },
    variables: { totalWeight: 0, selectedCount: 0 },
  });

  for (let iter = 0; iter < nodes - 1; iter++) {
    const candidates: { from: number; to: number; weight: number; index: number }[] = [];
    for (let u = 1; u <= nodes; u++) {
      if (!inMST[u]) continue;
      for (const { to: v, weight: w, index } of adj.get(u)!) {
        if (!inMST[v]) {
          candidates.push({ from: u, to: v, weight: w, index });
        }
      }
    }

    if (candidates.length === 0) break;

    // 线性扫描找最小权边（O(E)），避免排序退化到 O(E log E)
    let best = candidates[0];
    for (let k = 1; k < candidates.length; k++) {
      if (candidates[k].weight < best.weight) best = candidates[k];
    }

    // 已选边与候选边均按 index 匹配（避免平行边/双向重复边按 from-to 值匹配出错）
    const selectedIndexSet = new Set(selectedEdges.map((s) => s.index));
    const candidateIndexSet = new Set(candidates.map((c) => c.index));

    steps.push({
      id: stepId++,
      description: `第 ${iter + 1} 步：扫描候选边（已选→未选），共 ${candidates.length} 条。最小权边：(${best.from}, ${best.to}) 权值=${best.weight}`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          inMST: inMST[i + 1],
          isCurrent: i + 1 === best.to,
        })),
        edges: edges.map((e) => {
          if (selectedIndexSet.has(e.index)) {
            return { ...e, status: "selected" as const };
          }
          if (e.index === best.index) {
            return { ...e, status: "current" as const };
          }
          if (candidateIndexSet.has(e.index)) {
            return { ...e, status: "candidate" as const };
          }
          return { ...e, status: "pending" as const };
        }),
        totalWeight,
        selectedCount: selectedEdges.length,
      },
      variables: {
        candidateCount: candidates.length,
        currentFrom: best.from,
        currentTo: best.to,
        currentWeight: best.weight,
        totalWeight,
        selectedCount: selectedEdges.length,
      },
    });

    inMST[best.to] = true;
    selectedEdges.push({ from: best.from, to: best.to, weight: best.weight, index: best.index });
    totalWeight += best.weight;

    // 选择后重新计算已选 index 集合（包含刚选入的边）
    const newSelectedIndexSet = new Set(selectedEdges.map((s) => s.index));

    steps.push({
      id: stepId++,
      description: `✓ 选择边 (${best.from}, ${best.to}) 权值=${best.weight}。节点 ${best.to} 加入 MST。累计权重 = ${totalWeight}`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          inMST: inMST[i + 1],
        })),
        edges: edges.map((e) => {
          if (newSelectedIndexSet.has(e.index)) {
            return { ...e, status: "selected" as const };
          }
          return { ...e, status: "pending" as const };
        }),
        totalWeight,
        selectedCount: selectedEdges.length,
      },
      variables: {
        currentFrom: best.from,
        currentTo: best.to,
        currentWeight: best.weight,
        totalWeight,
        selectedCount: selectedEdges.length,
        action: "selected",
      },
    });
  }

  const isConnected = selectedEdges.length === nodes - 1;

  steps.push({
    id: stepId++,
    description: isConnected
      ? `Prim 算法完成！最小生成树包含 ${selectedEdges.length} 条边，总权重 = ${totalWeight}`
      : `图不连通！只选出了 ${selectedEdges.length} 条边（需要 ${nodes - 1} 条），输出 orz`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        inMST: inMST[i + 1],
      })),
      edges: edges.map((e) => {
        if (selectedEdges.some((s) => s.index === e.index)) {
          return { ...e, status: "selected" as const };
        }
        return { ...e, status: "pending" as const };
      }),
      totalWeight,
      selectedCount: selectedEdges.length,
    },
    variables: {
      totalWeight,
      selectedCount: selectedEdges.length,
      isConnected,
    },
  });

  return steps;
}
