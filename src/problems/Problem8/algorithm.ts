import { VisualizationStep } from "@/types";

export interface LISInput {
  nums: number[];
}

export function parseLISInput(input: string): LISInput {
  const tokens = input
    .trim()
    .split(/[\s,]+/)
    .filter((s) => s.length > 0)
    .map(Number)
    // 过滤掉 NaN/Infinity 等非有限数（如 "abc" 会被 Number 转为 NaN）
    .filter(Number.isFinite);

  // 兼容洛谷输入格式："首行 n + 第二行 n 个数"。
  // 当第一个数是剩余元素个数时，认为它是 n 而不是数组元素。
  const [first, ...rest] = tokens;
  const nums = first === rest.length ? rest : tokens;

  if (nums.length > 300) {
    throw new Error("元素个数最多 300，否则步骤过多会卡顿");
  }
  return { nums };
}

export function generateLISSteps(input: LISInput): VisualizationStep[] {
  const { nums } = input;
  const n = nums.length;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const dp = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);
  // n=0（空数组）时最长长度为 0，maxIdx 为 -1，避免误报长度为 1
  let maxLen = 0;
  let maxIdx = -1;

  steps.push({
    id: stepId++,
    description:
      n === 0
        ? "初始化：数组为空，最长递增子序列长度为 0。"
        : "初始化：dp[i] = 1（每个元素自身构成长度为1的子序列）。",
    data: {
      nums: nums.map((v, i) => ({ value: v, index: i })),
      dp: [...dp],
      prev: [...prev],
      highlightI: -1,
      highlightJ: -1,
      maxLen,
      maxIdx,
    },
    variables: { maxLen },
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
      // 可拼接但 dp[j]+1 不优于当前 dp[i] 时不会更新，需要与真正更新区分开
      const willUpdate = canExtend && dp[j] + 1 > dp[i];

      steps.push({
        id: stepId++,
        description: canExtend
          ? willUpdate
            ? `比较 nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}？是！可拼接：dp[${i}] = max(${dp[i]}, ${dp[j] + 1})`
            : `比较 nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}？是，可拼接但不优于现有值：dp[${j}]+1=${dp[j] + 1} ≤ dp[${i}]=${dp[i]}，不更新。`
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

  // n ≥ 1 时最长长度至少为 1（n=1 时上方循环不执行，需在此兜底；n=0 时保持 0）
  if (n > 0 && maxLen === 0) {
    maxLen = 1;
    maxIdx = 0;
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
    description:
      n === 0
        ? `LIS 完成！数组为空，最长递增子序列长度为 0。`
        : `LIS 完成！长度=${maxLen}，序列：[${lis.join(", ")}]`,
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
