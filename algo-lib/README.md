# 算法代码库

程序设计竞赛中**动态规划与图论算法**的 C++/Python 标准实现（洛谷模板题，与算法可视化平台配套）。

每个文件**独立可运行**：包含完整 `main` 函数、标准输入输出、算法思想与复杂度注释，输入格式与洛谷官方题面一致。

## 目录结构

```
algo-lib/
├── cpp/                    # C++ 实现（C++17，g++ -std=c++17）
│   ├── graph/              # 图论算法
│   │   ├── dijkstra.cpp    # Dijkstra 单源最短路径（P4779）
│   │   ├── floyd.cpp       # Floyd 传递闭包（B3611）
│   │   ├── kruskal.cpp     # Kruskal 最小生成树（P3366）
│   │   ├── prim.cpp        # Prim 最小生成树（P3366）
│   │   ├── bfs.cpp         # 有向图 BFS 遍历（P5318）
│   │   ├── dfs.cpp         # 有向图 DFS 遍历（P5318）
│   │   └── chores.cpp      # 杂务·拓扑序 DP / 关键路径（P1113）
│   └── dp/                 # 动态规划
│       ├── knapsack01.cpp  # 01背包（P1048）
│       ├── lis.cpp         # 最长上升子序列·贪心+二分（B3637）
│       └── lcs.cpp         # 最长公共子序列·排列转LIS（P1439）
└── python/                 # Python 实现（同上，同名 .py）
```

## 算法一览

| 算法 | 对应洛谷题目 | 分类 | 时间复杂度 | 空间复杂度 |
|------|-------------|------|-----------|-----------|
| Dijkstra（堆优化） | P4779 单源最短路径 | 图论·最短路 | O((V+E)logV) | O(V+E) |
| Floyd 传递闭包 | B3611 传递闭包 | 图论·DP | O(n³) | O(n²) |
| Kruskal（并查集） | P3366 最小生成树 | 图论·MST | O(ElogE) | O(V+E) |
| Prim（贪心） | P3366 最小生成树 | 图论·MST | O(V²+E) | O(V+E) |
| BFS（队列） | P5318 查找文献 | 图论·有向遍历 | O(V+E) | O(V) |
| DFS（显式栈） | P5318 查找文献 | 图论·有向遍历 | O(V+E) | O(V) |
| 杂务（拓扑序 DP） | P1113 杂务 | 图论·关键路径 | O(n+m) | O(n) |
| 01背包 | P1048 采药 | 动态规划 | O(M×T) | O(T) |
| LIS（贪心+二分） | B3637 最长上升子序列 | 动态规划 | O(nlogn) | O(n) |
| LCS（排列转LIS） | P1439 最长公共子序列 | 动态规划 | O(nlogn) | O(n) |

## 输入格式与官方样例验证

每个源文件头部注释中都有"官方样例"：把样例输入存成 `input.txt`，运行后比对输出。

| 算法 | 输入格式 | 官方样例输出 |
|------|---------|-------------|
| dijkstra | `n m s` + m 行 `u v w` | `0 2 4 3` |
| floyd | 第一行 `n` + n×n 个 0/1 | 4 行 `1 1 0 1` |
| kruskal / prim | `n m` + m 行 `u v w` | `7` |
| bfs / dfs | `n m` + m 行 `u v` | BFS: `1 2 3 4 5 6 7 8`；DFS: `1 2 5 6 3 7 8 4` |
| chores | 第一行 `n` + n 行 `序号 耗时 前置... 0` | `23` |
| knapsack01 | `T M` + M 行 `t v` | `3` |
| lis | `n` + n 个数 | 官方样例长度 |
| lcs | 第一行 `n` + 两行排列 | `3` |

## 使用方式

### C++（需要 g++，Windows 可用 MinGW / WSL）

```bash
g++ -std=c++17 -O2 dijkstra.cpp -o dijkstra
./dijkstra < input.txt        # Linux / WSL / macOS
dijkstra.exe < input.txt      # Windows 命令行
```

### Python

```bash
python dijkstra.py < input.txt
```

## 代码规范

- 每个文件独立可运行，包含完整的 `main` 函数和标准输入输出
- 核心算法以清晰的结构书写，注释标注算法思想、关键步骤和复杂度
- 文件头注明对应洛谷题号与官方样例，方便自测
- 输入输出格式与洛谷题目完全一致，可直接提交（注意 n 较大题目的常数优化）

## 推送到 GitHub（公共仓库）

在 `algo-lib` 目录下执行：

```bash
# 1. 初始化仓库
git init
git add .
git commit -m "算法代码库：DP 与图论算法 C++/Python 实现（洛谷模板题）"

# 2. 在 GitHub 网页创建同名空仓库（不要勾选 README），然后：
git remote add origin https://github.com/<你的用户名>/algo-lib.git
git branch -M main
git push -u origin main
```

推送后把仓库链接放进结题报告即可（勾选 Public 即可公开访问）。
