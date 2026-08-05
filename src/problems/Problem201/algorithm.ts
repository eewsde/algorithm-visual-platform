import { VisualizationStep } from "@/types";

export interface KruskalEdge {
  from: number;
  to: number;
  weight: number;
}

export interface KruskalInput {
  nodes: number;
  edges: KruskalEdge[];
}

export function parseKruskalInput(input: string): KruskalInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);

  const edges: KruskalEdge[] = [];
  for (let i = 1; i <= m && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 3) {
      edges.push({
        from: parseInt(parts[0]),
        to: parseInt(parts[1]),
        weight: parseInt(parts[2]),
      });
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
  let totalWeight = 0;

  steps.push({
    id: stepId++,
    description: `初始化：将 ${edges.length} 条边按权值从小到大排序。每个节点自成一个集合。`,
    data: {
      sortedEdges: sortedEdges.map((e, i) => ({
        ...e,
        index: i,
        status: "pending" as const,
      })),
      selectedEdges: [] as any[],
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

    steps.push({
      id: stepId++,
      description: `检查边 ${idx + 1}/${sortedEdges.length}：(${edge.from}, ${edge.to}) 权值=${edge.weight}`,
      data: {
        sortedEdges: sortedEdges.map((e, i) => ({
          ...e,
          index: i,
          status: i < idx
            ? (selectedEdges.some((s) => s.from === e.from && s.to === e.to && s.weight === e.weight) ? "selected" as const : "rejected" as const)
            : i === idx ? "current" as const : "pending" as const,
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

      steps.push({
        id: stepId++,
        description: `√ 选择此边！${edge.from} 和 ${edge.to} 不在同一集合（根分别为 ${fromRoot} 和 ${toRoot}），合并两个集合。累计权重 = ${totalWeight}`,
        data: {
          sortedEdges: sortedEdges.map((e, i) => ({
            ...e,
            index: i,
            status: i <= idx
              ? (selectedEdges.some((s) => s.from === e.from && s.to === e.to && s.weight === e.weight) ? "selected" as const : i === idx ? "selected" as const : "rejected" as const)
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
          sortedEdges: sortedEdges.map((e, i) => ({
            ...e,
            index: i,
            status: i <= idx
              ? (selectedEdges.some((s) => s.from === e.from && s.to === e.to && s.weight === e.weight) ? "selected" as const : "rejected" as const)
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
        index: 0,
        status: selectedEdges.some((s) => s.from === e.from && s.to === e.to && s.weight === e.weight)
          ? "selected" as const : "rejected" as const,
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
