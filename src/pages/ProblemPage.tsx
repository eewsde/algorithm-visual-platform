import { Suspense, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Heart, BookOpen, Loader2 } from "lucide-react";
import { getProblemById, problems, categoryNames } from "@/data";
import { Difficulty } from "@/types";
import { getVisualizer } from "@/problems";
import SolutionSection from "@/components/SolutionSection";
import { useAppStore } from "@/store/useAppStore";
import { useScrollRestore } from "@/hooks/useScrollRestore";

/**
 * 加载中的占位组件
 */
function VisualizerLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-gray-600">加载可视化组件中...</p>
      </div>
    </div>
  );
}

/**
 * 可视化组件渲染器
 * 根据题目 ID 动态渲染对应的可视化组件（支持懒加载）
 */
function VisualizerRenderer({ problemId }: { problemId: number }) {
  const VisualizerComponent = getVisualizer(problemId);
  
  if (!VisualizerComponent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">该题目的可视化功能正在开发中...</p>
          <p className="text-sm text-gray-400">
            敬请期待 🚀
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={<VisualizerLoading />}>
      <VisualizerComponent />
    </Suspense>
  );
}

function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentId = Number(id);
  const problem = getProblemById(currentId);
  const descriptionContainerRef = useRef<HTMLDivElement>(null);
  
  // 使用 Zustand store
  const {
    isCompleted,
    isFavorite,
    isInProgress,
    markAsCompleted,
    markAsInProgress,
    toggleFavorite,
    removeFromProgress,
  } = useAppStore();

  // 使用 Zustand store 管理左侧描述区域的滚动位置
  useScrollRestore(`/problem/${currentId}`, descriptionContainerRef);
  
  const completed = isCompleted(currentId);
  const favorite = isFavorite(currentId);
  const inProgress = isInProgress(currentId);
  
  // 找到当前题目在列表中的索引
  const currentIndex = problems.findIndex(p => p.id === currentId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < problems.length - 1;
  
  const handlePrevious = () => {
    if (hasPrevious) {
      navigate(`/problem/${problems[currentIndex - 1].id}`);
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      navigate(`/problem/${problems[currentIndex + 1].id}`);
    }
  };
  
  const handleComplete = () => {
    markAsCompleted(currentId);
    if (hasNext) {
      handleNext();
    } else {
      navigate('/problems');
    }
  };
  
  const handleStartLearning = () => {
    markAsInProgress(currentId);
  };

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">题目未找到</h2>
        <Link to="/problems" className="text-primary-600 hover:underline">
          返回题目列表
        </Link>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "text-green-600 bg-green-50 border-green-200";
      case Difficulty.MEDIUM:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case Difficulty.HARD:
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getDifficultyText = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "简单";
      case Difficulty.MEDIUM:
        return "中等";
      case Difficulty.HARD:
        return "困难";
    }
  };

  return (
    <div className="h-[calc(100vh-80px)]">
      {/* 顶部导航栏 */}
      <div className="px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          {/* 左侧：返回按钮 */}
          <Link
            to="/problems"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
          >
            <ArrowLeft size={20} />
            <span>返回题目列表</span>
          </Link>
          
          {/* 中间：题目标题 */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono text-sm">
              {problem.luoguNumber}
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              {problem.title}
            </h2>
            <span
              className={`px-2 py-1 text-xs font-medium border rounded-full ${getDifficultyColor(
                problem.difficulty
              )}`}
            >
              {getDifficultyText(problem.difficulty)}
            </span>
          </div>
          
          {/* 右侧：导航按钮组 */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>上一题</span>
            </button>
            
            {/* 收藏按钮 */}
            <button
              onClick={() => toggleFavorite(currentId)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                favorite
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              title={favorite ? "取消收藏" : "收藏"}
            >
              <Heart size={16} fill={favorite ? "currentColor" : "none"} />
            </button>
            
            {/* 开始学习/学完按钮 */}
            {!completed ? (
              <button
                onClick={inProgress ? handleComplete : handleStartLearning}
                className={`inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg transition shadow-sm ${
                  inProgress
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : "text-white bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {inProgress ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>学完</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={16} />
                    <span>开始学习</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => removeFromProgress(currentId)}
                className="inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-gray-100 transition"
                title="点击取消已完成状态"
              >
                <CheckCircle2 size={16} />
                <span>已完成</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>下一题</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 左右分栏布局 */}
      <div className="flex h-[calc(100%-56px)]">
        {/* 左侧：题目描述和题解 */}
        <div ref={descriptionContainerRef} className="w-1/2 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-6">
            {/* 题目信息 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-2">
                    {problem.category.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {categoryNames[cat] || cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </div>

            {/* 示例 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">示例</h3>
              {problem.examples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="font-mono text-sm">
                    {/* 输入/输出各自独立成块：标签单独一行，内容另起一行，块之间留空行 */}
                    <div className="mb-3">
                      <div className="text-gray-600 font-semibold mb-1">输入：</div>
                      {/* whitespace-pre-line：保留 \n 换行，避免多行示例被压成一行、数字黏连 */}
                      <div className="text-gray-900 whitespace-pre-line">{example.input}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-gray-600 font-semibold mb-1">输出：</div>
                      <div className="text-gray-900 whitespace-pre-line">{example.output}</div>
                    </div>
                    {example.explanation && (
                      <div>
                        <div className="text-gray-600 font-semibold mb-1">解释：</div>
                        <div className="text-gray-900 whitespace-pre-line">{example.explanation}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 约束条件 */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">约束条件</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="leading-relaxed">{constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 提示 */}
            {problem.hints && problem.hints.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">提示</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {problem.hints.map((hint, index) => (
                    <li key={index} className="leading-relaxed">{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 题解部分 - 使用统一配置 */}
            {problem.solution && <SolutionSection solution={problem.solution} />}
          </div>
        </div>

        {/* 右侧：可视化区域 */}
        <div className="w-1/2 bg-white overflow-hidden flex flex-col">
          <VisualizerRenderer problemId={problem.id} />
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;

