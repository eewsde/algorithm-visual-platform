/**
 * DFS 图的深度优先遍历
 *
 * 题目：给定无向图，从节点1开始进行DFS遍历，输出访问顺序。
 * 算法：使用递归/栈（LIFO），访问节点→递归访问未访问邻居→回溯。
 *       DFS 沿一条路径深入到底，适合搜索所有路径和连通性检测。
 *
 * 时间复杂度：O(V+E)
 * 空间复杂度：O(V)（递归栈深度）
 */

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> adj;
vector<bool> visited;
vector<int> order;

void dfs(int u) {
    visited[u] = true;
    order.push_back(u);

    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v);
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    adj.resize(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    for (int i = 1; i <= n; i++) {
        sort(adj[i].begin(), adj[i].end());
    }

    visited.assign(n + 1, false);
    dfs(1);

    for (int i = 0; i < (int)order.size(); i++) {
        cout << order[i] << " \n"[i == (int)order.size() - 1];
    }

    return 0;
}
