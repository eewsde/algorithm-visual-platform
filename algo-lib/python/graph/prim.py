"""
Prim 最小生成树

给定无向图，求最小生成树总权值；若不连通则输出 -1。

基于节点的贪心：从任意起点出发，每次选连接"已选集合"与"未选集合"的最小权边。

时间复杂度：O(V²+E)（暴力）/ O((V+E)logV)（堆优化）
空间复杂度：O(V+E)
"""

import sys

INF = float('inf')

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v, w = map(int, input().split())
        adj[u].append((v, w))
        adj[v].append((u, w))

    in_mst = [False] * (n + 1)
    in_mst[1] = True
    total, cnt = 0, 0

    for _ in range(n - 1):
        best_w, best_v = INF, -1

        for u in range(1, n + 1):
            if not in_mst[u]:
                continue
            for v, w in adj[u]:
                if not in_mst[v] and w < best_w:
                    best_w = w
                    best_v = v

        if best_v == -1:
            break
        in_mst[best_v] = True
        total += best_w
        cnt += 1

    print(total if cnt == n - 1 else -1)

if __name__ == '__main__':
    main()
