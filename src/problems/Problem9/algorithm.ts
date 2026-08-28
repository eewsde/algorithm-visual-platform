import { VisualizationStep } from "@/types";

export interface LCSInput {
  n: number;
  p1: number[];
  p2: number[];
}

/**
 * 解析 P1439 输入：第一行 n，接下来两行各 n 个数（1..n 的排列）
 */
export function parseLCSInput(input: string): LCSInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 3) {
    throw new Error("输入格式：第一行 n，接下来两行各 n 个数");
  }
  const n = parseInt(lines[0].trim());
  if (!Number.isFinite(n) || n < 1) {
    throw new Error("n 格式错误");
  }
  if (n > 60) {
    throw new Error("n 最多 60，否则 DP 表步骤量过大会卡顿");
  }

  const parseRow = (line: string, label: string): number[] => {
    const nums = line.trim().split(/\s+/).map(Number);
    if (nums.length !== n || nums.some((v) => !Number.isFinite(v) || v < 1 || v > n)) {
      throw new Error(`${label}必须是 1..${n} 的排列`);
    }
    return nums;
  };

  const p1 = parseRow(lines[1], "第一行");
  const p2 = parseRow(lines[2], "第二行");
  return { n, p1, p2 };
}

/**
 * 生成 LCS（两个排列）DP 可视化步骤：
 * dp[i][j] = p1 前 i 个数与 p2 前 j 个数的 LCS 长度。
 * 相等 → 左上+1；不等 → max(上, 左)。最后回溯出 LCS 序列。
 */
export function generateLCSSteps(input: LCSInput): VisualizationStep[] {
  const { n, p1, p2 } = input;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));

  steps.push({
    id: stepId++,
    description: `初始化 dp 表：${n + 1}×${n + 1}，dp[0][*] = dp[*][0] = 0。`,
    data: {
      seq1: [...p1],
      seq2: [...p2],
      dp: dp.map((row) => [...row]),
      highlightI: -1,
      highlightJ: -1,
    },
    variables: { n },
  });

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      const match = p1[i - 1] === p2[j - 1];

      steps.push({
        id: stepId++,
        description: match
          ? `p1[${i - 1}]=${p1[i - 1]} == p2[${j - 1}]=${p2[j - 1]} 匹配！dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i - 1][j - 1] + 1}`
          : `p1[${i - 1}]=${p1[i - 1]} ≠ p2[${j - 1}]=${p2[j - 1]} 不匹配。dp[${i}][${j}] = max(dp[${i - 1}][${j}]=${dp[i - 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]})`,
        data: {
          seq1: [...p1],
          seq2: [...p2],
          dp: dp.map((row) => [...row]),
          highlightI: i,
          highlightJ: j,
          match,
          fromTop: dp[i - 1][j],
          fromLeft: dp[i][j - 1],
          fromDiag: dp[i - 1][j - 1],
        },
        variables: {
          i,
          j,
          val1: p1[i - 1],
          val2: p2[j - 1],
          match,
          newVal: match ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]),
        },
      });

      if (match) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }

      steps.push({
        id: stepId++,
        description: `dp[${i}][${j}] = ${dp[i][j]}。`,
        data: {
          seq1: [...p1],
          seq2: [...p2],
          dp: dp.map((row) => [...row]),
          highlightI: i,
          highlightJ: j,
          match,
          updated: true,
        },
        variables: {
          i,
          j,
          dpVal: dp[i][j],
        },
      });
    }
  }

  // 回溯 LCS 序列
  const lcsNums: number[] = [];
  const backtrackPath: [number, number][] = [];
  let ci = n;
  let cj = n;
  while (ci > 0 && cj > 0) {
    backtrackPath.push([ci, cj]);
    if (p1[ci - 1] === p2[cj - 1]) {
      lcsNums.unshift(p1[ci - 1]);
      ci--;
      cj--;
    } else if (dp[ci - 1][cj] > dp[ci][cj - 1]) {
      ci--;
    } else {
      cj--;
    }
  }
  backtrackPath.push([ci, cj]);

  steps.push({
    id: stepId++,
    description: `LCS 完成！长度=${dp[n][n]}，序列：[${lcsNums.join(", ")}]。回溯路径：从右下角沿匹配元素斜上、向大值方向移动。`,
    data: {
      seq1: [...p1],
      seq2: [...p2],
      dp: dp.map((row) => [...row]),
      highlightI: -1,
      highlightJ: -1,
      lcs: lcsNums,
      backtrackPath,
      finished: true,
    },
    variables: {
      lcsLength: dp[n][n],
      lcs: lcsNums.join(", "),
      finished: true,
    },
  });

  return steps;
}
