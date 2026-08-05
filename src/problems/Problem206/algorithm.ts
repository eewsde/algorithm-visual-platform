import { VisualizationStep } from "@/types";

export interface TopoEdge {
  from: number;
  to: number;
}

export interface TopoInput {
  nodes: number;
  edges: TopoEdge[];
}

export function parseTopoInput(input: string): TopoInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);

  const edges: TopoEdge[] = [];
  for (let i = 1; i <= m && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 2) {
      edges.push({ from: parseInt(parts[0]), to: parseInt(parts[1]) });
    }
  }
  return { nodes: n, edges };
}

export function generateTopoSteps(input: TopoInput): VisualizationStep[] {
  const { nodes, edges } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const adj: Map<number, number[]> = new Map();
  const inDegree = new Array(nodes + 1).fill(0);
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)!.push(e.to);
    inDegree[e.to]++;
  }

  const queue: number[] = [];
  let head = 0; // O(1) 出队指针，避免 shift() 的 O(n) 开销
  const result: number[] = [];

  steps.push({
    id: stepId++,
    description: `初始化：计算每个节点的入度。入度为0的节点可以直接开始。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        inDegree: inDegree[i + 1],
        state: "unvisited" as const,
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: [] as number[],
      result: [] as number[],
    },
    variables: { totalNodes: nodes, inQueue: 0, processed: 0 },
  });

  for (let i = 1; i <= nodes; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  steps.push({
    id: stepId++,
    description: `将入度为0的节点加入队列：[${queue.join(", ")}]。这些节点没有前置依赖。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        inDegree: inDegree[i + 1],
        state: queue.includes(i + 1) ? ("in_queue" as const) : ("unvisited" as const),
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: queue.slice(head),
      result: [],
    },
    variables: { inQueue: queue.length, processed: 0 },
  });

  while (head < queue.length) {
    const u = queue[head++];
    result.push(u);

    steps.push({
      id: stepId++,
      description: `取出节点 ${u}（入度=0），加入拓扑序列。当前序列：[${result.join(", ")}]`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          inDegree: inDegree[i + 1],
          state:
            i + 1 === u
              ? ("current" as const)
              : result.includes(i + 1)
                ? ("visited" as const)
                : queue.includes(i + 1)
                  ? ("in_queue" as const)
                  : ("unvisited" as const),
        })),
        edges: edges.map((e) => ({
          ...e,
          type: e.from === u ? ("current" as const) : ("normal" as const),
        })),
        queue: queue.slice(head),
        result: [...result],
      },
      variables: {
        currentNode: u,
        inQueue: queue.length,
        processed: result.length,
        sequence: result.join(", "),
      },
    });

    for (const v of adj.get(u)!) {
      inDegree[v]--;

      steps.push({
        id: stepId++,
        description: `移除从 ${u} 到 ${v} 的边，节点 ${v} 的入度从 ${inDegree[v] + 1} 变为 ${inDegree[v]}。`,
        data: {
          nodes: Array.from({ length: nodes }, (_, i) => ({
            id: i + 1,
            label: `${i + 1}`,
            inDegree: inDegree[i + 1],
            state: result.includes(i + 1)
              ? ("visited" as const)
              : queue.includes(i + 1)
                ? ("in_queue" as const)
                : ("unvisited" as const),
          })),
          edges: edges.map((e) => ({
            ...e,
            type:
              e.from === u && e.to === v ? ("current" as const) : ("normal" as const),
          })),
          queue: queue.slice(head),
          result: [...result],
        },
        variables: {
          currentNode: u,
          targetNode: v,
          newInDegree: inDegree[v],
          processed: result.length,
        },
      });

      if (inDegree[v] === 0) {
        queue.push(v);
        steps.push({
          id: stepId++,
          description: `节点 ${v} 入度变为0，加入队列。`,
          data: {
            nodes: Array.from({ length: nodes }, (_, i) => ({
              id: i + 1,
              label: `${i + 1}`,
              inDegree: inDegree[i + 1],
              state: result.includes(i + 1)
                ? ("visited" as const)
                : queue.includes(i + 1)
                  ? ("in_queue" as const)
                  : ("unvisited" as const),
            })),
            edges: edges.map((e) => ({ ...e, type: "normal" as const })),
            queue: queue.slice(head),
            result: [...result],
          },
          variables: {
            enqueuedNode: v,
            inQueue: queue.length,
            processed: result.length,
          },
        });
      }
    }
  }

  const hasCycle = result.length < nodes;

  steps.push({
    id: stepId++,
    description: hasCycle
      ? `图中存在环！只处理了 ${result.length}/${nodes} 个节点。存在环的图无法进行拓扑排序。`
      : `拓扑排序完成！序列：${result.join(" → ")}。所有节点按依赖关系正确排列。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        inDegree: inDegree[i + 1],
        state: result.includes(i + 1) ? ("visited" as const) : ("unvisited" as const),
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: [],
      result: [...result],
    },
    variables: {
      processed: result.length,
      totalNodes: nodes,
      hasCycle,
      sequence: result.join(", "),
    },
  });

  return steps;
}
