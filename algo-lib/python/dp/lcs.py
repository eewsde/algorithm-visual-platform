"""
最长公共子序列（洛谷 P1439）—— 排列转 LIS

题目：给出 1..n 的两个排列 P1、P2，求它们的最长公共子序列的长度（n ≤ 10^5）。
算法：两个序列都是排列 → 记录 P1 中每个数的位置 pos[x]；
      把 P2 的每个数换成它在 P1 中的位置，则 LCS 转化为最长上升子序列（LIS），
      用贪心 + 二分 O(n log n) 求解。

输入：第一行 n；接下来两行，每行 n 个数（1..n 的排列）。
输出：一个整数，LCS 长度。

官方样例：
  5
  3 2 1 4 5
  1 2 3 4 5
  → 3

时间复杂度：O(n log n)    空间复杂度：O(n)
"""

import sys
from bisect import bisect_left

def main():
    input = sys.stdin.readline
    n = int(input())

    p1 = list(map(int, input().split()))
    p2 = list(map(int, input().split()))

    # 记录 P1 中每个数的位置（1 基）
    pos = [0] * (n + 1)
    for i, x in enumerate(p1, start=1):
        pos[x] = i

    # 把 P2 的每个数换成 pos[x]，求其 LIS 长度（贪心 + 二分）
    tails = []  # tails[i] = 长度为 i+1 的 LIS 的最小结尾值
    for x in p2:
        idx = pos[x]  # 转成在 P1 中的位置
        it = bisect_left(tails, idx)
        if it == len(tails):
            tails.append(idx)
        else:
            tails[it] = idx

    print(len(tails))

if __name__ == '__main__':
    main()
