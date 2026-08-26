import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

export const luoguProblems: Problem[] = [
  // ===== 图论：最短路 =====
  {
    id: 200,
    luoguNumber: "P4779",
    title: "【模板】单源最短路径（标准版）",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.GREEDY],
    description: `给定一个 n 个点、m 条有向边的带非负权图，请你计算从起点 s 出发，到每个点的最短距离。

数据保证能从 s 出发到任意点。

这是 Dijkstra 算法的标准模板题。`,
    examples: [
      {
        input: "4 6 1\n1 2 2\n2 3 2\n2 4 1\n1 3 5\n3 4 3\n1 4 4",
        output: "0 2 4 3",
        explanation: "从节点1出发：到节点2最短距离=2，到节点3最短距离=4（1→2→3），到节点4最短距离=3（1→2→4）。",
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
      keyLines: [12, 14, 17, 24, 29],
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
    luoguNumber: "P3366",
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
      keyLines: [3, 5, 22, 23, 24, 25, 27],
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
    luoguNumber: "B3611",
    title: "【模板】传递闭包",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给定一张点数为 n 的有向图的邻接矩阵（图中不包含自环），求该有向图的传递闭包。

邻接矩阵 a[i][j] = 1 表示 i 到 j 存在直接连边，0 表示没有。传递闭包 b[i][j] = 1 表示 i 可以直接或间接到达 j，0 表示无法到达。

Floyd-Warshall 的布尔版本：对于每对节点 (i, j)，依次尝试以每个节点 k 作为中间节点——若 i 可达 k 且 k 可达 j，则 i 可达 j。

reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])`,
    examples: [
      {
        input: "4\n0 0 0 1\n1 0 0 0\n0 0 0 1\n0 1 0 0",
        output: "1 1 0 1\n1 1 0 1\n1 1 0 1\n1 1 0 1",
        explanation: "1→4→2→1 构成环：节点 1、2、4 都能间接到达自己（对角线为 1）；节点 3 不在任何环上，b[3][3]=0。所有点都可到达 1、2、4，但都无法到达 3。",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 100",
      "a[i][j] ∈ {0,1}，且 a[i][i] = 0（无自环）",
    ],
    hints: [
      "三重循环：for k: for i: for j",
      "reach[i][j] = reach[i][j] | (reach[i][k] & reach[k][j])",
      "对角线不一定为 1：只有存在经过 i 的环时，i 才能间接到达自己",
      "注意中间节点k必须在最外层循环",
    ],
    solution: {
      methodName: "Floyd 布尔版（传递闭包）",
      methodDescription:
        "把可达性看成布尔值，用 Floyd 的三重循环做传递：reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])。若 i 能到 k 且 k 能到 j，则 i 就能到 j。注意对角线不需要预先置 1——节点在环上时会自动变为 1。",
      code: `function transitiveClosure(n: number, graph: number[][]): number[][] {
  const reach = graph.map(row => [...row]);

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (reach[i][k] && reach[k][j]) {
          reach[i][j] = 1;
        }
      }
    }
  }

  return reach;
}`,
      language: "typescript",
      keyLines: [4, 5, 6, 7],
      steps: [
        "将原图的邻接矩阵复制为reach",
        "枚举中间节点k（最外层循环）",
        "枚举起点i和终点j",
        "若 i 可达 k 且 k 可达 j，则 reach[i][j] = 1",
        "三重循环完成后reach即为传递闭包（环上节点的对角线自动变1）",
      ],
      advantages: [
        "时间复杂度O(n³)",
        "空间复杂度O(n²)",
        "代码极其简洁",
        "可同时求出所有点对的可达性",
      ],
      timeComplexity: { value: "O(n³)", description: "三重循环" },
      spaceComplexity: { value: "O(n²)", description: "可达矩阵" },
      comparisons: [
        {
          name: "Floyd 布尔版",
          description: "三重循环布尔传递，一次求出所有点对可达性",
          timeComplexity: "O(n³)",
          spaceComplexity: "O(n²)",
          isRecommended: true,
          pros: ["代码简洁", "一次求出全源可达性"],
          cons: ["O(n³)在大图上效率低"],
        },
        {
          name: "DFS/BFS × n次",
          description: "对每个节点跑一次遍历标记可达节点",
          timeComplexity: "O(n(n+m))",
          spaceComplexity: "O(n+m)",
          isRecommended: false,
          pros: ["稀疏图效率更高"],
          cons: ["实现更繁琐"],
        },
      ],
    },
  },

  // ===== 动态规划：01背包 =====
  {
    id: 203,
    luoguNumber: "P1048",
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
    luoguNumber: "P3366",
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
      keyLines: [11, 13, 14, 27, 28, 29],
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
    luoguNumber: "P5318",
    title: "图的遍历（BFS与DFS）",
    difficulty: Difficulty.EASY,
    category: [Category.GRAPH],
    methods: [SolutionMethod.BFS, SolutionMethod.DFS],
    description: `小 K 喜欢翻看洛谷博客获取知识。每篇文章可能有若干篇参考文献。如果看了某篇文章，就一定会去看它的参考文献（看过的跳过）。

