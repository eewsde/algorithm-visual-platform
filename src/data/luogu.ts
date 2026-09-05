import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

export const luoguProblems: Problem[] = [
  // ===== 图论：最短路 =====
  {
    id: 1,
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
      methodName: "Dijkstra（暴力版 + 堆优化版）",
      methodDescription:
        "Dijkstra算法使用贪心策略：每次取出未访问中距离最小的节点，对其所有出边进行松弛操作。暴力版每轮线性扫描找最小值，O(V²+E)，步骤直观、适合教学演示；堆优化版用优先队列维护候选节点，O((V+E)logV)，是竞赛标准写法、能通过 P4779 的数据范围。本页支持两种版本一键切换。",
      // 多语言代码版本（题解区顶部可切换 C++ / Python）
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, s;                     // 点数、边数、起点
    cin >> n >> m >> s;

    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});    // 有向边
    }

    const int INF = INT_MAX;
    vector<int> dist(n + 1, INF);    // 最短距离
    vector<bool> visited(n + 1, false);
    dist[s] = 0;

    for (int cnt = 0; cnt < n; cnt++) {
        // 找未访问中距离最小的节点
        int u = -1, minDist = INF;
        for (int i = 1; i <= n; i++) {
            if (!visited[i] && dist[i] < minDist) {
                minDist = dist[i];
                u = i;
            }
        }
        if (u == -1) break;          // 剩余节点不可达
        visited[u] = true;

        // 松弛 u 的所有出边
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }

    for (int i = 1; i <= n; i++) {
        cout << (dist[i] == INF ? -1 : dist[i])
             << (i == n ? "\\n" : " ");
    }
    return 0;
}`,
          keyLines: [23, 25, 28, 34, 35, 39, 40],
          variant: "brute",
        },
        {
          language: "python",
          label: "Python",
          code: `import sys

def main():
    input = sys.stdin.readline
    n, m, s = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v, w = map(int, input().split())
        adj[u].append((v, w))        # 有向边

    INF = float('inf')
    dist = [INF] * (n + 1)           # 最短距离
    visited = [False] * (n + 1)
    dist[s] = 0

    for _ in range(n):
        # 找未访问中距离最小的节点
        u, min_dist = -1, INF
        for i in range(1, n + 1):
            if not visited[i] and dist[i] < min_dist:
                min_dist = dist[i]
                u = i
        if u == -1:
            break                    # 剩余节点不可达
        visited[u] = True

        # 松弛 u 的所有出边
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    print(' '.join(str(-1 if dist[i] == INF else dist[i]) for i in range(1, n + 1)))

if __name__ == '__main__':
    main()`,
          keyLines: [15, 17, 20, 24, 26, 30, 31],
          variant: "brute",
        },
        {
          language: "cpp",
          label: "C++",
          variant: "heap",
          code: `#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, s;                     // 点数、边数、起点
    cin >> n >> m >> s;

    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});    // 有向边
    }

    const int INF = INT_MAX;
    vector<int> dist(n + 1, INF);    // 最短距离
    dist[s] = 0;

    // 小根堆：{距离, 节点}，堆顶始终是当前最小距离
    priority_queue<pair<int, int>, vector<pair<int, int>>,
                   greater<pair<int, int>>> pq;
    pq.push({0, s});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;   // 过期记录，跳过（懒删除）

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v}); // 松弛成功才入堆
            }
        }
    }

    for (int i = 1; i <= n; i++) {
        cout << (dist[i] == INF ? -1 : dist[i])
             << (i == n ? "\\n" : " ");
    }
    return 0;
}`,
          keyLines: [26, 28, 31, 33, 37, 38],
        },
        {
          language: "python",
          label: "Python",
          variant: "heap",
          code: `import sys
import heapq

def main():
    input = sys.stdin.readline
    n, m, s = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v, w = map(int, input().split())
        adj[u].append((v, w))        # 有向边

    INF = float('inf')
    dist = [INF] * (n + 1)           # 最短距离
    dist[s] = 0

    # 小根堆：元素为 (距离, 节点)，堆顶始终是当前最小距离
    pq = [(0, s)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:              # 过期记录，跳过（懒删除）
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))  # 松弛成功才入堆

    print(' '.join(str(-1 if dist[i] == INF else dist[i]) for i in range(1, n + 1)))

