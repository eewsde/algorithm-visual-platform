/**
 * DFS 有向图的深度优先遍历（洛谷 P5318 查找文献）
 *
 * 题目：n 篇文章（编号 1..n）与 m 条引用关系，X→Y 表示文章 X 有参考文献 Y。
 *       从编号 1 的文章开始，不重复、不遗漏地遍历所有可达文章，输出 DFS 访问顺序。
 *       有多篇可看时先看编号较小的那篇（邻居排序保证）。
 * 算法：显式栈迭代（避免深图递归栈溢出），访问节点 → 沿出边深入 → 回溯。
 *
 * 输入：第一行 n m；接下来 m 行：u v（u→v 有向引用边）。
 * 输出：一行，DFS 访问顺序。
 *
 * 官方样例：
 *   8 9 / 1 2 / 1 3 / 1 4 / 2 5 / 2 6 / 3 7 / 4 7 / 4 8 / 7 8
 *   → 1 2 5 6 3 7 8 4
 *
 * 时间复杂度：O(V+E)    空间复杂度：O(V)（栈）
 */

#include <iostream>
#include <vector>
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
    vector<int> order;

    // 迭代 DFS：逆序压栈，保证与递归版本（正序访问邻居）顺序一致
    vector<int> stack = {1};
    while (!stack.empty()) {
        int u = stack.back();
        stack.pop_back();

        if (visited[u]) continue;
        visited[u] = true;
        order.push_back(u);

        for (int i = (int)adj[u].size() - 1; i >= 0; i--) {
            int v = adj[u][i];
            if (!visited[v]) {
                stack.push_back(v);
            }
        }
    }

    for (size_t i = 0; i < order.size(); i++) {
        cout << order[i] << (i == order.size() - 1 ? "\n" : " ");
    }
    return 0;
}
