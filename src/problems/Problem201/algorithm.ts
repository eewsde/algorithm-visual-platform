import { VisualizationStep } from "@/types";

export interface KruskalEdge {
  from: number;
  to: number;
  weight: number;
  // 输入顺序编号（0-based），用于区分平行边
  index: number;
}

// 步骤快照中已选边的形态：在原始边上附加选中标记
export interface SelectedEdge extends KruskalEdge {
  isSelected: boolean;
}

export interface KruskalInput {
  nodes: number;
  edges: KruskalEdge[];
}

export function parseKruskalInput(input: string): KruskalInput {
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
  if (n > 500 || m > 5000) {
    throw new Error("规模过大：节点数最多 500、边数最多 5000，以保证可视化流畅");
  }

  const edges: KruskalEdge[] = [];
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
      if (from < 1 || from > n || to < 1 || to > n) {
        throw new Error("边端点编号超出范围");
      }
      edges.push({ from, to, weight, index: edgeIndex++ });
    }
  }
  return { nodes: n, edges };
}

export function generateKruskalSteps(input: KruskalInput): VisualizationStep[] {
  const { nodes, edges } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // Sort edges
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  // Union-Find
  const parent = Array.from({ length: nodes + 1 }, (_, i) => i);
  const rank = Array(nodes + 1).fill(0);

  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(x: number, y: number): boolean {
    const px = find(x);
    const py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) {
      parent[px] = py;
    } else if (rank[px] > rank[py]) {
      parent[py] = px;
    } else {
      parent[py] = px;
      rank[px]++;
    }
    return true;
  }

  const selectedEdges: KruskalEdge[] = [];
  // 已检查（尝试过）的边 index 集合：提前 break 后，从未检查的边应标记为 pending 而非 rejected
  const checkedIndexSet = new Set<number>();
  let totalWeight = 0;

  steps.push({
    id: stepId++,
    description: `初始化：将 ${edges.length} 条边按权值从小到大排序。每个节点自成一个集合。`,
    data: {
      sortedEdges: sortedEdges.map((e) => ({
        ...e,
        status: "pending" as const,
      })),
      selectedEdges: [] as SelectedEdge[],
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        parent: i + 1,
      })),
    },
    variables: { totalWeight: 0, selectedCount: 0, edgeIndex: -1 },
  });

  for (let idx = 0; idx < sortedEdges.length; idx++) {
    const edge = sortedEdges[idx];
    checkedIndexSet.add(edge.index);
    // 已选边的 index 集合（避免平行边按 (from,to,weight) 值匹配出错）
    const selectedIndexSet = new Set(selectedEdges.map((s) => s.index));

    steps.push({
      id: stepId++,
      description: `检查边 ${idx + 1}/${sortedEdges.length}：(${edge.from}, ${edge.to}) 权值=${edge.weight}`,
      data: {
        sortedEdges: sortedEdges.map((e) => ({
          ...e,
          status: selectedIndexSet.has(e.index)
            ? "selected" as const
            : e.index === edge.index
              ? "current" as const
              : checkedIndexSet.has(e.index)
                ? "rejected" as const
                : "pending" as const,
        })),
        selectedEdges: selectedEdges.map((e) => ({ ...e, isSelected: true })),
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          parent: find(i + 1),
        })),
        highlightedEdgeIdx: idx,
      },
      variables: {
        currentFrom: edge.from,
        currentTo: edge.to,
        currentWeight: edge.weight,
        totalWeight,
        selectedCount: selectedEdges.length,
      },
    });

    const fromRoot = find(edge.from);
    const toRoot = find(edge.to);

    if (fromRoot !== toRoot) {
      union(edge.from, edge.to);
      selectedEdges.push(edge);
      totalWeight += edge.weight;

      // 选择后重新计算已选 index 集合（包含刚选入的边）
      const newSelectedIndexSet = new Set(selectedEdges.map((s) => s.index));

      steps.push({
        id: stepId++,
        description: `√ 选择此边！${edge.from} 和 ${edge.to} 不在同一集合（根分别为 ${fromRoot} 和 ${toRoot}），合并两个集合。累计权重 = ${totalWeight}`,
        data: {
          sortedEdges: sortedEdges.map((e) => ({
            ...e,
            status: newSelectedIndexSet.has(e.index)
              ? "selected" as const
              : checkedIndexSet.has(e.index)
                ? "rejected" as const
                : "pending" as const,
          })),
          selectedEdges: selectedEdges.map((e) => ({ ...e, isSelected: true })),
          nodes: Array.from({ length: nodes }, (_, i) => ({
            id: i + 1,
            label: `${i + 1}`,
            parent: find(i + 1),
          })),
          highlightedEdgeIdx: idx,
        },
        variables: {
          currentFrom: edge.from,
          currentTo: edge.to,
          currentWeight: edge.weight,
          fromRoot,
          toRoot,
          totalWeight,
          selectedCount: selectedEdges.length,
          action: "selected",
        },
      });

      if (selectedEdges.length === nodes - 1) break;
    } else {
      steps.push({
        id: stepId++,
        description: `× 跳过此边！${edge.from} 和 ${edge.to} 已在同一集合（根都是 ${fromRoot}），选择此边会形成环。`,
        data: {
          sortedEdges: sortedEdges.map((e) => ({
            ...e,
            status: selectedIndexSet.has(e.index)
              ? "selected" as const
              : checkedIndexSet.has(e.index)
                ? "rejected" as const
                : "pending" as const,
          })),
          selectedEdges: selectedEdges.map((e) => ({ ...e, isSelected: true })),
          nodes: Array.from({ length: nodes }, (_, i) => ({
            id: i + 1,
            label: `${i + 1}`,
            parent: find(i + 1),
          })),
        },
        variables: {
          currentFrom: edge.from,
          currentTo: edge.to,
          currentWeight: edge.weight,
          fromRoot,
          totalWeight,
          selectedCount: selectedEdges.length,
          action: "rejected",
        },
      });
    }
  }

  const isConnected = selectedEdges.length === nodes - 1;

  steps.push({
    id: stepId++,
    description: isConnected
      ? `Kruskal 算法完成！最小生成树包含 ${selectedEdges.length} 条边，总权重 = ${totalWeight}`
      : `图不连通！只选出了 ${selectedEdges.length} 条边（需要 ${nodes - 1} 条），输出 orz`,
    data: {
      sortedEdges: sortedEdges.map((e) => ({
        ...e,
        status: selectedEdges.some((s) => s.index === e.index)
          ? "selected" as const
          : checkedIndexSet.has(e.index)
            ? "rejected" as const
            : "pending" as const,
      })),
      selectedEdges: selectedEdges.map((e) => ({ ...e, isSelected: true })),
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        parent: find(i + 1),
      })),
    },
    variables: {
      totalWeight,
      selectedCount: selectedEdges.length,
      isConnected,
    },
  });

  return steps;
}
