import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ListChecks, Sparkles } from "lucide-react";
import { problems } from "@/data";
import { useAppStore } from "@/store/useAppStore";

function HomePage() {
  const { getProgressStats } = useAppStore();
  const progressStats = getProgressStats(problems.length);

  const categoryCount = useMemo(() => {
    return new Set(problems.flatMap((p) => p.category)).size;
  }, []);

  const methodCount = useMemo(() => {
    return new Set(problems.flatMap((p) => p.methods)).size;
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-[calc(100vh-80px)]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 pt-12 sm:pt-16 pb-8 sm:pb-12">
        {/* Hero Section */}
        <section className="text-center py-12 sm:py-16 lg:py-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 rounded-full text-sm font-semibold mb-2 shadow-sm border border-primary-100/50">
            <Sparkles className="w-4 h-4" />
            <span>算法研究与程序可视化实践平台</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            算法可视化平台
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            程序设计竞赛中动态规划与图论算法的深度研究与交互式可视化实践
          </p>
        </section>

        {/* Algorithm Cards */}
        <section className="max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20 mt-8 sm:mt-12">
          {/* 图论算法卡片 */}
          <Link
            to="/problems"
            className="group relative bg-white border-2 border-blue-100/50 rounded-3xl p-7 sm:p-9 lg:p-11 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer hover:border-blue-300 block mb-8"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full -mr-36 -mt-36 opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500" />
            <div className="relative space-y-5 sm:space-y-6 z-10">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <ListChecks className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-blue-600 font-bold mb-1.5">
                    洛谷官方题单
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    图论 + 动态规划
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
                精选洛谷官方训练营题目，涵盖 Dijkstra 最短路径、Floyd 全源最短路、Kruskal/Prim 最小生成树及经典动态规划算法，支持逐步执行和交互式动画演示
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-blue-100/50 group-hover:border-blue-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {progressStats.total}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">题目总数</p>
                </div>
                <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-indigo-100/50 group-hover:border-indigo-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                    {categoryCount}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">题型分类</p>
                </div>
                <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-purple-100/50 group-hover:border-purple-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">
                    {methodCount}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">算法方法</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 mb-2">分步执行</h3>
              <p className="text-sm text-gray-600">逐步查看每一步状态变化，理解算法执行过程</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="font-bold text-gray-900 mb-2">交互控制</h3>
              <p className="text-sm text-gray-600">播放/暂停/单步执行/调速，完整控制面板</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">自定义输入</h3>
              <p className="text-sm text-gray-600">支持自行输入测试用例，验证不同场景</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
