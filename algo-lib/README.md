# 算法代码库

程序设计竞赛中动态规划与图论算法的 C++/Python 标准实现。

## 目录结构

```
algo-lib/
├── cpp/                    # C++ 实现
│   ├── graph/              # 图论算法（7个）
│   │   ├── dijkstra.cpp    # Dijkstra 单源最短路径
│   │   ├── floyd.cpp       # Floyd 全源最短路径
│   │   ├── kruskal.cpp     # Kruskal 最小生成树
│   │   ├── prim.cpp        # Prim 最小生成树
│   │   ├── bfs.cpp         # BFS 广度优先遍历
│   │   ├── dfs.cpp         # DFS 深度优先遍历
│   │   └── topological_sort.cpp  # 拓扑排序（Kahn算法）
│   └── dp/                 # 动态规划（3个）
│       ├── knapsack01.cpp  # 01背包
│       ├── lis.cpp         # 最长递增子序列
│       └── lcs.cpp         # 最长公共子序列
├── python/                 # Python 实现（同上）
│   ├── graph/
│   └── dp/
└── README.md
```

## 算法一览

| 算法 | 分类 | 时间复杂度 | 空间复杂度 |
|------|------|-----------|-----------|
| Dijkstra（堆优化） | 图论·最短路 | O((V+E)logV) | O(V+E) |
| Floyd-Warshall | 图论·全源最短路 | O(n³) | O(n²) |
| Kruskal（并查集） | 图论·MST | O(ElogE) | O(V+E) |
| Prim（贪心） | 图论·MST | O(V²+E) | O(V+E) |
| BFS（队列） | 图论·遍历 | O(V+E) | O(V) |
| DFS（递归） | 图论·遍历 | O(V+E) | O(V) |
| Kahn拓扑排序 | 图论·连通性 | O(V+E) | O(V+E) |
| 01背包 | 动态规划 | O(M×T) | O(T) |
| LIS（贪心+二分） | 动态规划 | O(nlogn) | O(n) |
| LCS（二维DP） | 动态规划 | O(m×n) | O(m×n) |

## 使用方式

### C++

```bash
# 编译
g++ -std=c++17 -O2 dijkstra.cpp -o dijkstra
# 运行
./dijkstra < input.txt
```

### Python

```bash
python3 dijkstra.py < input.txt
```

## 代码规范

- 每个文件独立可运行，包含完整的 main 函数和标准输入输出
- 核心算法部分以函数形式封装，方便迁移到竞赛代码中
- 注释标注算法思想、关键步骤和复杂度
- 输入格式与洛谷/LeetCode 题目一致