if __name__ == '__main__':
    main()`,
          keyLines: [18, 20, 21, 25, 26],
        },
      ],

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
          pros: ["实现简单", "适合教学演示，每步直观"],
          cons: ["节点多时超时，过不了 P4779"],
        },
        {
          name: "Dijkstra（堆优化）",
          description: "使用优先队列维护最小距离",
          timeComplexity: "O((V+E)log V)",
          spaceComplexity: "O(V+E)",
          isRecommended: true,
          pros: ["稀疏图高效", "竞赛标准写法", "能通过 P4779 数据范围"],
          cons: ["需要优先队列支持"],
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
    id: 2,
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
      // 多语言代码版本（题解区顶部可切换 C++ / Python）
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Edge { int u, v, w; };

vector<int> parent, rnk;

int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];   // 路径压缩
        x = parent[x];
    }
    return x;
}

bool unite(int x, int y) {
    int px = find(x), py = find(y);
    if (px == py) return false;          // 已连通，会成环
    if (rnk[px] < rnk[py]) swap(px, py);
    parent[py] = px;
    if (rnk[px] == rnk[py]) rnk[px]++;   // 按秩合并
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }
    sort(edges.begin(), edges.end(),
         [](const Edge& a, const Edge& b) { return a.w < b.w; });

    parent.resize(n + 1);
    rnk.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) parent[i] = i;

    long long total = 0;
    int cnt = 0;
    for (const auto& e : edges) {
        if (unite(e.u, e.v)) {            // 不形成环则选入
            total += e.w;
            if (++cnt == n - 1) break;    // 已选满 n-1 条边
        }
    }

    cout << (cnt == n - 1 ? total : -1) << endl;  // -1 表示图不连通
    return 0;
}`,
          keyLines: [38,43,47,48,49,50],
        },
        {
          language: "python",
          label: "Python",
          code: `import sys

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    edges = []
    for _ in range(m):
        u, v, w = map(int, input().split())
        edges.append((w, u, v))
    edges.sort()                          # 按边权升序

    parent = list(range(n + 1))
    rank = [0] * (n + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # 路径压缩
            x = parent[x]
        return x

    def unite(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False                  # 已连通，会成环
        if rank[px] < rank[py]:
            px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]:
            rank[px] += 1                 # 按秩合并
        return True

    total, cnt = 0, 0
    for w, u, v in edges:
        if unite(u, v):                   # 不形成环则选入
            total += w
            cnt += 1
            if cnt == n - 1:
                break                     # 已选满 n-1 条边

    print(total if cnt == n - 1 else -1)  # -1 表示图不连通

if __name__ == '__main__':
    main()`,
          keyLines: [11,13,34,35,36,38],
        },
      ],
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
    id: 3,
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
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<vector<int>> reach(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> reach[i][j];        // 0/1 邻接矩阵

    // Floyd 布尔版：三重循环，k 在最外层
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (reach[i][k] && reach[k][j])
                    reach[i][j] = 1;   // i 可经 k 到达 j

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++)
            cout << reach[i][j] << (j == n - 1 ? "\\n" : " ");
    }
    return 0;
}`,
          keyLines : [15,18,19,20,21,22],
        },
        {
          language: "python",
          label: "Python",
          code: `def main():
    input = sys.stdin.readline
    n = int(input())

    reach = [list(map(int, input().split())) for _ in range(n)]  # 0/1 邻接矩阵

    # Floyd 布尔版：三重循环，k 在最外层
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if reach[i][k] and reach[k][j]:
                    reach[i][j] = 1           # i 可经 k 到达 j

    for row in reach:
        print(' '.join(map(str, row)))

