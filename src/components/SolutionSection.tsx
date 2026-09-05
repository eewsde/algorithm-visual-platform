import { useState } from "react";
import { SolutionConfig } from "@/types";
import CodeDisplay from "./CodeDisplay";
import { useAlgoModeStore } from "@/store/useAlgoModeStore";

interface SolutionSectionProps {
  solution: SolutionConfig;
}

function SolutionSection({ solution }: SolutionSectionProps) {
  // 多语言代码版本的当前选中下标（0 为默认语言）
  const [codeLangIndex, setCodeLangIndex] = useState(0);
  // 全局算法模式（Dijkstra 暴力/堆优化），用于过滤 codeVersions 的 variant
  const dijkstraMode = useAlgoModeStore((s) => s.dijkstraMode);
  // 先按 variant 过滤：无 variant 的版本（普通题）全部保留；
  // 有 variant 的只保留当前模式对应的版本
  const allVersions = solution.codeVersions || [];
  const variantFiltered = allVersions.filter(
    (v) => v.variant === undefined || v.variant === dijkstraMode
  );
  // 防御：过滤后若为空（理论上不会），回退到全部版本
  const codeVersions = variantFiltered.length > 0 ? variantFiltered : allVersions;
  const activeVersion = codeVersions[codeLangIndex];

  return (
    <>
      {/* 为什么选择这个方法 */}
      {solution.comparisons && solution.comparisons.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <span className="text-green-600">💡</span>
            为什么选择{solution.methodName}？
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">方法对比：</h4>
              <div className="space-y-3">
                {solution.comparisons.map((comparison, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border ${
                      comparison.isRecommended
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`font-bold text-lg ${
                          comparison.isRecommended
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {comparison.isRecommended ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-1">
                          {comparison.name}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {comparison.description}
                        </p>
                        <div className="flex gap-4 text-sm mb-2">
                          <span
                            className={
                              comparison.isRecommended
                                ? "text-green-600 font-semibold"
                                : "text-red-600"
                            }
                          >
                            时间: {comparison.timeComplexity}
                          </span>
                          <span
                            className={
                              comparison.isRecommended
                                ? "text-blue-600"
                                : "text-green-600"
                            }
                          >
                            空间: {comparison.spaceComplexity}
                          </span>
                        </div>
                        {comparison.pros && comparison.pros.length > 0 && (
                          <p className="text-xs text-gray-600">
                            优点: {comparison.pros.join(", ")}
                          </p>
                        )}
                        {comparison.cons && comparison.cons.length > 0 && (
                          <p className="text-xs text-gray-500">
                            缺点: {comparison.cons.join(", ")}
                          </p>
                        )}
                        {comparison.isRecommended && (
                          <p className="text-xs text-green-700 mt-2 font-medium">
                            ✓ 推荐方法
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {solution.advantages && solution.advantages.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-2">核心优势：</h4>
                <ul className="space-y-2 text-gray-700">
                  {solution.advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">▸</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 解题思路 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">解题思路</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              方法：{solution.methodName}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {solution.methodDescription}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">算法步骤：</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {solution.steps.map((step, index) => (
                <li
                  key={index}
                  className={step.startsWith("  ") ? "ml-6 list-none" : ""}
                >
                  {step.trim()}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* 代码实现 */}
      {codeVersions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 语言切换标签页 */}
          <div className="flex items-end gap-1 px-2 pt-2 bg-gray-50 border-b border-gray-200">
            {codeVersions.map((v, i) => (
              <button
                key={v.language}
                onClick={() => setCodeLangIndex(i)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition border-b-2 -mb-px ${
                  i === codeLangIndex
                    ? "bg-white text-primary-700 border-primary-500"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {v.label}
              </button>
            ))}
            <span className="ml-auto pr-3 pb-2 text-xs text-gray-400">
              {solution.methodName}
            </span>
          </div>
          {activeVersion && (
            <CodeDisplay
              code={activeVersion.code}
              language={activeVersion.language}
              highlightedLines={activeVersion.keyLines || []}
              
            />
          )}
        </div>
      ) : (
        solution.code && (
          <CodeDisplay
            code={solution.code}
            language={solution.language || "typescript"}
            title={`${solution.methodName}（${solution.language?.toUpperCase() || 'TypeScript'}）`}
            highlightedLines={solution.keyLines || []}
          />
        )
      )}

      {/* 复杂度分析 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">复杂度分析</h3>
        <div className="space-y-3 text-gray-700">
          <div>
            <span className="font-semibold text-gray-800">时间复杂度：</span>
            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
              {solution.timeComplexity.value}
            </code>
            <p className="ml-2 mt-1 text-sm">
              {solution.timeComplexity.description}
            </p>
          </div>
          <div>
            <span className="font-semibold text-gray-800">空间复杂度：</span>
            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
              {solution.spaceComplexity.value}
            </code>
            <p className="ml-2 mt-1 text-sm">
              {solution.spaceComplexity.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SolutionSection;
