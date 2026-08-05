/**
 * BFS 图的广度优先遍历
 *
 * 题目：给定无向图，从节点1开始进行BFS遍历，输出访问顺序。
 * 算法：使用队列（FIFO），起点入队→出队访问→邻居入队→重复。
 *       BFS 按层次逐层访问，先访问距离起点近的节点。
 *
 * 时间复杂度：O(V+E)
 * 空间复杂度：O(V)
 */

#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    // 邻居排序保证确定性
    for (int i = 1; i <= n; i++) {
        sort(adj[i].begin(), adj[i].end());
    }

    vector<bool> visited(n + 1, false);
    queue<int> q;
    vector<int> order;

    visited[1] = true;
    q.push(1);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }

    for (int i = 0; i < (int)order.size(); i++) {
        cout << order[i] << " \n"[i == (int)order.size() - 1];
    }

    return 0;
}
