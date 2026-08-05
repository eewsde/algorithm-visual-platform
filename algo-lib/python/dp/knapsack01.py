"""
01背包问题

给定 M 个物品，每个物品有重量 w[i] 和价值 v[i]。背包容量为 T。
问在不超过容量的前提下，能获得的最大总价值。

一维 DP，逆序遍历容量。dp[j] = max(dp[j], dp[j-w[i]] + v[i])。
逆序确保每个物品最多使用一次（01背包 vs 完全背包的关键区别）。

时间复杂度：O(M × T)
空间复杂度：O(T)
"""

import sys

def main():
    input = sys.stdin.readline
    T, M = map(int, input().split())

    dp = [0] * (T + 1)

    for _ in range(M):
        weight, value = map(int, input().split())
        # 逆序遍历：保证每个物品只选一次
        for j in range(T, weight - 1, -1):
            dp[j] = max(dp[j], dp[j - weight] + value)

    print(dp[T])

if __name__ == '__main__':
    main()
