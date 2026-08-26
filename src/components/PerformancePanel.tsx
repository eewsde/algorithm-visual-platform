import { useState, useRef, useEffect } from "react";
import { BarChart3, Play, Zap } from "lucide-react";
import type { MethodComparison } from "@/types";

interface BenchmarkConfig {
  /** Generate test data for a given size, returns input for each implementation */
  generateData: (size: number) => any;
  /** Implementations to benchmark */
  implementations: {
    name: string;
    fn: (data: any) => any;
    color: string;
  }[];
  /** Input sizes to test */
  sizes?: number[];
}

interface BenchmarkResult {
  name: string;
  color: string;
  times: { size: number; timeMs: number }[];
}

interface PerformancePanelProps {
  comparisons: MethodComparison[];
  benchmark?: BenchmarkConfig;
}

function runBenchmark(fn: (data: any) => any, data: any, iterations: number = 2): number {
  fn(data); // warmup
  let total = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(data);
    total += performance.now() - start;
  }
  return total / iterations;
}

export function PerformancePanel({ comparisons, benchmark }: PerformancePanelProps) {
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [currentSize, setCurrentSize] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  // 组件卸载后停止异步基准循环，避免继续 setState/浪费计算
  const cancelledRef = useRef(false);
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const sizes = benchmark?.sizes ?? [50, 100, 200, 400];

  const handleRun = async () => {
    if (!benchmark) return;
    cancelledRef.current = false;
    setRunning(true);
    setResults(null);

    const allResults: BenchmarkResult[] = benchmark.implementations.map((impl) => ({
      name: impl.name,
      color: impl.color,
      times: [],
    }));

    // Use setTimeout to allow UI to update
    await new Promise((r) => setTimeout(r, 50));
    if (cancelledRef.current) return;

    for (const size of sizes) {
      if (cancelledRef.current) break;
      setCurrentSize(size);
      const data = benchmark.generateData(size);

      for (let i = 0; i < benchmark.implementations.length; i++) {
        if (cancelledRef.current) break;
        const impl = benchmark.implementations[i];
        const timeMs = runBenchmark(impl.fn, data);
        allResults[i].times.push({ size, timeMs: Math.round(timeMs * 100) / 100 });
        // Update UI mid-benchmark
        if (!cancelledRef.current) setResults([...allResults]);
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    if (cancelledRef.current) return;
    setResults(allResults);
    setCurrentSize(null);
    setRunning(false);

    // Scroll to results
    setTimeout(() => {
      if (!cancelledRef.current) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  const maxTime = results
    ? Math.max(...results.flatMap((r) => r.times.map((t) => t.timeMs)), 1)
    : 1;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-purple-500" />
        性能对比分析
      </h3>

      {/* Comparison Table from static data */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border-b font-semibold text-gray-700">方法</th>
              <th className="text-left p-3 border-b font-semibold text-gray-700">描述</th>
              <th className="text-center p-3 border-b font-semibold text-gray-700">时间复杂度</th>
              <th className="text-center p-3 border-b font-semibold text-gray-700">空间复杂度</th>
              <th className="text-center p-3 border-b font-semibold text-gray-700">推荐</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((cmp, i) => (
              <tr key={i} className={`border-b ${cmp.isRecommended ? "bg-green-50" : "hover:bg-gray-50"}`}>
                <td className="p-3 font-medium text-gray-800">{cmp.name}</td>
                <td className="p-3 text-gray-600">{cmp.description}</td>
                <td className="p-3 text-center font-mono text-gray-700">{cmp.timeComplexity}</td>
                <td className="p-3 text-center font-mono text-gray-700">{cmp.spaceComplexity}</td>
                <td className="p-3 text-center">
                  {cmp.isRecommended ? (
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs">
                      <Zap size={12} /> 推荐
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pros/Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {comparisons.map((cmp, i) => (
          <div
            key={i}
            className={`border rounded-lg p-3 text-xs ${
              cmp.isRecommended ? "border-green-300 bg-green-50" : "border-gray-200"
            }`}
          >
            <span className="font-semibold text-gray-800">{cmp.name}</span>
            {cmp.pros && cmp.pros.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {cmp.pros.map((pro, j) => (
                  <div key={j} className="text-green-600 flex items-start gap-1">
                    <span>+</span> {pro}
                  </div>
                ))}
              </div>
            )}
            {cmp.cons && cmp.cons.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {cmp.cons.map((con, j) => (
                  <div key={j} className="text-red-500 flex items-start gap-1">
                    <span>-</span> {con}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live Benchmark */}
      {benchmark && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleRun}
              disabled={running}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                running
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
              }`}
            >
              <Play size={16} />
              {running
                ? currentSize
                  ? `测试中... n=${currentSize}`
                  : "测试中..."
                : "运行性能测试"}
            </button>
            <span className="text-xs text-gray-400">
              测试数据规模：{sizes.map((s) => `n=${s}`).join(", ")}
            </span>
          </div>

          {/* Results Bar Chart */}
          {results && (
            <div ref={resultsRef} className="space-y-4">
              {sizes.map((size, si) => {
                const hasData = results.every((r) => r.times[si]);
                if (!hasData) return null;
                return (
                  <div key={size}>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">n = {size}</h4>
                    <div className="space-y-1.5">
                      {results.map((r) => {
                        const t = r.times[si];
                        if (!t) return null;
                        const width = maxTime > 0 ? (t.timeMs / maxTime) * 100 : 0;
                        return (
                          <div key={r.name} className="flex items-center gap-2 text-xs">
                            <span className="w-28 text-right text-gray-600 truncate flex-shrink-0">{r.name}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                                style={{
                                  width: `${Math.max(width, 2)}%`,
                                  backgroundColor: r.color,
                                }}
                              >
                                {width > 15 && (
                                  <span className="text-white font-bold text-[10px]">{t.timeMs}ms</span>
                                )}
                              </div>
                              {width <= 15 && (
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-700 font-bold text-[10px]">
                                  {t.timeMs}ms
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ====== 内置 Benchmark 配置工厂 ======

/** Dijkstra benchmarks */
// eslint-disable-next-line react-refresh/only-export-components
export function createDijkstraBenchmark(): BenchmarkConfig {
  function generateData(size: number) {
    const nodes = size;
    const edges: [number, number, number][] = [];
    const edgeCount = Math.min(size * 4, size * (size - 1));
    const added = new Set<string>();
    for (let i = 0; i < edgeCount; i++) {
      const u = (Math.floor(Math.random() * nodes)) + 1;
      const v = (Math.floor(Math.random() * nodes)) + 1;
      if (u === v) continue;
      const key = `${u}-${v}`;
      if (added.has(key)) continue;
      added.add(key);
      edges.push([u, v, Math.floor(Math.random() * 100) + 1]);
    }
    return { nodes, edges, start: 1 };
  }

  return {
    generateData,
    sizes: [30, 80, 150],
    implementations: [
      {
        name: "暴力 O(V²)",
        color: "#ef4444",
        fn: (data: any) => {
          const { nodes, edges, start } = data;
          const INF = Infinity;
          const dist = new Array(nodes + 1).fill(INF);
          const visited = new Array(nodes + 1).fill(false);
          const adj = new Map<number, [number, number][]>();
          for (let i = 1; i <= nodes; i++) adj.set(i, []);
          for (const [u, v, w] of edges) adj.get(u)!.push([v, w]);
          dist[start] = 0;
          for (let iter = 0; iter < nodes; iter++) {
            let u = -1, minD = INF;
            for (let i = 1; i <= nodes; i++) {
              if (!visited[i] && dist[i] < minD) { minD = dist[i]; u = i; }
            }
            if (u === -1) break;
            visited[u] = true;
            for (const [v, w] of adj.get(u)!) {
              if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
            }
          }
          return dist;
        },
      },
      {
        name: "堆优化 O((V+E)logV)",
        color: "#22c55e",
        fn: (data: any) => {
          const { nodes, edges, start } = data;
          const INF = Infinity;
          const dist = new Array(nodes + 1).fill(INF);
          const adj = new Map<number, [number, number][]>();
          for (let i = 1; i <= nodes; i++) adj.set(i, []);
          for (const [u, v, w] of edges) adj.get(u)!.push([v, w]);
          dist[start] = 0;

          // 二叉最小堆实现：[dist, node]
          const heap: [number, number][] = [[0, start]];
          const heapPush = (item: [number, number]) => {
            let i = heap.length;
            heap.push(item);
            while (i > 0) {
              const p = (i - 1) >> 1;
              if (heap[p][0] <= heap[i][0]) break;
              [heap[p], heap[i]] = [heap[i], heap[p]];
              i = p;
            }
          };
          const heapPop = (): [number, number] | undefined => {
            if (heap.length === 0) return undefined;
            const top = heap[0];
            const last = heap.pop()!;
            if (heap.length > 0) {
              heap[0] = last;
              let i = 0;
              const n = heap.length;
              while (true) {
                let smallest = i;
                const l = (i << 1) + 1, r = (i << 1) + 2;
                if (l < n && heap[l][0] < heap[smallest][0]) smallest = l;
                if (r < n && heap[r][0] < heap[smallest][0]) smallest = r;
                if (smallest === i) break;
                [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
                i = smallest;
              }
            }
            return top;
          };

          while (heap.length > 0) {
            const [d, u] = heapPop()!;
            if (d > dist[u]) continue;
            for (const [v, w] of adj.get(u)!) {
              if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                heapPush([dist[v], v]);
              }
            }
          }
          return dist;
        },
      },
      {
        name: "Bellman-Ford O(VE)",
        color: "#f59e0b",
        fn: (data: any) => {
          const { nodes, edges, start } = data;
          const INF = Infinity;
          const dist = new Array(nodes + 1).fill(INF);
          dist[start] = 0;
          for (let i = 0; i < nodes - 1; i++) {
            let updated = false;
            for (const [u, v, w] of edges) {
              if (dist[u] !== INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                updated = true;
              }
            }
            if (!updated) break;
          }
          return dist;
        },
      },
    ],
  };
}

/** Kruskal vs Prim benchmarks */
// eslint-disable-next-line react-refresh/only-export-components
export function createMSTBenchmark(): BenchmarkConfig {
  function generateData(size: number) {
    const nodes = size;
    const edges: [number, number, number][] = [];
    const edgeCount = Math.min(size * 3, size * (size - 1) / 2);
    const added = new Set<string>();
    for (let i = 0; i < edgeCount; i++) {
      const u = (Math.floor(Math.random() * nodes)) + 1;
      const v = (Math.floor(Math.random() * nodes)) + 1;
      if (u === v) continue;
      const key = Math.min(u, v) + "-" + Math.max(u, v);
      if (added.has(key)) continue;
      added.add(key);
      edges.push([u, v, Math.floor(Math.random() * 100) + 1]);
    }
    return { nodes, edges };
  }

  return {
    generateData,
    sizes: [30, 100, 200],
    implementations: [
      {
        name: "Kruskal O(ElogE)",
        color: "#22c55e",
        fn: (data: any) => {
          const { nodes, edges } = data;
          const sorted = [...edges].sort((a, b) => a[2] - b[2]);
          const parent = Array.from({ length: nodes + 1 }, (_, i) => i);
          function find(x: number): number {
            while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
            return x;
          }
          let total = 0, cnt = 0;
          for (const [u, v, w] of sorted) {
            const pu = find(u), pv = find(v);
            if (pu !== pv) { parent[pu] = pv; total += w; cnt++; }
            if (cnt === nodes - 1) break;
          }
          return total;
        },
      },
      {
        name: "Prim O(V·E)",
        color: "#3b82f6",
        fn: (data: any) => {
          const { nodes, edges } = data;
          const adj = new Map<number, [number, number][]>();
          for (let i = 1; i <= nodes; i++) adj.set(i, []);
          for (const [u, v, w] of edges) {
            adj.get(u)!.push([v, w]);
            adj.get(v)!.push([u, w]);
          }
          const inMST = new Array(nodes + 1).fill(false);
          inMST[1] = true;
          let total = 0, cnt = 0;
          for (let iter = 0; iter < nodes - 1; iter++) {
            let bestW = Infinity, bestV = -1;
            for (let u = 1; u <= nodes; u++) {
              if (!inMST[u]) continue;
              for (const [v, w] of adj.get(u)!) {
                if (!inMST[v] && w < bestW) { bestW = w; bestV = v; }
              }
            }
            if (bestV === -1) break;
            inMST[bestV] = true;
            total += bestW;
            cnt++;
          }
          return cnt === nodes - 1 ? total : -1;
        },
      },
    ],
  };
}

/** BFS vs DFS benchmarks */
// eslint-disable-next-line react-refresh/only-export-components
export function createTraversalBenchmark(): BenchmarkConfig {
  function generateData(size: number) {
    const nodes = size;
    const edges: [number, number][] = [];
    const edgeCount = Math.min(size * 3, size * (size - 1) / 2);
    const added = new Set<string>();
    for (let i = 0; i < edgeCount; i++) {
      const u = (Math.floor(Math.random() * nodes)) + 1;
      const v = (Math.floor(Math.random() * nodes)) + 1;
      if (u === v) continue;
      const key = Math.min(u, v) + "-" + Math.max(u, v);
      if (added.has(key)) continue;
      added.add(key);
      edges.push([u, v]);
    }
    return { nodes, edges, start: 1 };
  }

  return {
    generateData,
    sizes: [50, 200, 500],
    implementations: [
      {
        name: "BFS（队列）",
        color: "#22c55e",
        fn: (data: any) => {
          const { nodes, edges, start } = data;
          const adj = new Map<number, number[]>();
          for (let i = 1; i <= nodes; i++) adj.set(i, []);
          for (const [u, v] of edges) { adj.get(u)!.push(v); adj.get(v)!.push(u); }
          const visited = new Array(nodes + 1).fill(false);
          const q = [start];
          visited[start] = true;
          const order: number[] = [];
          let head = 0;
          while (head < q.length) {
            const u = q[head++];
            order.push(u);
            for (const v of adj.get(u)!) if (!visited[v]) { visited[v] = true; q.push(v); }
          }
          return order;
        },
      },
      {
        name: "DFS（递归）",
        color: "#3b82f6",
        fn: (data: any) => {
          const { nodes, edges, start } = data;
          const adj = new Map<number, number[]>();
          for (let i = 1; i <= nodes; i++) adj.set(i, []);
          for (const [u, v] of edges) { adj.get(u)!.push(v); adj.get(v)!.push(u); }
          const visited = new Array(nodes + 1).fill(false);
          const order: number[] = [];
          function dfs(u: number) {
            visited[u] = true;
            order.push(u);
            for (const v of adj.get(u)!) if (!visited[v]) dfs(v);
          }
          dfs(start);
          return order;
        },
      },
    ],
  };
}
