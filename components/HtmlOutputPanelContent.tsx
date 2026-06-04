import React from 'react';

interface HtmlOutputPanelContentProps {
  html: string;
  isLoading: boolean;
  error: string | null;
}

const SkeletonLoader: React.FC = () => (
  <div className="w-full p-4">
    {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
      <div
        key={i}
        className="h-3 mb-2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"
        style={{
          width: `${60 + Math.random() * 40}%`,
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

export const HtmlOutputPanelContent: React.FC<HtmlOutputPanelContentProps> = ({ html, isLoading, error }) => {
  if (isLoading) return <SkeletonLoader />;
  if (error) {
    return (
      <div className="p-4 font-mono text-sm text-rose-400 tracking-wider leading-relaxed">
        // ERROR: {error}
      </div>
    );
  }
  if (html) {
    return (
      <div className="relative w-full">
        {/* Line number gutter header */}
        <div className="px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 tracking-widest flex justify-between">
          <span>// HTML_OUTPUT</span>
          <span>{html.length.toLocaleString()} CHARS</span>
        </div>
        <pre className="m-0 p-4 font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 bg-transparent whitespace-pre-wrap break-all tracking-wide max-h-[500px] overflow-y-auto">
          <code className="text-emerald-400/85">{html}</code>
        </pre>
      </div>
    );
  }
  return (
    <div className="p-5 font-mono text-sm text-zinc-600 tracking-widest">
      // AWAITING HTML OUTPUT...
    </div>
  );
};

export default HtmlOutputPanelContent;
