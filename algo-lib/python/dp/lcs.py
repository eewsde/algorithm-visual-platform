"""
最长公共子序列 (LCS)

给定两个字符串 text1 和 text2，求它们的最长公共子序列的长度。

二维 DP。dp[i][j] = text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度。
    text1[i-1] == text2[j-1] → dp[i][j] = dp[i-1][j-1] + 1
    text1[i-1] != text2[j-1] → dp[i][j] = max(dp[i-1][j], dp[i][j-1])

时间复杂度：O(m × n)
空间复杂度：O(m × n)，可优化到 O(min(m, n))
"""

import sys

def main():
    input = sys.stdin.readline
    text1 = input().strip()
    text2 = input().strip()

    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # 回溯 LCS 序列
    lcs = []
    i, j = m, n
    while i > 0 and j > 0:
        if text1[i - 1] == text2[j - 1]:
            lcs.append(text1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1

    print(dp[m][n])
    print(''.join(reversed(lcs)))

if __name__ == '__main__':
    main()
