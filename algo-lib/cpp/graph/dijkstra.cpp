/**
 * Dijkstra 单源最短路径（堆优化版）
 *
 * 题目：给定 n 个点、m 条有向边的带非负权图，求从起点 s 到每个点的最短距离。
 * 算法：贪心 + 优先队列，每次选距离最小的未访问节点，对其出边进行松弛操作。
 *
 * 时间复杂度：O((V+E) log V)
 * 空间复杂度：O(V+E)
 */

#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

typedef pair<int, int> pii; // (distance, node)
const int INF = INT_MAX;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, s;
    cin >> n >> m >> s;

    vector<vector<pii>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
    }

    vector<int> dist(n + 1, INF);
    dist[s] = 0;

    // 优先队列（最小堆）：(距离, 节点)
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    pq.push({0, s});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue; // 过时数据跳过

        for (auto [v, w] : adj[u]) {
            if (1LL * dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    for (int i = 1; i <= n; i++) {
        cout << (dist[i] == INF ? -1 : dist[i]) << (i == n ? "\n" : " ");
    }

    return 0;
}
