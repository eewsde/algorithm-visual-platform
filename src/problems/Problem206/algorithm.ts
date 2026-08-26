import { VisualizationStep } from "@/types";

export interface TaskDef {
  id: number;
  len: number;
  prereqs: number[];
}

export interface TaskInput {
  tasks: TaskDef[];
}

/**
 * 解析杂务输入（P1113 格式）：
 * 第一行 n；接下来 n 行：序号 耗时 前置1 前置2 ... 0（0 结束前置列表）
 */
export function parseTopoInput(input: string): TaskInput {
  const lines = input.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) {
    throw new Error("请输入杂务数据");
  }
  const n = parseInt(lines[0].trim());
  if (!Number.isFinite(n) || n < 1) {
    throw new Error("杂务数格式错误");
  }
  if (n > 200) {
    throw new Error("杂务数最多 200，否则步骤过多会卡顿");
  }
  if (lines.length < n + 1) {
    throw new Error("杂务行数不足");
  }

  const tasks: TaskDef[] = [];
  for (let i = 1; i <= n; i++) {
    const parts = lines[i].trim().split(/\s+/).map(Number);
    if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
      throw new Error(`第 ${i} 行杂务数据格式错误`);
    }
    const id = parts[0];
    const len = parts[1];
    if (id !== i) {
      throw new Error("杂务序号必须按 1..n 有序递增");
    }
    const prereqs: number[] = [];
    for (let j = 2; j < parts.length; j++) {
      const p = parts[j];
      if (p === 0) break;
      if (!Number.isFinite(p) || p < 1 || p >= id) {
        throw new Error(`杂务 ${id} 的前置编号必须在 1..${id - 1} 内`);
      }
      prereqs.push(p);
    }
    tasks.push({ id, len, prereqs });
  }
  return { tasks };
}

/**
 * 生成杂务（拓扑序 DP / 关键路径）的可视化步骤：
 * 杂务 k 的前置只在 1..k-1 中 → 按编号顺序天然是拓扑序。
 * f[k] = len[k] + max(f[前置])，答案 = max(f[i])。
 */
export function generateTopoSteps(input: TaskInput): VisualizationStep[] {
  const { tasks } = input;
  const n = tasks.length;
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // f[i]：杂务 i 的最早完成时间
  const finish: number[] = new Array(n + 1).fill(0);
  let answer = 0;

  // 依赖边：前置 → 杂务（有向）
  const edges: { from: number; to: number }[] = [];
  for (const t of tasks) {
    for (const p of t.prereqs) {
      edges.push({ from: p, to: t.id });
    }
  }

  const snapshot = (
    current: number,
    prereqIds: number[],
    currentEdges: { from: number; to: number }[]
  ) => ({
    nodes: tasks.map((t) => ({
      id: t.id,
      label: `${t.id}`,
      len: t.len,
      finish: finish[t.id],
      state: (
        t.id === current
          ? "current"
          : prereqIds.includes(t.id)
            ? "prereq"
            : finish[t.id] > 0
              ? "visited"
              : "unvisited"
      ) as "current" | "prereq" | "visited" | "unvisited",
    })),
    edges: edges.map((e) => ({
      ...e,
      isCurrent: currentEdges.some((ce) => ce.from === e.from && ce.to === e.to),
    })),
    answer,
  });

  steps.push({
    id: stepId++,
    description: `初始化：共 ${n} 个杂务。杂务 k 的前置只可能在 1..k-1 中，按编号顺序天然是拓扑序。f[k] = 耗时 + 前置最大完成时间。`,
    data: snapshot(-1, [], []),
    variables: { totalNodes: n, answer: 0 },
  });

  for (const t of tasks) {
    if (t.prereqs.length > 0) {
      steps.push({
        id: stepId++,
        description: `检查杂务 ${t.id} 的前置杂务：[${t.prereqs.join(", ")}]。`,
        data: snapshot(t.id, t.prereqs, []),
        variables: {
          totalNodes: n,
          currentTask: t.id,
          prereqList: t.prereqs.join(", "),
          taskLen: t.len,
          answer,
        },
      });
    }

    // 计算最早完成时间
    let maxPre = 0;
    for (const p of t.prereqs) {
      maxPre = Math.max(maxPre, finish[p]);
    }
    finish[t.id] = t.len + maxPre;
    const isNewMax = finish[t.id] > answer;
    answer = Math.max(answer, finish[t.id]);
    const incoming = t.prereqs.map((p) => ({ from: p, to: t.id }));

    steps.push({
      id: stepId++,
      description: `计算杂务 ${t.id}：最早完成时间 = 耗时 ${t.len} + 前置最早完成 ${maxPre} = ${finish[t.id]}${isNewMax ? "，成为当前全局最早完成时间" : ""}。`,
      data: snapshot(t.id, [], incoming),
      variables: {
        totalNodes: n,
        currentTask: t.id,
        taskLen: t.len,
        maxPre,
        finishTime: finish[t.id],
        answer,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `全部杂务完成！完成所有杂务所需的最短时间为 ${answer}。`,
    data: snapshot(-1, [], []),
    variables: { totalNodes: n, answer, finished: true },
  });

  return steps;
}
