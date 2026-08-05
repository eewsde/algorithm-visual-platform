import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

export const luoguProblems: Problem[] = [
  // ===== 图论：最短路 =====
  {
    id: 200,
    leetcodeNumber: 4779,
    title: "【模板】单源最短路径（标准版）",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.GREEDY],
    description: `给定一个 n 个点、m 条有向边的带非负权图，请你计算从起点 s 出发，到每个点的最短距离。

数据保证能从 s 出发到任意点。

这是 Dijkstra 算法的标准模板题。`,
    examples: [
      {
        input: "4 5 1\n1 2 2\n1 3 5\n2 3 1\n2 4 6\n3 4 2",
        output: "0 2 3 5",
        explanation: "从节点1出发：到节点2最短距离=2，到节点3最短距离=3(1→2→3)，到节点4最短距离=5(1→2→3→4)",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 10^5",
      "1 ≤ m ≤ 2×10^5",
      "0 ≤ w ≤ 10^9",
      "图中所有权值为非负数",
    ],
    hints: [
      "使用邻接表存储图",
      "使用优先队列（堆）优化",
      "dist[v] = min(dist[v], dist[u] + w)",
      "将所有点分为已确定最短路的集合和未确定的集合",
    ],
    solution: {
      methodName: "Dijkstra（暴力版）",
      methodDescription:
        "Dijkstra算法使用贪心策略，每次线性扫描所有节点找出未访问中距离最小的节点，对其所有出边进行松弛操作。暴力实现O(V²+E)，竞赛中通常使用优先队列优化至O((V+E)logV)。可视化采用暴力版以清晰展示每一步的选择过程。",
      code: `function dijkstra(n: number, edges: [number, number, number][], start: number): number[] {
  const INF = Infinity;
  const dist: number[] = new Array(n + 1).fill(INF);
  const visited: boolean[] = new Array(n + 1).fill(false);
  const adj: Map<number, [number, number][]> = new Map();

  for (let i = 1; i <= n; i++) adj.set(i, []);
  for (const [u, v, w] of edges) {
    adj.get(u)!.push([v, w]);
  }

  dist[start] = 0;

  for (let count = 0; count < n; count++) {
    // 找到未访问的最小距离节点
    let u = -1, minDist = INF;
    for (let i = 1; i <= n; i++) {
      if (!visited[i] && dist[i] < minDist) {
        minDist = dist[i];
        u = i;
      }
    }
    if (u === -1) break;
    visited[u] = true;

    // 松弛操作
    for (const [v, w] of adj.get(u) || []) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }

  return dist.slice(1);
}`,
      language: "typescript",
      keyLines: [14, 15, 24, 25, 26],
      steps: [
        "初始化dist数组，dist[start]=0，其余为∞",
        "从未访问节点中选择dist最小的节点u",
        "将u标记为已访问",
        "对u的所有邻居v进行松弛：dist[v]=min(dist[v], dist[u]+w)",
        "重复直到所有节点已访问或无法到达剩余节点",
      ],
      advantages: [
        "时间复杂度O(V²+E)，堆优化可降至O((V+E)logV)",
        "空间复杂度O(V+E)",
        "图中所有边权非负时保证最优解",
      ],
      timeComplexity: {
        value: "O(V²+E)（暴力） / O((V+E)logV)（堆优化）",
        description: "暴力版每轮扫描所有节点找最小值；堆优化用优先队列维护候选节点",
      },
      spaceComplexity: { value: "O(V+E)", description: "邻接表存储图" },
      comparisons: [
        {
          name: "Dijkstra（暴力）",
          description: "每次暴力扫描找最小距离",
          timeComplexity: "O(V²)",
          spaceComplexity: "O(V)",
          isRecommended: false,
          pros: ["实现简单"],
          cons: ["节点多时效率低"],
        },
        {
          name: "Dijkstra（堆优化）",
          description: "使用优先队列维护最小距离",
          timeComplexity: "O((V+E)log V)",
          spaceComplexity: "O(V+E)",
          isRecommended: true,
          pros: ["稀疏图高效", "竞赛标准写法"],
          cons: ["需要数据结构支持"],
        },
        {
          name: "Bellman-Ford",
          description: "可以处理负权边",
          timeComplexity: "O(VE)",
          spaceComplexity: "O(V)",
          isRecommended: false,
          pros: ["可处理负权边", "可检测负环"],
          cons: ["效率较低"],
        },
      ],
    },
  },

  // ===== 图论：最小生成树 =====
  {
    id: 201,
    leetcodeNumber: 3366,
    title: "【模板】最小生成树",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.GREEDY],
    description: `如题，给出一个无向图，求出最小生成树，如果该图不连通，则输出 orz。

最小生成树（MST）是指一个连通加权无向图中一棵权值最小的生成树。

本题可使用 Kruskal 算法或 Prim 算法解决。`,
    examples: [
      {
        input: "4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 3",
        output: "7",
        explanation: "选择边(1,2,2)、(1,3,2)、(1,4,3)构成MST，总权值为7",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 5000",
      "1 ≤ m ≤ 2×10^5",
      "1 ≤ w ≤ 10^4",
      "图可能不连通",
    ],
    hints: [
      "Kruskal：按边权排序，用并查集判断连通性",
      "Prim：类似Dijkstra，每次选距离已选集合最近的节点",
      "使用路径压缩和按秩合并优化并查集",
    ],
    solution: {
      methodName: "Kruskal + 并查集",
      methodDescription:
        "Kruskal算法将所有边按权值从小到大排序，依次检查每条边，如果边的两端不在同一集合中（使用并查集判断），则选择该边加入MST。",
      code: `function kruskal(n: number, edges: [number, number, number][]): number {
  // 按边权排序
  edges.sort((a, b) => a[2] - b[2]);

  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const rank = new Array(n + 1).fill(0);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: number, y: number): boolean {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }

  let totalWeight = 0, edgeCount = 0;
  for (const [u, v, w] of edges) {
    if (union(u, v)) {
      totalWeight += w;
      edgeCount++;
      if (edgeCount === n - 1) break;
    }
  }

  return edgeCount === n - 1 ? totalWeight : -1;
}`,
      language: "typescript",
      keyLines: [2, 11, 12, 22, 23, 24, 25, 27],
      steps: [
        "将所有边按权值从小到大排序",
        "初始化并查集，每个节点自成一个集合",
        "遍历排序后的每条边",
        "如果边的两端不在同一集合，选择该边并合并两个集合",
        "重复直到选出n-1条边或所有边都检查完毕",
      ],
      advantages: [
        "时间复杂度O(E log E)，主要在于排序",
        "空间复杂度O(V+E)",
        "并查集操作近乎O(1)",
      ],
      timeComplexity: {
        value: "O(E log E)",
        description: "排序占主导，并查集操作近似常数",
      },
      spaceComplexity: { value: "O(V+E)", description: "存储边和并查集" },
      comparisons: [
        {
          name: "Kruskal",
          description: "基于边的贪心，配合并查集",
          timeComplexity: "O(E log E)",
          spaceComplexity: "O(V+E)",
          isRecommended: true,
          pros: ["稀疏图高效", "实现简洁"],
          cons: ["需要排序"],
        },
        {
          name: "Prim",
          description: "基于节点的贪心，类似Dijkstra",
          timeComplexity: "O((V+E) log V)",
          spaceComplexity: "O(V+E)",
          isRecommended: false,
          pros: ["稠密图高效（邻接矩阵O(V²)）"],
          cons: ["需要优先队列支持"],
        },
      ],
    },
  },

  // ===== 图论：Floyd 传递闭包 =====
  {
    id: 202,
    leetcodeNumber: 3611,
    title: "【模板】传递闭包 / Floyd 全源最短路",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给定一张 n 个点的有向图，求出该图的传递闭包。

传递闭包：如果从 i 到 j 存在一条路径（不一定是直接边），则认为 i 可达 j。

Floyd-Warshall 算法是求解全源最短路径的经典 DP 算法，核心思想是：对于每对节点 (i, j)，依次尝试以每个节点 k 作为中间节点来缩短路径。

dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`,
    examples: [
      {
        input: "3\n0 1 0\n0 0 1\n0 0 0",
        output: "1 1 1\n0 1 1\n0 0 1",
        explanation: "节点1可以到2；节点2可以到3；因此节点1可以通过2到达3（传递闭包）",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 100",
      "图由邻接矩阵给出",
    ],
    hints: [
      "三重循环：for k: for i: for j",
      "dist[i][j] = dist[i][j] | (dist[i][k] & dist[k][j])（传递闭包）",
      "dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])（最短路径）",
      "注意中间节点k必须在最外层循环",
    ],
    solution: {
      methodName: "Floyd-Warshall DP",
      methodDescription:
        "Floyd算法使用DP思想，dist[k][i][j]表示只经过前k个节点时从i到j的最短距离。可以优化为二维数组：dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])。",
      code: `function floyd(n: number, graph: number[][]): number[][] {
  const dist = graph.map(row => [...row]);

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  return dist;
}`,
      language: "typescript",
      keyLines: [4, 5, 6, 7],
      steps: [
        "将原图的邻接矩阵复制为dist",
        "枚举中间节点k（最外层循环）",
        "枚举起点i和终点j",
        "尝试通过k中转：dist[i][j]=min(dist[i][j], dist[i][k]+dist[k][j])",
        "三重循环完成后dist即为全源最短路径",
      ],
      advantages: [
        "时间复杂度O(n³)",
        "空间复杂度O(n²)",
        "代码极其简洁",
        "可同时求出所有点对的最短路径",
      ],
      timeComplexity: { value: "O(n³)", description: "三重循环" },
      spaceComplexity: { value: "O(n²)", description: "距离矩阵" },
      comparisons: [
        {
          name: "Floyd-Warshall",
          description: "DP算法，求全源最短路径",
          timeComplexity: "O(n³)",
          spaceComplexity: "O(n²)",
          isRecommended: true,
          pros: ["代码简洁", "求全源最短路径", "可处理负权边"],
          cons: ["O(n³)在大图上效率低"],
        },
        {
          name: "Dijkstra × n次",
          description: "对每个节点跑一次Dijkstra",
          timeComplexity: "O(n×(V+E)logV)",
          spaceComplexity: "O(V+E)",
          isRecommended: false,
          pros: ["稀疏图效率更高"],
          cons: ["不能处理负权边", "实现复杂"],
        },
      ],
    },
  },

  // ===== 动态规划：01背包 =====
  {
    id: 203,
    leetcodeNumber: 1048,
    title: "采药（01背包）",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `辰辰是个天资聪颖的孩子，他的梦想是成为世界上最伟大的医师。为此，他想拜附近最有威望的医师为师。医师为了判断他的资质，给他出了一个难题。

医师把他带到一个到处都是草药的山洞里对他说："孩子，这个山洞里有一些不同的草药，采每一株都需要一些时间，每一株也有它自身的价值。我会给你一段时间，在这段时间里，你可以采到一些草药。如果你是一个聪明的孩子，你应该可以让采到的草药的总价值最大。"

这是经典的 01 背包问题。`,
    examples: [
      {
        input: "70 3\n71 100\n69 1\n1 2",
        output: "3",
        explanation: "总时间70：选择第1株(69,1)和第3株(1,2)，总价值=3",
      },
    ],
    constraints: [
      "1 ≤ T ≤ 1000",
      "1 ≤ M ≤ 100",
      "1 ≤ t[i] ≤ 10^4",
      "1 ≤ v[i] ≤ 10^4",
    ],
    hints: [
      "dp[j]表示花费j时间能获得的最大价值",
      "dp[j] = max(dp[j], dp[j - time[i]] + value[i])",
      "注意内层循环从后往前遍历（01背包）",
      "如果从前遍历会变成完全背包",
    ],
    solution: {
      methodName: "01背包DP（一维优化）",
      methodDescription:
        "dp[j]表示容量为j时能获得的最大价值。对于每个物品，逆序遍历容量，dp[j] = max(dp[j], dp[j-w[i]] + v[i])。逆序确保每个物品最多使用一次。",
      code: `function knapsack01(T: number, herbs: [number, number][]): number {
  const dp = new Array(T + 1).fill(0);

  for (const [time, value] of herbs) {
    for (let j = T; j >= time; j--) {
      dp[j] = Math.max(dp[j], dp[j - time] + value);
    }
  }

  return dp[T];
}`,
      language: "typescript",
      keyLines: [4, 5],
      steps: [
        "初始化dp数组为0",
        "遍历每个物品（草药）",
        "逆序遍历容量j（从大到小），确保每个物品只考虑一次",
        "dp[j] = max(dp[j], dp[j-time] + value)表示选或不选当前物品",
        "最终dp[T]即为最大价值",
      ],
      advantages: [
        "时间复杂度O(M×T)",
        "空间复杂度O(T)，一维数组优化",
        "经典DP入门题，思路清晰",
      ],
      timeComplexity: { value: "O(M×T)", description: "M个物品，容量T" },
      spaceComplexity: { value: "O(T)", description: "一维dp数组" },
      comparisons: [],
    },
  },

  // ===== 图论：Prim 最小生成树 =====
  {
    id: 204,
    leetcodeNumber: 3366,
    title: "【模板】最小生成树（Prim算法）",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.GREEDY],
    description: `如题，给出一个无向图，使用 Prim 算法求出最小生成树。

Prim 算法是一种基于节点的贪心策略：从任意起点出发，每次选择一条连接"已选节点集合"与"未选节点"的最小权边，将边和新节点加入MST。重复直到所有节点都在MST中。

与 Kruskal（基于边的贪心）形成互补，稠密图上 Prim（邻接矩阵 O(V²)）更优。`,
    examples: [
      {
        input: "4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 3",
        output: "7",
        explanation: "从节点1出发：选(1,2,w=2)→选(1,3,w=2)→选(1,4,w=3)，总权值=7",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 5000",
      "1 ≤ m ≤ 2×10^5",
      "1 ≤ w ≤ 10^4",
      "图可能不连通",
    ],
    hints: [
      "从任意节点开始（通常选节点1）",
      "维护 visited 数组标记已选节点",
      "每次从所有候选边中选取权值最小的",
      "候选边 = 一端在MST中、另一端不在MST中的边",
      "堆优化：用优先队列维护候选边，O((V+E)logV)",
    ],
    solution: {
      methodName: "Prim（暴力版）",
      methodDescription:
        "Prim算法从起点出发逐步扩展MST。每轮扫描所有候选边（已选节点→未选节点的边），选最小权边。暴力实现O(V²+E)，适合讲解算法思想。",
      code: `function prim(n: number, edges: [number, number, number][]): number {
  const adj: Map<number, [number, number][]> = new Map();
  for (let i = 1; i <= n; i++) adj.set(i, []);
  for (const [u, v, w] of edges) {
    adj.get(u)!.push([v, w]);
    adj.get(v)!.push([u, w]);
  }

  const inMST = new Array(n + 1).fill(false);
  inMST[1] = true;
  let totalWeight = 0, edgeCount = 0;

  for (let iter = 0; iter < n - 1; iter++) {
    let bestWeight = Infinity, bestFrom = -1, bestTo = -1;

    for (let u = 1; u <= n; u++) {
      if (!inMST[u]) continue;
      for (const [v, w] of adj.get(u)!) {
        if (!inMST[v] && w < bestWeight) {
          bestWeight = w;
          bestFrom = u;
          bestTo = v;
        }
      }
    }

    if (bestTo === -1) return -1; // 图不连通
    inMST[bestTo] = true;
    totalWeight += bestWeight;
    edgeCount++;
  }

  return edgeCount === n - 1 ? totalWeight : -1;
}`,
      language: "typescript",
      keyLines: [11, 14, 15, 24, 25, 26],
      steps: [
        "初始化：将起点（节点1）加入已选集合",
        "扫描所有已选节点的出边，找出连接到未选节点的边",
        "从候选边中选取权值最小的边",
        "将该边和新节点加入MST",
        "重复直到所有节点都在MST中（或图不连通）",
      ],
      advantages: [
        "基于节点的贪心，与Kruskal互补",
        "稠密图上邻接矩阵实现可达O(V²)",
        "堆优化可达O((V+E)logV)",
      ],
      timeComplexity: {
        value: "O(V²+E)（暴力）/ O((V+E)logV)（堆优化）",
        description: "暴力版每轮扫描所有候选边；堆优化用优先队列维护",
      },
      spaceComplexity: { value: "O(V+E)", description: "邻接表 + visited数组" },
      comparisons: [
        {
          name: "Kruskal",
          description: "基于边的贪心，按边权排序后用并查集",
          timeComplexity: "O(E log E)",
          spaceComplexity: "O(V+E)",
          isRecommended: false,
          pros: ["稀疏图高效", "实现简洁"],
          cons: ["需要排序"],
        },
        {
          name: "Prim（堆优化）",
          description: "基于节点的贪心，用优先队列维护候选边",
          timeComplexity: "O((V+E)logV)",
          spaceComplexity: "O(V+E)",
          isRecommended: true,
          pros: ["稠密图高效", "无需排序"],
          cons: ["需要优先队列支持"],
        },
      ],
    },
  },

  // ===== 图论：图的遍历（BFS/DFS）=====
  {
    id: 205,
    leetcodeNumber: 5318,
    title: "图的遍历（BFS与DFS）",
    difficulty: Difficulty.EASY,
    category: [Category.GRAPH],
    methods: [SolutionMethod.BFS, SolutionMethod.DFS],
    description: `给定一个无向图，从节点1出发，分别使用 BFS（广度优先搜索）和 DFS（深度优先搜索）进行遍历，观察两种策略的访问顺序差异。

BFS 使用队列（先进先出），按层次逐层访问，保证先访问距离起点近的节点。
DFS 使用递归/栈（后进先出），沿一条路径深入到底再回溯。

这是图论最基础的两种遍历策略，也是后续连通性、拓扑排序、最短路径等算法的基础。`,
    examples: [
      {
        input: "6 7\n1 2\n1 3\n2 4\n2 5\n3 6\n4 5\n5 6",
        output: "BFS: 1→2→3→4→5→6\nDFS: 1→2→4→5→6→3",
        explanation: "同一张图，BFS按层序访问，DFS按深度优先访问，产生不同的遍历顺序。",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 100",
      "1 ≤ m ≤ n(n-1)/2",
      "图连通",
    ],
    hints: [
      "BFS：用队列维护待访问节点",
      "DFS：用递归或显式栈维护待访问节点",
      "用 visited 数组避免重复访问",
      "邻接表存储图，邻居按编号排序以保证确定性输出",
    ],
    solution: {
      methodName: "BFS + DFS 对比",
      methodDescription:
        "BFS用队列实现：起点入队→出队访问→邻居入队→重复。DFS用递归实现：访问节点→递归访问未访问邻居→回溯。两种策略时间复杂度均为 O(V+E)。",
      code: `// BFS
function bfs(n: number, adj: Map<number, number[]>, start: number): number[] {
  const visited = new Array(n + 1).fill(false);
  const queue = [start];
  const order: number[] = [];
  visited[start] = true;

  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj.get(u) || []) {
      if (!visited[v]) {
        visited[v] = true;
        queue.push(v);
      }
    }
  }
  return order;
}

