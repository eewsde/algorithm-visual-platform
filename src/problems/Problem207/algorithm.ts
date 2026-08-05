import { VisualizationStep } from "@/types";

export interface LISInput {
  nums: number[];
}

export function parseLISInput(input: string): LISInput {
  const nums = input
    .trim()
    .split(/[\s,]+/)
    .filter((s) => s.length > 0)
    .map(Number);
  return { nums };
}

export function generateLISSteps(input: LISInput): VisualizationStep[] {
  const { nums } = input;
  const n = nums.length;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const dp = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);
  let maxLen = 1;
  let maxIdx = 0;

  steps.push({
    id: stepId++,
    description: `初始化：dp[i] = 1（每个元素自身构成长度为1的子序列）。`,
    data: {
      nums: nums.map((v, i) => ({ value: v, index: i })),
      dp: [...dp],
      prev: [...prev],
      highlightI: -1,
      highlightJ: -1,
      maxLen: 1,
      maxIdx: 0,
    },
    variables: { maxLen: 1 },
  });

  for (let i = 1; i < n; i++) {
    steps.push({
      id: stepId++,
      description: `处理第 ${i} 个元素 nums[${i}] = ${nums[i]}，检查之前所有元素 j < ${i}。`,
      data: {
        nums: nums.map((v, idx) => ({ value: v, index: idx })),
        dp: [...dp],
        prev: [...prev],
        highlightI: i,
        highlightJ: -1,
        maxLen,
        maxIdx,
      },
      variables: { currentI: i, currentVal: nums[i], maxLen, dp_i: dp[i] },
    });

    for (let j = 0; j < i; j++) {
      const canExtend = nums[j] < nums[i];

      steps.push({
        id: stepId++,
        description: canExtend
          ? `比较 nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}？是！可拼接：dp[${i}] = max(${dp[i]}, ${dp[j] + 1})`
          : `比较 nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}？否，跳过。`,
        data: {
          nums: nums.map((v, idx) => ({ value: v, index: idx })),
          dp: [...dp],
          prev: [...prev],
          highlightI: i,
          highlightJ: j,
          maxLen,
          maxIdx,
          comparing: true,
          canExtend,
        },
        variables: {
          currentI: i,
          currentJ: j,
          valI: nums[i],
          valJ: nums[j],
          dp_i: dp[i],
          dp_j: dp[j],
          canExtend,
          maxLen,
        },
      });

      if (canExtend && dp[j] + 1 > dp[i]) {
        const oldDp = dp[i];
        dp[i] = dp[j] + 1;
        prev[i] = j;

        steps.push({
          id: stepId++,
          description: `更新！dp[${i}] 从 ${oldDp} 变为 ${dp[i]}（通过拼接 nums[${j}]=${nums[j]} 后的子序列）。prev[${i}] = ${j}`,
          data: {
            nums: nums.map((v, idx) => ({ value: v, index: idx })),
            dp: [...dp],
            prev: [...prev],
            highlightI: i,
            highlightJ: j,
            maxLen,
            maxIdx,
            updated: true,
          },
          variables: {
            currentI: i,
            currentJ: j,
            oldDp,
            newDp: dp[i],
            maxLen,
          },
        });
      }
    }

    if (dp[i] > maxLen) {
      maxLen = dp[i];
      maxIdx = i;
      steps.push({
        id: stepId++,
        description: `新的全局最优！dp[${i}] = ${dp[i]}，最长递增子序列长度更新为 ${maxLen}。`,
        data: {
          nums: nums.map((v, idx) => ({ value: v, index: idx })),
          dp: [...dp],
          prev: [...prev],
          highlightI: i,
          highlightJ: -1,
          maxLen,
          maxIdx: i,
          newMax: true,
        },
        variables: { maxLen, maxIdx: i, currentI: i },
      });
    }
  }

  // Reconstruct the LIS sequence and its indices
  const lis: number[] = [];
  const lisIndices = new Set<number>();
  let cur = maxIdx;
  while (cur >= 0) {
    lis.unshift(nums[cur]);
    lisIndices.add(cur);
    cur = prev[cur];
  }

  steps.push({
    id: stepId++,
    description: `LIS 完成！长度=${maxLen}，序列：[${lis.join(", ")}]`,
    data: {
      nums: nums.map((v, idx) => ({
        value: v,
        index: idx,
        inLIS: lisIndices.has(idx),
      })),
      dp: [...dp],
      prev: [...prev],
      highlightI: -1,
      highlightJ: -1,
      maxLen,
      maxIdx,
      lis,
      finished: true,
    },
    variables: { maxLen, lis: lis.join(", "), sequence: lis.join(", ") },
  });

  return steps;
}
