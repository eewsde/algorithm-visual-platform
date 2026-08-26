"""
杂务（洛谷 P1113）—— 拓扑序 DP / 关键路径

题目：John 有 n 项杂务，每项杂务需要一定时间 len；部分杂务必须在另一些杂务
      （前置杂务）完成之后才能进行。杂务 k (k>1) 的前置只在 1..k-1 中。
      互相没有关系的杂务可以同时进行（工人足够多），求完成全部杂务的最短时间。
算法：按编号顺序天然是拓扑序，直接 DP：
      f[k] = len[k] + max(f[前置])，答案 = max(f[i])（DAG 关键路径）。

输入：第一行 n；接下来 n 行：序号 耗时 前置1 前置2 ... 0（0 结束前置列表）。
输出：一个整数，完成所有杂务所需的最短时间。

官方样例：
  7
  1 5 0
  2 2 1 0
  3 3 2 0
  4 6 1 0
  5 1 2 4 0
  6 8 2 4 0
  7 4 3 5 6 0
  → 23

时间复杂度：O(n + 前置总数)    空间复杂度：O(n)
"""

import sys

def main():
    input = sys.stdin.readline
    n = int(input())

    finish = [0] * (n + 1)  # f[i]：杂务 i 的最早完成时间
    answer = 0

    for _ in range(n):
        parts = list(map(int, input().split()))
        id_ = parts[0]
        len_ = parts[1]

        # 前置杂务编号 <= id-1，其 f 值必已算好
        maxPre = 0
        for pre in parts[2:]:
            if pre == 0:
                break
            maxPre = max(maxPre, finish[pre])

        finish[id_] = len_ + maxPre
        answer = max(answer, finish[id_])

    print(answer)

if __name__ == '__main__':
    main()
