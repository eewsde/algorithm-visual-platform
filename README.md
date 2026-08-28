<h1 align="center">算法可视化教程</h1>

<div align="center">

**通过交互式动画和图解深入理解算法原理，让抽象的代码变得直观易懂**

</div>

---

## 项目简介

基于洛谷 OJ 的算法模板可视化学习项目，涵盖图论和动态规划两大类，通过动画、图解和交互控制，帮助你直观理解常见算法的执行过程。

- **逐步执行**：逐步查看每一步状态变化
- **代码同步高亮**：执行位置和源码一一对应
- **完整控制面板**：播放 / 暂停 / 单步执行 / 调速
- **自定义输入**：支持自行输入测试用例
- **算法模板**：Python + C++ 标准模板代码

## 算法列表

| ID | 算法 | 类别 |
|----|------|------|
| 1 | Dijkstra 单源最短路径 | 图论 |
| 2 | Kruskal 最小生成树 | 图论 |
| 3 | Floyd 全源最短路径 / 传递闭包 | 图论 |
| 4 | 01背包 | 动态规划 |
| 5 | Prim 最小生成树 | 图论 |
| 6 | BFS / DFS 图的遍历 | 图论 |
| 7 | 拓扑排序 (Kahn) | 图论 |
| 8 | 最长递增子序列 (LIS) | 动态规划 |
| 9 | 最长公共子序列 (LCS) | 动态规划 |

## 技术特色

- **现代前端技术栈**：React 18 + TypeScript + Vite
- **组件化可视化方案**：每道题目都有独立的可视化组件，方便扩展和维护
- **状态驱动动画**：算法每一步以结构化数据描述，可轻松绑定到任意可视化形式
- **统一控制逻辑**：进度、播放速度、回放等逻辑在全局复用，保持交互体验一致
- **类型安全**：通过严格的类型定义保证算法步骤、可视化状态的一致性

## 快速开始

```bash
# 克隆项目
git clone https://github.com/eewsde/algorithm-visual-platform.git
cd algorithm-visual-platform

# 安装依赖（推荐 pnpm）
pnpm install

# 启动开发服务器
pnpm dev
```

本地开发服务器默认运行在 `http://localhost:3000`

## 项目结构

```
src/
├── components/     # 通用组件（可视化框架、图模板等）
├── data/           # 题目数据（洛谷 OJ）
├── problems/       # 各题可视化组件（Problem200-208）
├── pages/          # 页面组件
├── store/          # Zustand 状态管理
└── types/          # TypeScript 类型定义
algo-lib/
├── cpp/            # C++ 算法模板
└── python/         # Python 算法模板
```

## 贡献

欢迎任何形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 开启 Pull Request

## 技术栈

- **框架**：React 18 + TypeScript + Vite 5
- **UI**：Ant Design 6.x + Tailwind CSS 3.4
- **可视化**：D3.js, Cytoscape, vis-network
- **动画**：Framer Motion + GSAP
- **状态管理**：Zustand

## 致谢

- [洛谷](https://www.luogu.com.cn/) - 题目来源
- [Datawhale](https://github.com/datawhalechina) - 开源学习社区
- [React](https://react.dev/) - UI 框架
- 所有贡献者

## 许可证

MIT License
