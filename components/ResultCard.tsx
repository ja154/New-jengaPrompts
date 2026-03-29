
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
    <div className="glass rounded-2xl border-[#242429] overflow-hidden hover:shadow-xl transition-all group bg-[#121215]">
      <div className="p-6 border-b border-[#242429] flex items-center justify-between bg-[#1a1a1e]/50">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#242429] flex items-center justify-center text-sm grayscale group-hover:grayscale-0 transition-all">
            {prompt.modality === 'text' && '📝'}
            {prompt.modality === 'image' && '🎨'}
            {prompt.modality === 'video' && '🎬'}
            {prompt.modality === 'audio' && '🔊'}
            {prompt.modality === 'code' && '💻'}
          </span>
          <div>
            <h3 className="text-sm font-bold text-gray-100 line-clamp-1">{prompt.originalSeed}</h3>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{formatDate(prompt.timestamp)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-[#242429] hover:bg-[#2a2a30] text-indigo-400 border border-indigo-500/20"
            >
              Edit
            </button>
          )}
          <button 
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg transition-colors border ${prompt.isBookmarked ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' : 'text-gray-500 hover:bg-[#242429] border-transparent'}`}
          >
            <svg className="w-4 h-4" fill={prompt.isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${copied ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#242429] hover:bg-[#2a2a30] text-gray-400 border-transparent'}`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-[#0a0a0c]/50">
        <div className="mono text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
          {jsonView ? (jsonContent || 'Structuring...') : prompt.enhancedPrompt}
        </div>
      </div>
      
      <div className="px-6 py-3 bg-[#121215] border-t border-[#242429] flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Enhanced via Gemini 3.1 Flash</span>
        </div>
        <button 
          onClick={handleToggleJson}
          disabled={isConverting}
          className={`text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1 ${jsonView ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'}`}
        >
          {isConverting && <div className="w-2 h-2 border-t-2 border-indigo-400 rounded-full animate-spin"></div>}
          {jsonView ? 'View Raw Prompt' : 'Convert to JSON'}
        </button>
      </div>
    </div>
  );
};
