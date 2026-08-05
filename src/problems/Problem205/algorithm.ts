import { VisualizationStep } from "@/types";

export interface GraphEdge {
  from: number;
  to: number;
}

export interface TraversalInput {
  nodes: number;
  edges: GraphEdge[];
  startNode: number;
}

export type TraversalMode = "bfs" | "dfs";

export function parseTraversalInput(input: string, startNode?: number): TraversalInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);
  const start = startNode ?? 1;

  const edges: GraphEdge[] = [];
  for (let i = 1; i <= m && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 2) {
      edges.push({ from: parseInt(parts[0]), to: parseInt(parts[1]) });
    }
  }
  return { nodes: n, edges, startNode: start };
}

type NodeState = "unvisited" | "in_queue" | "visiting" | "visited" | "current";

export function generateBFSSteps(input: TraversalInput): VisualizationStep[] {
  const { nodes, edges, startNode } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const adj: Map<number, number[]> = new Map();
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)!.push(e.to);
    adj.get(e.to)!.push(e.from);
  }
  for (const [, neighbors] of adj) neighbors.sort((a, b) => a - b);

  const state: NodeState[] = new Array(nodes + 1).fill("unvisited");
  const discoveryOrder: number[] = [];
  const queue: number[] = [];
  let head = 0; // O(1) 出队指针，避免 shift() 的 O(n) 开销

  steps.push({
    id: stepId++,
    description: `BFS 初始化：从节点 ${startNode} 开始，使用队列进行广度优先搜索。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: "unvisited" as NodeState,
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: [] as number[],
      discoveryOrder: [] as number[],
    },
    variables: { queueSize: 0, visitedCount: 0 },
  });

  state[startNode] = "in_queue";
  queue.push(startNode);

  steps.push({
    id: stepId++,
    description: `节点 ${startNode} 入队。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: i + 1 === startNode ? "in_queue" : "unvisited",
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: queue.slice(head),
      discoveryOrder: [...discoveryOrder],
    },
    variables: { queueSize: queue.length, visitedCount: discoveryOrder.length },
  });

  while (head < queue.length) {
    const u = queue[head++];
    state[u] = "current";

    steps.push({
      id: stepId++,
      description: `出队节点 ${u}，开始访问其邻居。`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          state: state[i + 1],
          isCurrent: i + 1 === u,
        })),
        edges: edges.map((e) => ({ ...e, type: "normal" as const })),
        queue: queue.slice(head),
        discoveryOrder: [...discoveryOrder],
      },
      variables: {
        currentNode: u,
        queueSize: queue.length,
        visitedCount: discoveryOrder.length,
      },
    });

    state[u] = "visited";
    discoveryOrder.push(u);

    const neighbors = adj.get(u)!;
    for (const v of neighbors) {
      if (state[v] === "unvisited") {
        state[v] = "in_queue";
        queue.push(v);

        steps.push({
          id: stepId++,
          description: `发现新节点 ${v}（从 ${u} 出发），将 ${v} 入队。`,
          data: {
            nodes: Array.from({ length: nodes }, (_, i) => ({
              id: i + 1,
              label: `${i + 1}`,
              state: i + 1 === v ? "in_queue" : state[i + 1],
              isCurrent: i + 1 === u,
            })),
            edges: edges.map((e) => ({
              ...e,
              type:
                (e.from === u && e.to === v) || (e.from === v && e.to === u)
                  ? ("current" as const)
                  : ("normal" as const),
            })),
            queue: queue.slice(head),
            discoveryOrder: [...discoveryOrder],
          },
          variables: {
            currentNode: u,
            discoveredNode: v,
            queueSize: queue.length,
            visitedCount: discoveryOrder.length,
          },
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `BFS 遍历完成！访问顺序：${discoveryOrder.join(" → ")}。BFS 按层次逐层访问，先访问距离起点近的节点。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: state[i + 1],
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: [],
      discoveryOrder: [...discoveryOrder],
    },
    variables: {
      visitedCount: discoveryOrder.length,
      discoveryOrder: discoveryOrder.join(", "),
    },
  });

  return steps;
}

export function generateDFSSteps(input: TraversalInput): VisualizationStep[] {
  const { nodes, edges, startNode } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const adj: Map<number, number[]> = new Map();
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)!.push(e.to);
    adj.get(e.to)!.push(e.from);
  }
  for (const [, neighbors] of adj) neighbors.sort((a, b) => a - b);

  const state: NodeState[] = new Array(nodes + 1).fill("unvisited");
  const discoveryOrder: number[] = [];
  const callStack: number[] = []; // 递归调用栈；step data 中用 key "queue" 以便 visualizer 统一渲染

  steps.push({
    id: stepId++,
    description: `DFS 初始化：从节点 ${startNode} 开始，使用递归/栈进行深度优先搜索。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: "unvisited" as NodeState,
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: [],
      discoveryOrder: [],
    },
    variables: { stackSize: 0, visitedCount: 0 },
  });

  function dfs(u: number) {
    state[u] = "current";
    callStack.push(u);

    steps.push({
      id: stepId++,
      description: `进入节点 ${u}，标记为"访问中"。递归栈：[${callStack.join(", ")}]`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          state: state[i + 1],
          isCurrent: i + 1 === u,
        })),
        edges: edges.map((e) => ({ ...e, type: "normal" as const })),
        queue: [...callStack],
        discoveryOrder: [...discoveryOrder],
      },
      variables: {
        currentNode: u,
        stackSize: callStack.length,
        visitedCount: discoveryOrder.length,
        stack: callStack.join(", "),
      },
    });

    state[u] = "visited";
    discoveryOrder.push(u);

    steps.push({
      id: stepId++,
      description: `节点 ${u} 访问完成，加入发现序列。发现顺序：[${discoveryOrder.join(", ")}]`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          state: state[i + 1],
        })),
        edges: edges.map((e) => ({ ...e, type: "normal" as const })),
        queue: [...callStack],
        discoveryOrder: [...discoveryOrder],
      },
      variables: {
        currentNode: u,
        stackSize: callStack.length,
        visitedCount: discoveryOrder.length,
      },
    });

    const neighbors = adj.get(u)!;
    for (const v of neighbors) {
      if (state[v] === "unvisited") {
        steps.push({
          id: stepId++,
          description: `发现未访问邻居 ${v}，递归进入。当前边：(${u}, ${v})`,
          data: {
            nodes: Array.from({ length: nodes }, (_, i) => ({
              id: i + 1,
              label: `${i + 1}`,
              state: state[i + 1],
              isCurrent: i + 1 === u,
            })),
            edges: edges.map((e) => ({
              ...e,
              type:
                (e.from === u && e.to === v) || (e.from === v && e.to === u)
                  ? ("current" as const)
                  : ("normal" as const),
            })),
            queue: [...callStack],
            discoveryOrder: [...discoveryOrder],
          },
          variables: {
            currentNode: u,
            discoveredNode: v,
            stackSize: callStack.length,
            visitedCount: discoveryOrder.length,
          },
        });

        dfs(v);
      }
    }

    callStack.pop();
    steps.push({
      id: stepId++,
      description: `回溯：离开节点 ${u}，返回上一层。递归栈：[${callStack.join(", ") || "空"}]`,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => ({
          id: i + 1,
          label: `${i + 1}`,
          state: state[i + 1],
        })),
        edges: edges.map((e) => ({ ...e, type: "normal" as const })),
        queue: [...callStack],
        discoveryOrder: [...discoveryOrder],
      },
      variables: {
        currentNode: u,
        stackSize: callStack.length,
        visitedCount: discoveryOrder.length,
        action: "backtrack",
      },
    });
  }

  dfs(startNode);

  steps.push({
    id: stepId++,
    description: `DFS 遍历完成！访问顺序：${discoveryOrder.join(" → ")}。DFS 沿着一条路径深入到底，然后回溯。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: state[i + 1],
      })),
      edges: edges.map((e) => ({ ...e, type: "normal" as const })),
      queue: [],
      discoveryOrder: [...discoveryOrder],
    },
    variables: {
      visitedCount: discoveryOrder.length,
      discoveryOrder: discoveryOrder.join(", "),
    },
  });

  return steps;
}
