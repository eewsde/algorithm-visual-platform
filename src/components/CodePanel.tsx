import { useState } from "react";
import { Code2, ChevronDown, ChevronRight } from "lucide-react";

interface CodePanelProps {
  code?: string;
  language?: string;
  highlightLines?: number[];
  title?: string;
}

/** 简易 TypeScript 语法高亮 */
function highlightTS(code: string): string {
  return code
    // 注释
    .replace(/(\/\/.*$)/gm, '<span class="text-gray-400 italic">$1</span>')
    // 字符串
    .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-green-600">$1</span>')
    // 关键字
    .replace(
      /\b(function|const|let|var|return|if|else|for|while|do|break|continue|new|class|extends|implements|interface|type|import|export|from|default|async|await|try|catch|throw|switch|case|in|of|true|false|null|undefined)\b/g,
      '<span class="text-purple-600 font-medium">$1</span>'
    )
    // 数字
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-500">$1</span>')
    // 函数调用
    .replace(/\b(\w+)(?=\()/g, '<span class="text-yellow-700">$1</span>')
    // 类型注解
    .replace(/:\s*(number|string|boolean|void|any|never|Map|Set|Array)\b/g, ': <span class="text-blue-500">$1</span>');
}

export function CodePanel({ code, language, highlightLines = [], title }: CodePanelProps) {
  const [collapsed, setCollapsed] = useState(true);

  if (!code) return null;

  const highlighted = new Set(highlightLines);
  const html = highlightTS(code);
  const htmlLines = html.split("\n");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2 text-gray-800">
          <Code2 size={18} className="text-blue-500" />
          <span className="font-semibold text-sm">{title || "算法代码"}</span>
          {language && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{language}</span>
          )}
        </div>
        {collapsed ? <ChevronRight size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {!collapsed && (
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <tbody>
                {htmlLines.map((lineHtml, i) => {
                  const lineNum = i + 1;
                  const isHighlight = highlighted.has(lineNum);
                  return (
                    <tr
                      key={i}
                      className={
                        isHighlight
                          ? "bg-yellow-50 border-l-2 border-l-yellow-400"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td
                        className={`text-right pr-4 pl-3 py-0.5 select-none w-12 border-r ${
                          isHighlight ? "text-yellow-600 font-bold bg-yellow-100" : "text-gray-400 bg-gray-50"
                        }`}
                      >
                        {lineNum}
                      </td>
                      <td
                        className={`px-4 py-0.5 whitespace-pre ${
                          isHighlight ? "text-gray-900" : "text-gray-700"
                        }`}
                        dangerouslySetInnerHTML={{ __html: lineHtml || " " }}
                      />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
