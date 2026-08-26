/**
 * Floyd 传递闭包（洛谷 B3611）
 *
 * 题目：给定一张 n 个点的有向图的邻接矩阵（图中不含自环，a[i][i]=0），求传递闭包。
 *       传递闭包 B[i][j] = 1 表示 i 可以直接或间接到达 j，否则为 0。
 * 算法：Floyd-Warshall 布尔版，三重循环，k 在最外层：
 *       reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])
 *       注意：对角线不预先置 1——只有存在经过 i 的环时，i 才能间接到达自己。
 *
 * 输入：第一行 n；接下来 n 行，每行 n 个数（0/1）。
 * 输出：n 行，传递闭包矩阵。
 *
 * 官方样例：
 *   4
 *   0 0 0 1
 *   1 0 0 0
 *   0 0 0 1
 *   0 1 0 0
 *   → 输出 4 行均为：1 1 0 1
 *
 * 时间复杂度：O(n³)    空间复杂度：O(n²)
 */

#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<vector<int>> reach(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> reach[i][j];
        }
    }

    // Floyd 布尔版核心：三层循环，中间节点 k 必须在最外层
    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (reach[i][k] && reach[k][j]) {
                    reach[i][j] = 1; // i 可经 k 到达 j
                }
            }
        }
    }

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << reach[i][j] << (j == n - 1 ? "\n" : " ");
        }
    }
    return 0;
}
