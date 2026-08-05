/**
 * Kruskal 最小生成树
 *
 * 题目：给定无向图，求最小生成树的总权值；若不连通则输出 -1。
 * 算法：基于边的贪心。按边权排序，用并查集判断连通性，选 n-1 条不形成环的最小边。
 *
 * 时间复杂度：O(E log E)
 * 空间复杂度：O(V+E)
 */

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Edge {
    int u, v, w;
    bool operator<(const Edge& other) const {
        return w < other.w;
    }
};

vector<int> parent, rnk;

int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

bool unite(int x, int y) {
    int px = find(x), py = find(y);
    if (px == py) return false;
    if (rnk[px] < rnk[py]) parent[px] = py;
    else if (rnk[px] > rnk[py]) parent[py] = px;
    else { parent[py] = px; rnk[px]++; }
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }

    sort(edges.begin(), edges.end());

    parent.resize(n + 1);
    rnk.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) parent[i] = i;

    long long total = 0;
    int cnt = 0;
    for (const auto& e : edges) {
        if (unite(e.u, e.v)) {
            total += e.w;
            cnt++;
            if (cnt == n - 1) break;
        }
    }

    cout << (cnt == n - 1 ? total : -1) << endl;
    return 0;
}
