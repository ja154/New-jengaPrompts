
import React, { useState } from 'react';
import { GeneratedPrompt } from '../types';
import { convertToJSON } from '../geminiService';

interface ResultCardProps {
  prompt: GeneratedPrompt;
  onToggleBookmark: () => void;
  onEdit?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ prompt, onToggleBookmark, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [jsonView, setJsonView] = useState(false);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonView && jsonContent ? jsonContent : prompt.enhancedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleJson = async () => {
    if (jsonView) {
      setJsonView(false);
      return;
    }

    if (jsonContent) {
      setJsonView(true);
      return;
    }

    setIsConverting(true);
    const structured = await convertToJSON(prompt.enhancedPrompt);
    setJsonContent(structured);
    setJsonView(true);
    setIsConverting(false);
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(ts);
  };

  return (
    <div className="glass rounded-2xl border-gray-200 overflow-hidden hover:shadow-md transition-shadow group bg-white">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm">
            {prompt.modality === 'text' && '📝'}
            {prompt.modality === 'image' && '🎨'}
            {prompt.modality === 'video' && '🎬'}
            {prompt.modality === 'audio' && '🔊'}
            {prompt.modality === 'code' && '💻'}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{prompt.originalSeed}</h3>
            <p className="text-[10px] text-gray-500 uppercase font-medium">{formatDate(prompt.timestamp)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
            >
              Edit
            </button>
          )}
          <button 
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg transition-colors ${prompt.isBookmarked ? 'text-yellow-500 bg-yellow-50' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill={prompt.isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-100 text-green-800' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50">
        <div className="mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {jsonView ? (jsonContent || 'Structuring...') : prompt.enhancedPrompt}
        </div>
      </div>
      
      <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-[10px] text-gray-500">Enhanced via Gemini 2.5 Flash</span>
        </div>
        <button 
          onClick={handleToggleJson}
          disabled={isConverting}
          className={`text-[10px] uppercase font-bold tracking-tighter transition-colors flex items-center gap-1 ${jsonView ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {isConverting && <div className="w-2 h-2 border-t-2 border-indigo-400 rounded-full animate-spin"></div>}
          {jsonView ? 'View Raw Prompt' : 'Convert to JSON'}
        </button>
      </div>
    </div>
  );
};
