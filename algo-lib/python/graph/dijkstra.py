"""
Dijkstra 单源最短路径（堆优化版）

给定 n 个点、m 条有向边的带非负权图，求从起点 s 到每个点的最短距离。

时间复杂度：O((V+E) log V)
空间复杂度：O(V+E)
"""

import sys
import heapq

INF = float('inf')

def main():
    input = sys.stdin.readline
    n, m, s = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v, w = map(int, input().split())
        adj[u].append((v, w))

    dist = [INF] * (n + 1)
    dist[s] = 0

    pq = [(0, s)]  # (距离, 节点)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue

        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(pq, (nd, v))

    result = [str(dist[i]) if dist[i] != INF else '-1' for i in range(1, n + 1)]
    print(' '.join(result))

if __name__ == '__main__':
    main()
