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
  if (!input.trim()) {
    throw new Error("请输入图数据");
  }
  const lines = input.trim().split("\n").filter((l) => l.trim());
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);
  const start = startNode ?? 1;

  if (!Number.isFinite(n) || !Number.isFinite(m)) {
    throw new Error("顶点数/边数格式错误");
  }
  if (n > 200 || m > (n * (n - 1)) / 2) {
    throw new Error("顶点数最多 200、边数不能超过 n(n-1)/2，以保证可视化流畅");
  }
  if (start < 1 || start > n) {
    throw new Error("起点编号超出范围");
  }

  const edges: GraphEdge[] = [];
  for (let i = 1; i <= m && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 2) {
      const from = parseInt(parts[0]);
      const to = parseInt(parts[1]);
      if (from < 1 || from > n || to < 1 || to > n) {
        throw new Error("边端点编号超出范围");
      }
      edges.push({ from, to });
    }
  }
  return { nodes: n, edges, startNode: start };
}

type NodeState = "unvisited" | "in_queue" | "visiting" | "visited" | "current";

export function generateBFSSteps(input: TraversalInput): VisualizationStep[] {
  const { nodes, edges, startNode } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 有向图（引用关系 X→Y）：只沿边方向建邻接表
  const adj: Map<number, number[]> = new Map();
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)!.push(e.to);
  }
  for (const [, neighbors] of adj) neighbors.sort((a, b) => a - b);

  const state: NodeState[] = new Array(nodes + 1).fill("unvisited");
  const discoveryOrder: number[] = [];
  const queue: number[] = [];
  let head = 0; // O(1) 出队指针，避免 shift() 的 O(n) 开销

  // 已遍历边集合（有向边按 from->to 存 key），用于在后续步骤中把走过的边标绿
  const visitedEdgeKeys = new Set<string>();
  const edgeKeyOf = (a: number, b: number) => `${a}-${b}`;
  const snapshotEdges = (curA: number | null, curB: number | null) =>
    edges.map((e) => {
      const key = edgeKeyOf(e.from, e.to);
      const isCurrent =
        curA !== null && curB !== null && key === edgeKeyOf(curA, curB);
      return {
        ...e,
        // 当前边按遍历方向定向（from=出发节点, to=目标节点），供无向图中显示方向箭头
        from: isCurrent && curA !== null && curB !== null ? curA : e.from,
        to: isCurrent && curA !== null && curB !== null ? curB : e.to,
        type: (
          isCurrent ? "current" : visitedEdgeKeys.has(key) ? "visited" : "normal"
        ) as "current" | "visited" | "normal",
      };
    });

  steps.push({
    id: stepId++,
    description: `BFS 初始化：从节点 ${startNode} 开始，使用队列进行广度优先搜索。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: "unvisited" as NodeState,
      })),
      edges: snapshotEdges(null, null),
      queue: [] as number[],
      discoveryOrder: [] as number[],
    },
    variables: { queueSize: queue.length - head, visitedCount: 0 },
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
      edges: snapshotEdges(null, null),
      queue: queue.slice(head),
      discoveryOrder: [...discoveryOrder],
    },
    variables: { queueSize: queue.length - head, visitedCount: discoveryOrder.length },
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
        edges: snapshotEdges(null, null),
        queue: queue.slice(head),
        discoveryOrder: [...discoveryOrder],
      },
      variables: {
        currentNode: u,
        queueSize: queue.length - head,
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
            edges: snapshotEdges(u, v),
            queue: queue.slice(head),
            discoveryOrder: [...discoveryOrder],
          },
          variables: {
            currentNode: u,
            discoveredNode: v,
            queueSize: queue.length - head,
            visitedCount: discoveryOrder.length,
          },
        });
        visitedEdgeKeys.add(edgeKeyOf(u, v));
      }
    }
  }

  // 统计未访问节点：图不连通时在最终描述中提示，并附带不可达节点列表
  const unreachableNodes: number[] = [];
  for (let i = 1; i <= nodes; i++) {
    if (state[i] !== "visited") unreachableNodes.push(i);
  }
  let finalDescription = `BFS 遍历完成！访问顺序：${discoveryOrder.join(" → ")}。BFS 按层次逐层访问，先访问距离起点近的节点。`;
  if (unreachableNodes.length > 0) {
    finalDescription += `（注意：有 ${unreachableNodes.length} 个节点不可达，图不连通）`;
  }

  steps.push({
    id: stepId++,
    description: finalDescription,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: state[i + 1],
      })),
      edges: snapshotEdges(null, null),
      queue: [],
      discoveryOrder: [...discoveryOrder],
      unreachableNodes,
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

  // 有向图（引用关系 X→Y）：只沿边方向建邻接表
  const adj: Map<number, number[]> = new Map();
  for (let i = 1; i <= nodes; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.from)!.push(e.to);
  }
  for (const [, neighbors] of adj) neighbors.sort((a, b) => a - b);

  const state: NodeState[] = new Array(nodes + 1).fill("unvisited");
  const discoveryOrder: number[] = [];
  const callStack: number[] = []; // 递归调用栈；step data 中用 key "queue" 以便 visualizer 统一渲染

  // 已遍历边集合（有向边按 from->to 存 key），用于在后续步骤中把走过的边标绿
  const visitedEdgeKeys = new Set<string>();
  const edgeKeyOf = (a: number, b: number) => `${a}-${b}`;
  const snapshotEdges = (curA: number | null, curB: number | null) =>
    edges.map((e) => {
      const key = edgeKeyOf(e.from, e.to);
      const isCurrent =
        curA !== null && curB !== null && key === edgeKeyOf(curA, curB);
      return {
        ...e,
        // 当前边按遍历方向定向（from=出发节点, to=目标节点），供无向图中显示方向箭头
        from: isCurrent && curA !== null && curB !== null ? curA : e.from,
        to: isCurrent && curA !== null && curB !== null ? curB : e.to,
        type: (
          isCurrent ? "current" : visitedEdgeKeys.has(key) ? "visited" : "normal"
        ) as "current" | "visited" | "normal",
      };
    });

  steps.push({
    id: stepId++,
    description: `DFS 初始化：从节点 ${startNode} 开始，使用递归/栈进行深度优先搜索。`,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: "unvisited" as NodeState,
      })),
      edges: snapshotEdges(null, null),
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
        edges: snapshotEdges(null, null),
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
        edges: snapshotEdges(null, null),
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
            edges: snapshotEdges(u, v),
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
        visitedEdgeKeys.add(edgeKeyOf(u, v));

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
        edges: snapshotEdges(null, null),
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

  // 统计未访问节点：图不连通时在最终描述中提示，并附带不可达节点列表
  const unreachableNodes: number[] = [];
  for (let i = 1; i <= nodes; i++) {
    if (state[i] !== "visited") unreachableNodes.push(i);
  }
  let finalDescription = `DFS 遍历完成！访问顺序：${discoveryOrder.join(" → ")}。DFS 沿着一条路径深入到底，然后回溯。`;
  if (unreachableNodes.length > 0) {
    finalDescription += `（注意：有 ${unreachableNodes.length} 个节点不可达，图不连通）`;
  }

  steps.push({
    id: stepId++,
    description: finalDescription,
    data: {
      nodes: Array.from({ length: nodes }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
        state: state[i + 1],
      })),
      edges: snapshotEdges(null, null),
      queue: [],
      discoveryOrder: [...discoveryOrder],
      unreachableNodes,
    },
    variables: {
      visitedCount: discoveryOrder.length,
      discoveryOrder: discoveryOrder.join(", "),
    },
  });

  return steps;
}
