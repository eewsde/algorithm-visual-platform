/**
 * Prim 最小生成树
 *
 * 题目：给定无向图，求最小生成树的总权值；若不连通则输出 -1。
 * 算法：基于节点的贪心。从任意起点出发，每次选连接"已选集合"与"未选集合"的最小权边。
 *
 * 时间复杂度：O(V·E)（暴力）/ O((V+E)logV)（堆优化）
 * 空间复杂度：O(V+E)
 */

#include <iostream>
#include <vector>
#include <climits>
using namespace std;

const int INF = INT_MAX;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    vector<bool> inMST(n + 1, false);
    inMST[1] = true;
    long long total = 0;
    int cnt = 0;

    for (int iter = 0; iter < n - 1; iter++) {
        int bestW = INF, bestV = -1;

        // 扫描所有已选节点的出边
        for (int u = 1; u <= n; u++) {
            if (!inMST[u]) continue;
            for (auto [v, w] : adj[u]) {
                if (!inMST[v] && w < bestW) {
                    bestW = w;
                    bestV = v;
                }
            }
        }

        if (bestV == -1) break; // 图不连通
        inMST[bestV] = true;
        total += bestW;
        cnt++;
    }

    cout << (cnt == n - 1 ? total : -1) << endl;
    return 0;
}
