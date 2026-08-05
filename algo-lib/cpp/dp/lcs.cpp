/**
 * 最长公共子序列 (LCS)
 *
 * 题目：给定两个字符串 text1 和 text2，求它们的最长公共子序列的长度。
 * 算法：二维 DP。dp[i][j] = text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度。
 *       text1[i-1] == text2[j-1] → dp[i][j] = dp[i-1][j-1] + 1
 *       text1[i-1] != text2[j-1] → dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 *
 * 时间复杂度：O(m × n)
 * 空间复杂度：O(m × n)，可优化到 O(min(m, n))
 */

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string text1, text2;
    cin >> text1 >> text2;

    int m = text1.size(), n = text2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // 回溯 LCS 序列
    string lcs;
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (text1[i - 1] == text2[j - 1]) {
            lcs = text1[i - 1] + lcs;
            i--; j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    cout << dp[m][n] << endl;
    cout << lcs << endl;
    return 0;
}
