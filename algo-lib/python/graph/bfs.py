"""
BFS 图的广度优先遍历

给定无向图，从节点1开始进行BFS遍历，输出访问顺序。

使用队列（FIFO），起点入队→出队访问→邻居入队→重复。
BFS 按层次逐层访问，先访问距离起点近的节点。

时间复杂度：O(V+E)
空间复杂度：O(V)
"""

import sys
from collections import deque

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
