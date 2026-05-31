import { VisualizationStep } from "@/types";

export interface Edge {
  from: number;
  to: number;
  weight: number;
}

export interface DijkstraInput {
  nodes: number;
  edges: Edge[];
  start: number;
}

export function parseDijkstraInput(input: string): DijkstraInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);
  const start = parseInt(firstLine[2]) || 1;

  const edges: Edge[] = [];
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
  return { nodes: n, edges, start };
}

export function generateDijkstraSteps(input: DijkstraInput): VisualizationStep[] {
  const { nodes, edges, start } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const INF = Infinity;
  const dist: number[] = Array(nodes + 1).fill(INF);
  const visited: boolean[] = Array(nodes + 1).fill(false);
  const prev: (number | null)[] = Array(nodes + 1).fill(null);
  dist[start] = 0;

  // Build adjacency list
  const adj: Map<number, Edge[]> = new Map();
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)?.push(e);
  }

  steps.push({
    id: stepId++,
    description: `初始化：起点 ${start} 距离设为 0，其余节点距离设为 ∞。将起点加入优先队列。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        distance: i + 1 === start ? 0 : INF,
      })),
      edges: edges.map((e) => ({ ...e, isCurrent: false, isVisited: false })),
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
        edges: edges.map((e) => ({
          ...e,
          isCurrent: false,
          isVisited: visited[e.from] && visited[e.to],
        })),
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
    let relaxed = false;
    for (const edge of neighbors) {
      const v = edge.to;
      if (!visited[v] && dist[u] + edge.weight < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + edge.weight;
        prev[v] = u;
        relaxed = true;

        steps.push({
          id: stepId++,
          description: `松弛边 ${u}→${v}：dist[${v}] = min(${oldDist === INF ? "∞" : oldDist}, ${dist[u]} + ${edge.weight}) = ${dist[v]}`,
          data: {
            nodes: Array.from({ length: nodes }, (_, i) => ({
              id: i + 1,
              label: `${i + 1}`,
              distance: dist[i + 1],
            })),
            edges: edges.map((e) => ({
              ...e,
              isCurrent: e.from === u && e.to === v,
              isVisited: visited[e.from] && visited[e.to],
            })),
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
          highlightedNodes: [`${u}`, `${v}`],
        });
      }
    }

    if (!relaxed && neighbors.length > 0) {
      // show that no edges were relaxed
      for (const edge of neighbors) {
        const v = edge.to;
        if (!visited[v]) {
          steps.push({
            id: stepId++,
            description: `检查边 ${u}→${v}：dist[${u}]+${edge.weight}=${dist[u] + edge.weight} ≥ dist[${v}]=${dist[v] === INF ? "∞" : dist[v]}，不更新。`,
            data: {
              nodes: Array.from({ length: nodes }, (_, i) => ({
                id: i + 1,
                label: `${i + 1}`,
                distance: dist[i + 1],
              })),
              edges: edges.map((e) => ({
                ...e,
                isCurrent: e.from === u && e.to === v,
                isVisited: visited[e.from] && visited[e.to],
              })),
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
  }

  // Final state
  steps.push({
    id: stepId++,
    description: `Dijkstra 算法完成！从起点 ${start} 到各节点的最短距离已求出。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        distance: dist[i + 1],
      })),
      edges: edges.map((e) => ({
        ...e,
        isCurrent: false,
        isVisited: true,
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
