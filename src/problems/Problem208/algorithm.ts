import { VisualizationStep } from "@/types";

export interface LCSInput {
  text1: string;
  text2: string;
}

export function parseLCSInput(input: string): LCSInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length >= 2) {
    return { text1: lines[0].trim(), text2: lines[1].trim() };
  }
  const parts = input.trim().split(/[\s,]+/);
  if (parts.length >= 2) {
    return { text1: parts[0], text2: parts[1] };
  }
  return { text1: input.trim(), text2: "" };
}

export function generateLCSSteps(input: LCSInput): VisualizationStep[] {
  const { text1, text2 } = input;
  const m = text1.length;
  const n = text2.length;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  steps.push({
    id: stepId++,
    description: `初始化 dp 表：${m + 1}×${n + 1}，dp[0][*] = dp[*][0] = 0。`,
    data: {
      text1: text1.split(""),
      text2: text2.split(""),
      dp: dp.map((row) => [...row]),
      highlightI: -1,
      highlightJ: -1,
    },
    variables: { m, n },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = text1[i - 1] === text2[j - 1];

      steps.push({
        id: stepId++,
        description: match
          ? `text1[${i - 1}]='${text1[i - 1]}' == text2[${j - 1}]='${text2[j - 1]}' 匹配！dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i - 1][j - 1] + 1}`
          : `text1[${i - 1}]='${text1[i - 1]}' ≠ text2[${j - 1}]='${text2[j - 1]}' 不匹配。dp[${i}][${j}] = max(dp[${i - 1}][${j}]=${dp[i - 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]})`,
        data: {
          text1: text1.split(""),
          text2: text2.split(""),
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
          char1: text1[i - 1],
          char2: text2[j - 1],
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
          text1: text1.split(""),
          text2: text2.split(""),
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

  // Backtrack to find LCS
  const lcsChars: string[] = [];
  const backtrackPath: [number, number][] = [];
  let ci = m;
  let cj = n;
  while (ci > 0 && cj > 0) {
    backtrackPath.push([ci, cj]);
    if (text1[ci - 1] === text2[cj - 1]) {
      lcsChars.unshift(text1[ci - 1]);
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
    description: `LCS 完成！长度=${dp[m][n]}，序列："${lcsChars.join("")}"。回溯路径：从右下角沿匹配字符斜上、向大值方向移动。`,
    data: {
      text1: text1.split(""),
      text2: text2.split(""),
      dp: dp.map((row) => [...row]),
      highlightI: -1,
      highlightJ: -1,
      lcs: lcsChars.join(""),
      backtrackPath,
      finished: true,
    },
    variables: {
      lcsLength: dp[m][n],
      lcs: lcsChars.join(""),
    },
  });

  return steps;
}
