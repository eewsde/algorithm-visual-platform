/**
 * 01背包问题
 *
 * 题目：给定 M 个物品，每个物品有重量 w[i] 和价值 v[i]。背包容量为 T。
 *       问在不超过容量的前提下，能获得的最大总价值。
 * 算法：一维 DP，逆序遍历容量。dp[j] = max(dp[j], dp[j-w[i]] + v[i])。
 *       逆序确保每个物品最多使用一次（01背包 vs 完全背包的关键区别）。
 *
 * 时间复杂度：O(M × T)
 * 空间复杂度：O(T)
 */

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T, M;
    cin >> T >> M;

    vector<int> dp(T + 1, 0);

    for (int i = 0; i < M; i++) {
        int weight, value;
        cin >> weight >> value;

        // 逆序遍历：保证每个物品只选一次
        for (int j = T; j >= weight; j--) {
            dp[j] = max(dp[j], dp[j - weight] + value);
        }
    }

    cout << dp[T] << endl;
    return 0;
}
