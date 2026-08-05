"""
DFS 图的深度优先遍历

给定无向图，从节点1开始进行DFS遍历，输出访问顺序。

使用递归/栈（LIFO），访问节点→递归访问未访问邻居→回溯。
DFS 沿一条路径深入到底，适合搜索所有路径和连通性检测。

时间复杂度：O(V+E)
空间复杂度：O(V)（递归栈深度）
"""

import sys
sys.setrecursionlimit(100000)

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v = map(int, input().split())
        adj[u].append(v)
        adj[v].append(u)

    for neighbors in adj:
        neighbors.sort()

    visited = [False] * (n + 1)
    order = []

    def dfs(u):
        visited[u] = True
        order.append(u)
        for v in adj[u]:
            if not visited[v]:
                dfs(v)

    dfs(1)
    print(' '.join(map(str, order)))

if __name__ == '__main__':
    main()
