/**
 * 最长递增子序列 (LIS)
 *
 * 题目：给定整数数组 nums，求最长严格递增子序列的长度。
 * 算法1（DP O(n²)）：dp[i] = 以 nums[i] 结尾的 LIS 长度。
 *        对每个 i，检查所有 j < i：若 nums[j] < nums[i]，dp[i] = max(dp[i], dp[j]+1)。
 * 算法2（贪心+二分 O(n log n)）：维护 tails 数组，二分查找插入位置。
 *
 * 时间复杂度：O(n²)（DP）/ O(n log n)（二分优化）
 * 空间复杂度：O(n)
 */

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// DP 解法 O(n²)
int lis_dp(const vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);
    int ans = 1;

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        ans = max(ans, dp[i]);
    }
    return ans;
}

// 贪心+二分 O(n log n)（推荐）
int lis_binary(const vector<int>& nums) {
    vector<int> tails; // tails[i] = 长度为 i+1 的 LIS 的最小结尾值

    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }
    return tails.size();
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    cout << lis_binary(nums) << endl;
    return 0;
}
