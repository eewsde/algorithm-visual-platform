"""
Floyd-Warshall 全源最短路径 / 传递闭包

给定 n 个点的有向图（邻接矩阵），求任意两点间的最短路径或可达性。

dp[k][i][j] = 只经过前 k 个节点时从 i 到 j 的最短距离
压缩为二维：dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

时间复杂度：O(n³)
空间复杂度：O(n²)
"""

import sys

INF = 10**9

def main():
    input = sys.stdin.readline
    n = int(input())

    dist = []
    for i in range(n):
        row = list(map(int, input().split()))
        for j in range(n):
            if row[j] == 0 and i != j:  # 将0替换为INF（无边）
                row[j] = INF
        dist.append(row)

    # Floyd 核心
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                if dist[k][j] != INF:
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

    for row in dist:
        print(' '.join(str(v) if v != INF else '-1' for v in row))

if __name__ == '__main__':
    main()
