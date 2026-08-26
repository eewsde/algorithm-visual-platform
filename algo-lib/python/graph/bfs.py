"""
BFS 有向图的广度优先遍历（洛谷 P5318 查找文献）

题目：n 篇文章（编号 1..n）与 m 条引用关系，X→Y 表示文章 X 有参考文献 Y。
      从编号 1 的文章开始，不重复、不遗漏地遍历所有可达文章，输出 BFS 访问顺序。
      有多篇可看时先看编号较小的那篇（邻居排序保证）。
算法：队列（FIFO）：起点入队 → 出队访问 → 未访问的出边邻居入队 → 重复。
      BFS 按层次逐层访问，先访问离起点近的节点。

输入：第一行 n m；接下来 m 行：u v（u→v 有向引用边）。
输出：一行，BFS 访问顺序。

官方样例：
  8 9 / 1 2 / 1 3 / 1 4 / 2 5 / 2 6 / 3 7 / 4 7 / 4 8 / 7 8
  → 1 2 3 4 5 6 7 8

时间复杂度：O(V+E)    空间复杂度：O(V)
"""

import sys
from collections import deque

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    # 有向图：只存出边 u→v
    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v = map(int, input().split())
        adj[u].append(v)

    for neighbors in adj:
        neighbors.sort()

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
    main()
