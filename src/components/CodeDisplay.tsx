import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  code: string;
  language?: string;
  highlightedLines?: number[];
  title?: string;
}

function CodeDisplay({
  code,
  language = "typescript",
  highlightedLines = [],
  title = "代码实现",
}: CodeDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const isHighlighted = highlightedLines.includes(lineNumber);
            return {
              style: {
                backgroundColor: isHighlighted ? 'rgba(234, 179, 8, 0.3)' : 'transparent',
                borderLeft: isHighlighted ? '3px solid #eab308' : '3px solid transparent',
                display: 'block',
                transition: 'background-color 0.3s, border-color 0.3s',
              },
            };
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeDisplay;