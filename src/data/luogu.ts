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
      methodName: "Dijkstra + 优先队列",
      methodDescription:
        "Dijkstra算法使用贪心策略，每次从未访问节点中选择距离最小的节点，对其所有出边进行松弛操作。使用优先队列（最小堆）可以将时间复杂度优化到O((V+E)log V)。",
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
        value: "O((V+E) log V)",
        description: "优先队列优化后，V个节点各入队一次，E条边各松弛一次",
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
];