if __name__ == '__main__':
    main()`,
          keyLines: [7,10,11,12],
        },
      ],
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
    id: 4,
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
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T, M;                        // 总时间、草药数
    cin >> T >> M;

    vector<int> dp(T + 1, 0);        // dp[j]：时间 j 内能获得的最大价值

    for (int i = 0; i < M; i++) {
        int time, value;
        cin >> time >> value;

        // 逆序遍历容量，保证每株草药最多选一次（01背包关键）
        for (int j = T; j >= time; j--) {
            dp[j] = max(dp[j], dp[j - time] + value);
        }
    }

    cout << dp[T] << endl;
    return 0;
}`,
          keyLines : [13,15,20,21],
        },
        {
          language: "python",
          label: "Python",
          code: `import sys

def main():
    input = sys.stdin.readline
    T, M = map(int, input().split())   # 总时间、草药数

    dp = [0] * (T + 1)                 # dp[j]：时间 j 内能获得的最大价值

    for _ in range(M):
        time, value = map(int, input().split())

        # 逆序遍历容量，保证每株草药最多选一次（01背包关键）
        for j in range(T, time - 1, -1):
            dp[j] = max(dp[j], dp[j - time] + value)

    print(dp[T])

if __name__ == '__main__':
    main()`,
          keyLines: [7,9,13,14],
        },
      ],
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
    id: 5,
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
      // 多语言代码版本（题解区顶部可切换 C++ / Python）
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});         // 无向边
    }

    vector<bool> inMST(n + 1, false);
    inMST[1] = true;                      // 从节点 1 出发
    long long total = 0;
    int cnt = 0;

    for (int iter = 0; iter < n - 1; iter++) {
        // 扫描所有候选边：已选节点 → 未选节点
        int bestW = INT_MAX, bestV = -1;
        for (int u = 1; u <= n; u++) {
            if (!inMST[u]) continue;
            for (auto [v, w] : adj[u]) {
                if (!inMST[v] && w < bestW) {
                    bestW = w;
                    bestV = v;
                }
            }
        }
        if (bestV == -1) break;           // 图不连通
        inMST[bestV] = true;
        total += bestW;
        cnt++;
    }

    cout << (cnt == n - 1 ? total : -1) << endl;
    return 0;
}`,
          keyLines: [22, 26, 28, 32, 39, 40],
        },
        {
          language: "python",
          label: "Python",
          code: `import sys

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v, w = map(int, input().split())
        adj[u].append((v, w))
        adj[v].append((u, w))           # 无向边

    in_mst = [False] * (n + 1)
    in_mst[1] = True                    # 从节点 1 出发
    total, cnt = 0, 0

    for _ in range(n - 1):
        # 扫描所有候选边：已选节点 → 未选节点
        best_w, best_v = float('inf'), -1
        for u in range(1, n + 1):
            if not in_mst[u]:
                continue
            for v, w in adj[u]:
                if not in_mst[v] and w < best_w:
                    best_w = w
                    best_v = v
        if best_v == -1:
            break                       # 图不连通
        in_mst[best_v] = True
        total += best_w
        cnt += 1

    print(total if cnt == n - 1 else -1)

if __name__ == '__main__':
    main()`,
          keyLines: [14, 17, 19, 24, 29, 30],
        },
      ],
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
          name: "Prim（暴力版）",
          description: "基于节点的贪心，每轮扫描所有候选边选最小边",
          timeComplexity: "O(V²+E)",
          spaceComplexity: "O(V+E)",
          isRecommended: true,
          pros: ["实现简单", "适合讲解算法思想"],
          cons: ["节点多时效率较低"],
        },
        {
          name: "Prim（堆优化）",
          description: "用优先队列维护候选边，加速找最小值",
          timeComplexity: "O((V+E)logV)",
          spaceComplexity: "O(V+E)",
          isRecommended: false,
          pros: ["稠密图更高效", "竞赛常用写法"],
          cons: ["需要优先队列支持"],
        },
      ],
    },
  },

  // ===== 图论：图的遍历（BFS/DFS）=====
  {
    id: 6,
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
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

int n, m;
vector<vector<int>> adj;
vector<bool> visited;

// DFS（迭代栈，逆序压栈保证与递归顺序一致）
void dfs(int start) {
    vector<int> st = {start};
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        if (visited[u]) continue;
        visited[u] = true;
        cout << u << " ";
        for (int i = (int)adj[u].size() - 1; i >= 0; i--) {
            int v = adj[u][i];
            if (!visited[v]) st.push_back(v);
        }
    }
    cout << "\\n";
}

// BFS（队列）
void bfs(int start) {
    fill(visited.begin(), visited.end(), false);
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    cout << "\\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    adj.assign(n + 1, {});
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);        // 有向边 X→Y
    }
    for (int i = 1; i <= n; i++) {
        sort(adj[i].begin(), adj[i].end());  // 先看编号较小
    }

    visited.assign(n + 1, false);
    dfs(1);
    bfs(1);
    return 0;
}`,
          keyLines: [17, 20, 34, 38, 40, 57, 60],
        },
        {
          language: "python",
          label: "Python",
          code: `import sys
from collections import deque

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v = map(int, input().split())
        adj[u].append(v)             # 有向边 X→Y

    for nb in adj:
        nb.sort()                    # 先看编号较小

    # DFS（迭代栈，逆序压栈保证与递归顺序一致）
    visited = [False] * (n + 1)
    stack = [1]
    order = []
    while stack:
        u = stack.pop()
        if visited[u]:
            continue
        visited[u] = True
        order.append(u)
        for v in reversed(adj[u]):
            if not visited[v]:
                stack.append(v)
    print(' '.join(map(str, order)))

    # BFS（队列）
    visited = [False] * (n + 1)
    q = deque([1])
    visited[1] = True
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                q.append(v)
    print(' '.join(map(str, order)))

if __name__ == '__main__':
    main()`,
          keyLines: [11, 14, 21, 26, 36, 39, 41],
        },
      ],
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
          isRecommended: true,
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
    id: 7,
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
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<int> finish(n + 1, 0);   // f[i]：杂务 i 的最早完成时间
    int answer = 0;

    for (int i = 1; i <= n; i++) {
        int id, len;
        cin >> id >> len;

        // 前置编号 <= id-1，其 f 值必已算好（天然拓扑序）
        int maxPre = 0;
        int pre;
        while (cin >> pre && pre != 0) {
            maxPre = max(maxPre, finish[pre]);
        }

        finish[id] = len + maxPre;
        answer = max(answer, finish[id]);
    }

    cout << answer << endl;
    return 0;
}`,
          keyLines: [13, 16, 23, 24, 27, 28],
        },
        {
          language: "python",
          label: "Python",
          code: `import sys

