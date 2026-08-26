"""
最长递增子序列 (LIS)

给定整数数组 nums，求最长严格递增子序列的长度。

方法1（DP O(n²)）：dp[i] = 以 nums[i] 结尾的 LIS 长度。
    对每个 i，检查所有 j < i：若 nums[j] < nums[i]，dp[i] = max(dp[i], dp[j]+1)。
方法2（贪心+二分 O(n log n) 推荐）：维护 tails 数组，二分查找插入位置。

时间复杂度：O(n²)（DP）/ O(n log n)（二分优化）
空间复杂度：O(n)
"""

import sys
import bisect

def lis_dp(nums):
    """DP 解法 O(n²)"""
    n = len(nums)
    if n == 0:
        return 0
    dp = [1] * n
    ans = 1
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        ans = max(ans, dp[i])
    return ans

def lis_binary(nums):
    """贪心+二分 O(n log n)（推荐）"""
    tails = []  # tails[i] = 长度为 i+1 的 LIS 的最小结尾值
    for x in nums:
        idx = bisect.bisect_left(tails, x)
        if idx == len(tails):
            tails.append(x)
        else:
            tails[idx] = x
    return len(tails)

def main():
    input = sys.stdin.readline
    n = int(input())
    nums = list(map(int, input().split()))
    print(lis_binary(nums))

if __name__ == '__main__':
    main()
