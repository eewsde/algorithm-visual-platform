/**
 * BFS 有向图的广度优先遍历（洛谷 P5318 查找文献）
 *
 * 题目：n 篇文章（编号 1..n）与 m 条引用关系，X→Y 表示文章 X 有参考文献 Y。
 *       从编号 1 的文章开始，不重复、不遗漏地遍历所有可达文章，输出 BFS 访问顺序。
 *       有多篇可看时先看编号较小的那篇（邻居排序保证）。
 * 算法：队列（FIFO）：起点入队 → 出队访问 → 未访问的出边邻居入队 → 重复。
 *       BFS 按层次逐层访问，先访问离起点近的节点。
 *
 * 输入：第一行 n m；接下来 m 行：u v（u→v 有向引用边）。
 * 输出：一行，BFS 访问顺序。
 *
 * 官方样例：
 *   8 9 / 1 2 / 1 3 / 1 4 / 2 5 / 2 6 / 3 7 / 4 7 / 4 8 / 7 8
 *   → 1 2 3 4 5 6 7 8
 *
 * 时间复杂度：O(V+E)    空间复杂度：O(V)
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

    // 有向图：只存出边 u→v
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
    }

    // 邻居排序保证“先看编号较小”的确定性输出
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

    for (size_t i = 0; i < order.size(); i++) {
        cout << order[i] << (i == order.size() - 1 ? "\n" : " ");
    }
    return 0;
}