// DFS
function dfs(n: number, adj: Map<number, number[]>, start: number): number[] {
  const visited = new Array(n + 1).fill(false);
  const order: number[] = [];

  function dfsInner(u: number) {
    visited[u] = true;
    order.push(u);
    for (const v of adj.get(u) || []) {
      if (!visited[v]) dfsInner(v);
    }
  }

  dfsInner(start);
  return order;
}`,
      language: "typescript",
      keyLines: [8, 9, 23, 25, 26],
      steps: [
        "初始化 visited 数组",
        "BFS：起点入队，循环出队→访问→邻居入队",
        "DFS：从起点递归，访问→递归邻居→回溯",
        "输出遍历顺序",
      ],
      advantages: [
        "时间复杂度 O(V+E)，最优",
        "空间复杂度 O(V)",
        "BFS适合求无权图最短路径；DFS适合连通性、拓扑排序",
      ],
      timeComplexity: { value: "O(V+E)", description: "每个节点和边最多访问一次" },
      spaceComplexity: { value: "O(V)", description: "visited数组 + 队列/栈" },
      comparisons: [
        {
          name: "BFS",
          description: "广度优先，队列FIFO，按层访问",
          timeComplexity: "O(V+E)",
          spaceComplexity: "O(V)",
          isRecommended: false,
          pros: ["最短路径（无权图）", "层次信息"],
          cons: ["队列空间较大"],
        },
        {
          name: "DFS",
          description: "深度优先，递归/栈LIFO，深入到底",
          timeComplexity: "O(V+E)",
          spaceComplexity: "O(V)",
          isRecommended: true,
          pros: ["代码简洁", "递归栈深=图深"],
          cons: ["递归可能导致栈溢出"],
        },
      ],
    },
  },

  // ===== 图论：拓扑排序 =====
  {
    id: 206,
    leetcodeNumber: 1113,
    title: "拓扑排序 / 课程表",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.BFS, SolutionMethod.DFS],
    description: `给定一个有向图，请输出任意一个拓扑排序的结果。如果图中存在环，则无法进行拓扑排序。

