import React from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code Block
          const match = part.match(/^```(\w+)?\s*([\s\S]*?)```$/);
          const language = match ? match[1] || 'text' : 'text';
          const code = match ? match[2] : part.slice(3, -3).trim();

          return (
            <div key={index} className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800 my-4 shadow-lg group">
              <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800">
                <div className="flex items-center gap-2">
                   <Terminal size={14} className="text-zinc-400"/>
                   <span className="text-xs font-medium text-zinc-300 lowercase">{language}</span>
                </div>
                <button
                  onClick={() => handleCopy(code, index)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-sm font-mono">
                <SyntaxHighlighter
                  language={language.toLowerCase()}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.25rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                  }}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {code.replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        } else {
          // Regular Text
          const paragraphs = part.split('\n\n').filter(p => p.trim());
          return (
            <React.Fragment key={index}>
              {paragraphs.map((p, pIndex) => (
                <p key={`${index}-${pIndex}`} className="mb-3 last:mb-0">
                  {p.split(/(\*\*.*?\*\*|`.*?`)/).map((segment, sIndex) => {
                    if (segment.startsWith('**') && segment.endsWith('**')) {
                      return <strong key={sIndex} className="font-semibold text-white">{segment.slice(2, -2)}</strong>;
                    }
                    if (segment.startsWith('`') && segment.endsWith('`')) {
                      return <code key={sIndex} className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-700/50">{segment.slice(1, -1)}</code>;
                    }
                    return segment;
                  })}
                </p>
              ))}
            </React.Fragment>
          );
        }
      })}
    </div>
  );
};

export default MarkdownMessage;