洛谷博客里一共有 n 篇文章（编号 1 到 n）以及 m 条引用关系，X→Y 表示文章 X 有参考文献 Y。目前已经打开了编号为 1 的文章，请不重复、不遗漏地看完所有能看到的文章——对这个有向图分别进行 DFS 和 BFS，并输出遍历结果。如果有很多篇文章可以参阅，先看编号较小的那篇。`,
    examples: [
      {
        input: "8 9\n1 2\n1 3\n1 4\n2 5\n2 6\n3 7\n4 7\n4 8\n7 8",
        output: "DFS: 1→2→5→6→3→7→8→4\nBFS: 1→2→3→4→5→6→7→8",
        explanation: "官方样例：DFS 沿引用链深入（1→2→5→6→3→7→8→4），BFS 按层遍历（1→2→3→4→5→6→7→8），顺序不同。",
      },
      {
        input: "6 7\n1 2\n1 3\n2 4\n2 5\n3 6\n4 5\n5 6",
        output: "BFS: 1→2→3→4→5→6\nDFS: 1→2→4→5→6→3",
        explanation: "同一张图，BFS按层序访问，DFS按深度优先访问，产生不同的遍历顺序。",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 10^5",
      "1 ≤ m ≤ 10^6",
      "图不一定连通（从 1 出发只遍历可达部分）",
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
      keyLines: [8, 9, 23, 26, 27, 30],
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

  // ===== 图论：拓扑排序 + DP（杂务） =====
  {
    id: 206,
    luoguNumber: "P1113",
    title: "【USACO02FEB】杂务（拓扑排序 + DP）",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING, SolutionMethod.BFS],
    description: `John 的农场在给奶牛挤奶前有很多杂务要完成，每项杂务都需要一定的时间。有些杂务必须在另一些杂务完成的情况下才能进行（准备工作）。至少有一项杂务不要求准备工作，标记为杂务 1。

杂务 k (k>1) 的准备工作只可能在杂务 1 至 k-1 中——因此按编号顺序天然是拓扑序。互相没有关系的杂务可以同时进行（工人足够多）。请计算所有杂务都被完成的最短时间。

f[i] = len[i] + max(f[前置])，答案 = max(f[i])，即 DAG 上的关键路径。`,
    examples: [
      {
        input: "7\n1 5 0\n2 2 1 0\n3 3 2 0\n4 6 1 0\n5 1 2 4 0\n6 8 2 4 0\n7 4 3 5 6 0",
        output: "23",
        explanation: "官方样例。f[1]=5，f[2]=7，f[3]=10，f[4]=11，f[5]=12，f[6]=19，f[7]=4+max(10,12,19)=23。杂务 7 依赖的链条 1→4→6→7（或 1→2→4→6→7）是决定总时长的关键路径。",
      },
    ],
    constraints: [
      "3 ≤ n ≤ 10,000",
      "1 ≤ len ≤ 100",
      "每个杂务的前置杂务不超过 100 个",
    ],
    hints: [
      "杂务 k 的前置只在 1..k-1 中：按编号顺序即拓扑序",
      "f[i] = len[i] + max(f[前置])",
      "答案 = max(f[i])（关键路径长度）",
      "也可以建图后跑 Kahn 拓扑排序，入度减到 0 时更新 f",
    ],
    solution: {
      methodName: "拓扑序 DP（关键路径）",
      methodDescription:
        "因为杂务 k 的前置只在 1..k-1 中，按编号顺序计算就满足拓扑序：处理杂务 k 时其所有前置的 f 都已算出。f[k] = len[k] + max(f[前置])，所有 f 的最大值就是答案。",
      code: `function chores(n: number, tasks: { id: number; len: number; prereqs: number[] }[]): number {
  const finish = new Array(n + 1).fill(0);
  let answer = 0;

  for (const task of tasks) { // 按编号顺序，天然拓扑序
    let maxPre = 0;
    for (const pre of task.prereqs) {
      maxPre = Math.max(maxPre, finish[pre]);
    }
    finish[task.id] = task.len + maxPre;
    answer = Math.max(answer, finish[task.id]);
  }

  return answer;
}`,
      language: "typescript",
      keyLines: [5, 6, 8, 10, 11],
      steps: [
        "读入 n 个杂务（序号、耗时、前置列表）",
        "按编号顺序处理（前置只在 1..k-1 中，天然拓扑序）",
        "取所有前置 f 的最大值 maxPre",
        "f[k] = len[k] + maxPre",
        "用 f[k] 更新全局答案，最后输出 max(f[i])",
      ],
      advantages: [
        "时间复杂度 O(n + 前置总数)",
        "空间复杂度 O(n)",
        "无需显式拓扑排序：编号顺序即拓扑序",
        "关键路径思想，可并行杂务自然处理",
      ],
      timeComplexity: { value: "O(n + m)", description: "每个杂务和每条前置关系处理一次" },
      spaceComplexity: { value: "O(n)", description: "f 数组" },
      comparisons: [
        {
          name: "顺序 DP（编号即拓扑序）",
          description: "利用前置只在 1..k-1 的性质直接按编号计算",
          timeComplexity: "O(n + m)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["代码最简洁", "无需建图"],
          cons: ["依赖题目给出的顺序性质"],
        },
        {
          name: "Kahn 拓扑排序 + DP",
          description: "显式建图、维护入度，入度减到 0 时更新 f",
          timeComplexity: "O(n + m)",
          spaceComplexity: "O(n + m)",
          isRecommended: false,
          pros: ["通用：不依赖输入顺序", "适用一般 DAG"],
          cons: ["需要建图和队列"],
        },
      ],
    },
  },

  // ===== 动态规划：最长上升子序列 (LIS) =====
  {
    id: 207,
    luoguNumber: "B3637",
    title: "最长上升子序列（LIS）",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `这是一个简单的动态规划模板题。

