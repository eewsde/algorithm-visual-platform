"""
拓扑排序（Kahn 算法 / BFS）

给定有向图，输出任意一个拓扑序列。若存在环则无法排序。

计算入度 → 入度为0的节点入队 → 出队处理 → 删除出边（邻居入度-1）
→ 新入度为0的入队 → 重复。若未处理完所有节点则存在环。

时间复杂度：O(V+E)
空间复杂度：O(V+E)
"""

import sys
from collections import deque

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    in_degree = [0] * (n + 1)

    for _ in range(m):
        u, v = map(int, input().split())
        adj[u].append(v)
        in_degree[v] += 1

    q = deque([i for i in range(1, n + 1) if in_degree[i] == 0])
    result = []

    while q:
        u = q.popleft()
        result.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                q.append(v)

    if len(result) < n:
        print("图中存在环，无法完成拓扑排序！")
    else:
        print(' '.join(map(str, result)))

if __name__ == '__main__':
    main()
