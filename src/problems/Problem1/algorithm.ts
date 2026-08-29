import { VisualizationStep } from "@/types";

export interface Edge {
  from: number;
  to: number;
  weight: number;
  /** 输入顺序的边编号（用于平行边去重/唯一标记） */
  index: number;
}

export interface DijkstraInput {
  nodes: number;
  edges: Edge[];
  start: number;
}

export function parseDijkstraInput(input: string): DijkstraInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) {
    throw new Error("请输入图数据");
  }
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);
  const start = parseInt(firstLine[2]);
  if (isNaN(n) || isNaN(m) || isNaN(start)) {
    throw new Error("n、m、start 必须为整数");
  }
  if (n > 200 || m > 5000) {
    throw new Error("节点数最多 200、边数最多 5000，以保证可视化流畅");
  }
  if (start < 1 || start > n) {
    throw new Error("起点编号超出范围");
  }

  const edges: Edge[] = [];
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
      if (weight < 0) {
        throw new Error("Dijkstra 不支持负权边");
      }
      edges.push({ from, to, weight, index: edges.length });
    }
  }
  return { nodes: n, edges, start };
}

export function generateDijkstraSteps(input: DijkstraInput): VisualizationStep[] {
  const { nodes, edges, start } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const INF = Infinity;
  const dist: number[] = Array(nodes + 1).fill(INF);
  const visited: boolean[] = Array(nodes + 1).fill(false);
  dist[start] = 0;

  // Build adjacency list
  const adj: Map<number, Edge[]> = new Map();
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)?.push(e);
  }

  // 最短路径树：treeSet 保存已松弛（选入树）的边 index；
  // parentEdgeIdx[v] 记录当前指向 v 的树边 index（松弛成功时替换旧边）
  const treeSet = new Set<number>();
  const parentEdgeIdx: number[] = Array(nodes + 1).fill(-1);
  const snapshotEdges = (currentIdx: number | null) =>
    edges.map((e) => ({
      ...e,
      isCurrent: currentIdx !== null && e.index === currentIdx,
      isVisited: treeSet.has(e.index),
    }));

  steps.push({
    id: stepId++,
    description: `初始化：起点 ${start} 距离设为 0，其余节点距离设为 ∞。下一轮将选中起点开始松弛。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        distance: i + 1 === start ? 0 : INF,
      })),
      edges: snapshotEdges(null),
      
    },
    variables: {
      current: start,
      visitedCount: 0,
      dist: dist.slice(1).map((d) => (d === INF ? "∞" : d)),
    },
    highlightedNodes: [`${start}`],
  });

  let visitedCount = 0;

  while (visitedCount < nodes) {
    // Find unvisited node with minimum distance
    let u = -1;
    let minDist = INF;
    for (let i = 1; i <= nodes; i++) {
      if (!visited[i] && dist[i] < minDist) {
        minDist = dist[i];
        u = i;
      }
    }
    if (u === -1) break;

    visited[u] = true;
    visitedCount++;

    steps.push({
      id: stepId++,
      description: `选中节点 ${u}（当前最短距离=${minDist === INF ? "∞" : minDist}），标记为已访问。`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          distance: dist[i + 1],
        })),
        edges: snapshotEdges(null),
        visited: [...visited.slice(1)],
        
      },
      variables: {
        current: u,
        visitedCount,
        dist: dist.slice(1).map((d) => (d === INF ? "∞" : d)),
      },
      highlightedNodes: [`${u}`],
    });

    // Relax edges from u
    const neighbors = adj.get(u) || [];
    for (const edge of neighbors) {
      const v = edge.to;
      if (visited[v]) continue;

      if (dist[u] + edge.weight < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + edge.weight;
        // 更新最短路径树：先摘掉 v 的旧树边，再在步骤之后加入新边
        if (parentEdgeIdx[v] !== -1) treeSet.delete(parentEdgeIdx[v]);
        parentEdgeIdx[v] = edge.index;

        steps.push({
          id: stepId++,
          description: `松弛边 ${u}→${v}：dist[${v}] = min(${oldDist === INF ? "∞" : oldDist}, ${dist[u]} + ${edge.weight}) = ${dist[v]}，该边加入最短路径树。`,
          data: {
            nodes: Array.from({ length: nodes }, (_, i) => ({
              id: i + 1,
              label: `${i + 1}`,
              distance: dist[i + 1],
            })),
            edges: snapshotEdges(edge.index),
            visited: [...visited.slice(1)],
            
          },
          variables: {
            current: u,
            neighbor: v,
            edgeWeight: edge.weight,
            oldDist: oldDist === INF ? "∞" : oldDist,
            newDist: dist[v],
            visitedCount,
            dist: dist.slice(1).map((d) => (d === INF ? "∞" : d)),
          },
          highlightedNodes: [`${u}`],
        });
        treeSet.add(edge.index);
      } else {
        steps.push({
          id: stepId++,
          description: `检查边 ${u}→${v}：dist[${u}]+${edge.weight}=${dist[u] + edge.weight} ≥ dist[${v}]=${dist[v] === INF ? "∞" : dist[v]}，不更新。`,
          data: {
            nodes: Array.from({ length: nodes }, (_, i) => ({
              id: i + 1,
              label: `${i + 1}`,
              distance: dist[i + 1],
            })),
            edges: snapshotEdges(edge.index),
            visited: [...visited.slice(1)],
            
          },
          variables: {
            current: u,
            neighbor: v,
            visitedCount,
            dist: dist.slice(1).map((d) => (d === INF ? "∞" : d)),
          },
        });
      }
    }
  }

  // Final state
  steps.push({
    id: stepId++,
    description: `Dijkstra 算法完成！从起点 ${start} 到各节点的最短距离已求出，绿色边构成最短路径树。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        distance: dist[i + 1],
      })),
      edges: edges.map((e) => ({
        ...e,
        isCurrent: false,
        isVisited: treeSet.has(e.index),
      })),
      visited: Array(nodes).fill(true),
    },
    variables: {
      visitedCount,
      dist: dist.slice(1).map((d) => (d === INF ? "∞" : d)),
    },
  });

  return steps;
}
