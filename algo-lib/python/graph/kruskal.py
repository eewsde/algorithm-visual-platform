"""
Kruskal 最小生成树

给定无向图，求最小生成树总权值；若不连通则输出 -1。

基于边的贪心：按边权排序，用并查集判断连通性，选 n-1 条最小边。

时间复杂度：O(E log E)
空间复杂度：O(V+E)
"""

import sys

def main():
    input = sys.stdin.readline
    n, m = map(int, input().split())

    edges = []
    for _ in range(m):
        u, v, w = map(int, input().split())
        edges.append((w, u, v))

    edges.sort()

    parent = list(range(n + 1))
    rank = [0] * (n + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False
        if rank[px] < rank[py]:
            parent[px] = py
        elif rank[px] > rank[py]:
            parent[py] = px
        else:
            parent[py] = px
            rank[px] += 1
        return True

    total, cnt = 0, 0
    for w, u, v in edges:
        if union(u, v):
            total += w
            cnt += 1
            if cnt == n - 1:
                break

    print(total if cnt == n - 1 else -1)

if __name__ == '__main__':
    main()