给出一个由 n (n ≤ 5000) 个不超过 10^6 的正整数组成的序列。请输出这个序列的最长上升子序列的长度。

最长上升子序列是指，从原序列中按顺序尽可能多取出一些数字排在一起，这些数字是逐渐增大的。`,
    examples: [
      {
        input: "6\n1 2 4 1 3 4",
        output: "4",
        explanation: "分别取出 1、2、3、4 即可，它们构成最长的上升子序列。",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 5000",
      "1 ≤ a[i] ≤ 10^6",
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
    luoguNumber: "P1439",
    title: "【模板】最长公共子序列",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING, SolutionMethod.BINARY_SEARCH],
    description: `给出 1,2,…,n 的两个排列 P1 和 P2，求它们的最长公共子序列。

这是 LCS 的经典模板题。两个序列都是 1..n 的排列这一性质非常关键：可以把 P1 中每个数的位置映射出来，再把 P2 的每个数换成它在 P1 中的位置——LCS 就转化成了最长上升子序列（LIS），可以用 O(n log n) 求解。`,
    examples: [
      {
        input: "5\n3 2 1 4 5\n1 2 3 4 5",
        output: "3",
        explanation: "官方样例。P1=[3,2,1,4,5]，P2=[1,2,3,4,5]，最长公共子序列为 [3,4,5]（或 [1,4,5]、[2,4,5]），长度为 3。",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 10^5",
      "每行都是 1..n 的一个排列",
    ],
    hints: [
      "一般解法：二维 DP，dp[i][j] = 相等?左上+1 : max(上,左)，O(n²)",
      "排列性质：P2 的元素换成在 P1 中的位置后，LCS 变成 LIS",
      "LIS 可用贪心+二分做到 O(n log n)，能通过 n=10^5 的数据",
      "可视化演示用 O(n²) DP 展示状态转移，输入 n 限制为 60 以内",
    ],
    solution: {
      methodName: "排列转 LIS（O(n log n)）",
      methodDescription:
        "因为两个序列都是 1..n 的排列：记录 P1 中每个数的位置 pos[x]，把 P2 的每个数换成 pos[x]，则两排列的公共子序列恰好对应一个在 P1 中位置递增的序列——LCS 转化为 LIS。用 tails 数组 + 二分求严格 LIS，时间复杂度 O(n log n)。",
      code: `function lcsPermutation(n: number, p1: number[], p2: number[]): number {
  const pos = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) pos[p1[i]] = i + 1; // p1 中每个数的位置

  const tails: number[] = []; // 贪心维护的 LIS 尾巴数组
  for (const x of p2) {
    const idx = pos[x]; // 转成在 p1 中的位置
    let l = 0, r = tails.length;
    while (l < r) { // 二分第一个 >= idx 的位置
      const mid = (l + r) >> 1;
      if (tails[mid] < idx) l = mid + 1;
      else r = mid;
    }
    if (l === tails.length) tails.push(idx);
    else tails[l] = idx;
  }

  return tails.length;
}`,
      language: "typescript",
      keyLines: [3, 5, 7, 9, 14],
      steps: [
        "记录 P1 中每个数的位置 pos[x]",
        "把 P2 的每个数换成它在 P1 中的位置 idx",
        "LCS 问题转化为求 idx 序列的最长上升子序列",
        "tails 数组 + 二分维护 LIS（贪心）",
        "tails 的长度即答案（LCS 长度）",
      ],
      advantages: [
        "时间复杂度 O(n log n)，可通过 n=10^5",
        "空间复杂度 O(n)",
        "利用排列性质将 LCS 转化为 LIS",
        "贪心 + 二分是竞赛标准写法",
      ],
      timeComplexity: { value: "O(n log n)", description: "每个元素一次二分" },
      spaceComplexity: { value: "O(n)", description: "pos 数组 + tails 数组" },
      comparisons: [
        {
          name: "排列转 LIS",
          description: "利用排列性质转化后贪心+二分",
          timeComplexity: "O(n log n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["能通过 n=10^5", "代码简洁"],
          cons: ["依赖两个序列都是排列"],
        },
        {
          name: "二维 DP",
          description: "一般 LCS 解法（可视化演示用它）",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(n²)",
          isRecommended: false,
          pros: ["适用任意序列", "直观、可回溯"],
          cons: ["n=10^5 会超时/超内存"],
        },
      ],
    },
  },
];
