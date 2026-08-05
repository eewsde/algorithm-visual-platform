/**
 * 拓扑排序（Kahn 算法 / BFS）
 *
 * 题目：给定有向图，输出任意一个拓扑序列。若存在环则无法排序。
 * 算法：计算入度 → 入度为0的节点入队 → 出队处理 → 删除出边（邻居入度-1）
 *       → 新入度为0的入队 → 重复。若未处理完所有节点则存在环。
 *
 * 时间复杂度：O(V+E)
 * 空间复杂度：O(V+E)
 */

#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<vector<int>> adj(n + 1);
    vector<int> inDegree(n + 1, 0);

    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        inDegree[v]++;
    }

    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    vector<int> result;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        result.push_back(u);

        for (int v : adj[u]) {
            if (--inDegree[v] == 0) {
                q.push(v);
            }
        }
    }

    if ((int)result.size() < n) {
        cout << "图中存在环，无法完成拓扑排序！" << endl;
    } else {
        for (int i = 0; i < n; i++) {
            cout << result[i] << " \n"[i == n - 1];
        }
    }

    return 0;
}