拓扑排序是将有向无环图（DAG）的所有节点排成一个线性序列，使得对于每条有向边 u→v，u 在序列中都出现在 v 之前。

常用场景：课程选修顺序、项目任务调度、编译器依赖解析。

本可视化使用 Kahn 算法（BFS实现），通过维护入度数组，逐步删除入度为0的节点。`,
    examples: [
      {
        input: "6 7\n1 2\n1 3\n2 4\n3 4\n4 5\n5 6\n3 6",
        output: "1 → 2 → 3 → 4 → 5 → 6",
        explanation: "节点1入度=0开始，依次删除出边，形成合法的拓扑序列。",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 100",
      "1 ≤ m ≤ n(n-1)",
      "图可能包含环",
    ],
    hints: [
      "计算每个节点的入度",
      "入度为0的节点入队",
      "出队→删除出边→邻居入度-1",
      "入度变为0则入队",
      "队列为空时若未处理完所有节点则存在环",
    ],
    solution: {
      methodName: "Kahn算法（BFS拓扑排序）",
      methodDescription:
        "计算入度 → 入度0入队 → 出队处理 → 删除出边(邻居入度-1) → 新入度0入队 → 重复。若最终未处理完所有节点则存在环。",
      code: `function topologicalSort(n: number, edges: [number, number][]): number[] {
  const inDegree = new Array(n + 1).fill(0);
  const adj: Map<number, number[]> = new Map();
  for (let i = 1; i <= n; i++) adj.set(i, []);
  for (const [u, v] of edges) {
    adj.get(u)!.push(v);
    inDegree[v]++;
  }

  const queue: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);
    for (const v of adj.get(u)!) {
      if (--inDegree[v] === 0) queue.push(v);
    }
  }

  return result.length === n ? result : []; // 空数组表示有环
}`,
      language: "typescript",
      keyLines: [10, 11, 16, 18, 19, 20],
      steps: [
        "构建邻接表和入度数组",
        "所有入度为0的节点入队",
        "出队一个节点，加入结果序列",
        "删除该节点的所有出边（邻居入度-1）",
        "邻居入度变为0则入队",
        "重复直到队列为空",
      ],
      advantages: [
        "时间复杂度 O(V+E)",
        "空间复杂度 O(V+E)",
        "可检测环（结果长度 < n 则有环）",
        "BFS实现直观易懂",
      ],
      timeComplexity: { value: "O(V+E)", description: "每个节点和边处理一次" },
      spaceComplexity: { value: "O(V+E)", description: "邻接表 + 入度数组 + 队列" },
      comparisons: [
        {
          name: "Kahn算法（BFS）",
          description: "基于入度维护和队列",
          timeComplexity: "O(V+E)",
          spaceComplexity: "O(V+E)",
          isRecommended: true,
          pros: ["直观", "易实现", "天然检测环"],
          cons: [],
        },
        {
          name: "DFS后序遍历",
          description: "DFS + 逆后序 = 拓扑排序",
          timeComplexity: "O(V+E)",
          spaceComplexity: "O(V)",
          isRecommended: false,
          pros: ["空间稍小"],
          cons: ["递归实现", "需额外反转"],
        },
      ],
    },
  },

  // ===== 动态规划：最长递增子序列 (LIS) =====
  {
    id: 207,
    leetcodeNumber: 300,
    title: "最长递增子序列（LIS）",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个整数数组 nums，找到其中最长严格递增子序列的长度。

子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。

LIS 是动态规划的经典入门问题，状态定义直观：dp[i] = 以 nums[i] 结尾的最长递增子序列长度。`,
    examples: [
      {
        input: "10 9 2 5 3 7 101 18",
        output: "4",
        explanation: "最长递增子序列是 [2, 3, 7, 101]，长度为4。",
      },
      {
        input: "0 1 0 3 2 3",
        output: "4",
        explanation: "最长递增子序列是 [0, 1, 2, 3]，长度为4。",
      },
      {
        input: "7 7 7 7 7",
        output: "1",
        explanation: "所有元素相同，严格递增子序列只能是单个元素。",
      },
    ],
    constraints: [
      "1 <= nums.length <= 2500",
      "-10^4 <= nums[i] <= 10^4",
    ],
    hints: [
      "dp[i] 表示以 nums[i] 结尾的最长递增子序列长度",
      "对每个 i，检查所有 j < i：若 nums[j] < nums[i]，则 dp[i] = max(dp[i], dp[j] + 1)",
      "时间复杂度 O(n²)，可用贪心+二分优化到 O(n log n)",
      "维护 prev 数组可以回溯出具体序列",
    ],
    solution: {
      methodName: "动态规划 O(n²)",
      methodDescription:
        "dp[i] = 以 nums[i] 结尾的最长递增子序列长度。对每个 i，枚举 j < i，如果 nums[j] < nums[i]，则可拼接：dp[i] = max(dp[i], dp[j] + 1)。",
      code: `function lengthOfLIS(nums: number[]): number {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  let maxLen = 1;

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }

  return maxLen;
}`,
      language: "typescript",
      keyLines: [3, 8, 9, 12],
      steps: [
        "初始化 dp[i] = 1",
        "遍历每个 i（1 到 n-1）",
        "对每个 j < i，若 nums[j] < nums[i]，尝试拼接",
        "更新 dp[i] = max(dp[i], dp[j] + 1)",
        "更新全局最大值",
      ],
      advantages: [
        "状态定义直观，易于理解",
        "可扩展为最长非递减子序列",
        "可用贪心+二分优化到 O(n log n)",
      ],
      timeComplexity: { value: "O(n²)", description: "双重循环" },
      spaceComplexity: { value: "O(n)", description: "dp 数组" },
      comparisons: [
        {
          name: "DP O(n²)",
          description: "双重循环枚举所有 j < i",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["直观", "易理解"],
          cons: ["n 大时较慢"],
        },
        {
          name: "贪心+二分",
          description: "维护 tails 数组，二分查找插入位置",
          timeComplexity: "O(n log n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["高效", "竞赛推荐写法"],
          cons: ["不易理解", "tails 数组非真实LIS序列"],
        },
      ],
    },
  },

  // ===== 动态规划：最长公共子序列 (LCS) =====
  {
    id: 208,
    leetcodeNumber: 1143,
    title: "最长公共子序列（LCS）",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给定两个字符串 text1 和 text2，返回这两个字符串的最长公共子序列的长度。

子序列由原字符串在不改变字符相对顺序的情况下删除某些字符后形成。

LCS 是最经典的二维动态规划问题，状态转移优雅：字符匹配则斜上+1，否则取左上的最大值。`,
    examples: [
      {
        input: "abcde\nace",
        output: "3（LCS = ace）",
        explanation: "text1='abcde', text2='ace'，最长公共子序列是 'ace'。",
      },
      {
        input: "abc\nabc",
        output: "3（LCS = abc）",
        explanation: "两字符串完全相同。",
      },
      {
        input: "abc\ndef",
        output: "0",
        explanation: "没有公共字符。",
      },
    ],
    constraints: [
      "1 <= text1.length, text2.length <= 1000",
      "text1 和 text2 仅由小写英文字符组成",
    ],
    hints: [
      "dp[i][j] = text1[0..i-1] 与 text2[0..j-1] 的LCS长度",
      "text1[i-1] == text2[j-1] → dp[i][j] = dp[i-1][j-1] + 1",
      "text1[i-1] ≠ text2[j-1] → dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
      "从 dp[m][n] 回溯可得LCS序列",
    ],
    solution: {
      methodName: "二维动态规划",
      methodDescription:
        "dp[i][j] 表示 text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度。字符匹配时 dp[i][j] = dp[i-1][j-1] + 1，否则取 max(dp[i-1][j], dp[i][j-1])。",
      code: `function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}`,
      language: "typescript",
      keyLines: [5, 8, 9, 11, 13],
      steps: [
        "初始化 dp 表 (m+1)×(n+1)，第一行/列均为0",
        "遍历 text1 的每个字符（i=1..m）",
        "遍历 text2 的每个字符（j=1..n）",
        "字符匹配 → dp[i][j] = dp[i-1][j-1] + 1",
        "字符不匹配 → dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
        "从 dp[m][n] 回溯可得LCS序列",
      ],
      advantages: [
        "经典二维DP，状态转移清晰",
        "可回溯输出具体LCS序列",
        "是编辑距离、序列比对等问题的基础",
      ],
      timeComplexity: { value: "O(m×n)", description: "双重循环" },
      spaceComplexity: { value: "O(m×n)", description: "可优化到 O(min(m,n))" },
      comparisons: [
        {
          name: "二维DP",
          description: "完整DP表，可回溯",
          timeComplexity: "O(m×n)",
          spaceComplexity: "O(m×n)",
          isRecommended: true,
          pros: ["直观", "可回溯LCS序列"],
          cons: ["空间较大"],
        },
        {
          name: "滚动数组优化",
          description: "只保留两行，空间O(min(m,n))",
          timeComplexity: "O(m×n)",
          spaceComplexity: "O(min(m,n))",
          isRecommended: false,
          pros: ["空间小"],
          cons: ["无法回溯LCS序列"],
        },
      ],
    },
  },
];
