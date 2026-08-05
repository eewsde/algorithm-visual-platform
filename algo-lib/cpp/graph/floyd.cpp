/**
 * Floyd-Warshall 全源最短路径 / 传递闭包
 *
 * 题目：给定 n 个点的有向图（邻接矩阵），求任意两点间的最短路径或可达性。
 * 算法：三重循环 DP，dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])。
 *       中间节点 k 必须在最外层循环。
 *
 * 时间复杂度：O(n³)
 * 空间复杂度：O(n²)
 */

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int INF = 1e9;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<vector<int>> dist(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> dist[i][j];
            if (i != j && dist[i][j] == 0) {
                dist[i][j] = INF; // 无边记为无穷大
            }
        }
    }

    // Floyd 核心：三层循环
    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] != INF && dist[k][j] != INF) {
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << (dist[i][j] == INF ? -1 : dist[i][j]) << " \n"[j == n - 1];
        }
    }

    return 0;
}