def main():
    input = sys.stdin.readline
    n = int(input())

    finish = [0] * (n + 1)          # f[i]：杂务 i 的最早完成时间
    answer = 0

    for _ in range(n):
        parts = list(map(int, input().split()))
        id_ = parts[0]
        len_ = parts[1]

        # 前置编号 <= id-1，其 f 值必已算好（天然拓扑序）
        max_pre = 0
        for pre in parts[2:]:
            if pre == 0:
                break
            max_pre = max(max_pre, finish[pre])

        finish[id_] = len_ + max_pre
        answer = max(answer, finish[id_])

    print(answer)

if __name__ == '__main__':
    main()`,
          keyLines: [7, 10, 17, 20, 22, 23],
        },
      ],
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
    id: 8,
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
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    vector<int> dp(n, 1);        // dp[i]：以 nums[i] 结尾的 LIS 长度
    int maxLen = 1;

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        maxLen = max(maxLen, dp[i]);
    }

    cout << maxLen << endl;
    return 0;
}`,
          keyLines: [16, 19, 20, 21, 22],
        },
        {
          language: "python",
          label: "Python",
          code: `import sys

def main():
    input = sys.stdin.readline
    n = int(input())
    nums = list(map(int, input().split()))

    dp = [1] * n                    # dp[i]：以 nums[i] 结尾的 LIS 长度
    max_len = 1

    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        max_len = max(max_len, dp[i])

    print(max_len)

if __name__ == '__main__':
    main()`,
          keyLines: [8, 11, 12, 13, 14],
        },
      ],
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
    id: 9,
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
      codeVersions: [
        {
          language: "cpp",
          label: "C++",
          code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<int> pos(n + 1);
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        pos[x] = i + 1;          // p1 中每个数的位置
    }

    vector<int> tails;           // tails[i] = 长度为 i+1 的 LIS 最小结尾值
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        int idx = pos[x];        // 转成在 p1 中的位置
        auto it = lower_bound(tails.begin(), tails.end(), idx);
        if (it == tails.end()) {
            tails.push_back(idx);
        } else {
            *it = idx;
        }
    }

    cout << tails.size() << endl;
    return 0;
}`,
          keyLines: [13, 17, 20, 24, 25, 27],
        },
        {
          language: "python",
          label: "Python",
          code: `import sys
from bisect import bisect_left

def main():
    input = sys.stdin.readline
    n = int(input())

    p1 = list(map(int, input().split()))
    p2 = list(map(int, input().split()))

    pos = [0] * (n + 1)
    for i, x in enumerate(p1, start=1):
        pos[x] = i                  # p1 中每个数的位置

    tails = []                      # tails[i] = 长度为 i+1 的 LIS 最小结尾值
    for x in p2:
        idx = pos[x]                # 转成在 p1 中的位置
        it = bisect_left(tails, idx)
        if it == len(tails):
            tails.append(idx)
        else:
            tails[it] = idx

    print(len(tails))

if __name__ == '__main__':
    main()`,
          keyLines: [11, 13, 15, 17, 18, 20],
        },
      ],
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
