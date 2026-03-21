
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MODALITIES, MODALITY_SPECIFIC_CONTROLS } from '../constants';
import { Modality, WorkspaceState, GeneratedPrompt, PromptTemplate } from '../types';
import { enhancePrompt, convertToJSON } from '../geminiService';

interface WorkspaceProps {
  onGenerated: (prompt: GeneratedPrompt) => void;
  initialTemplate: PromptTemplate | null;
  onClearTemplate: () => void;
  activePrompt?: GeneratedPrompt | null;
  onClearActivePrompt?: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ onGenerated, initialTemplate, onClearTemplate, activePrompt, onClearActivePrompt }) => {
  const [state, setState] = useState<WorkspaceState>({
    modality: 'text',
    seed: '',
    params: {},
    isThinking: false
  });
  
  const [past, setPast] = useState<WorkspaceState[]>([]);
  const [future, setFuture] = useState<WorkspaceState[]>([]);

  const updateState = useCallback((updater: (prev: WorkspaceState) => WorkspaceState) => {
    setState(prev => {
      const next = updater(prev);
      if (
        prev.seed !== next.seed || 
        prev.modality !== next.modality || 
        JSON.stringify(prev.params) !== JSON.stringify(next.params) || 
        prev.isThinking !== next.isThinking
      ) {
        setPast(p => [...p, prev].slice(-50));
        setFuture([]);
      }
      return next;
    });
  }, []);

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, prev.length - 1));
    setFuture(prev => [state, ...prev]);
    setState(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, state]);
    setState(next);
  };

  const [output, setOutput] = useState('');
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'json'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTemplate) {
      updateState(() => ({
        modality: initialTemplate.modality,
        seed: initialTemplate.seed,
        params: initialTemplate.parameters,
        isThinking: false
      }));
      setOutput('');
      setJsonOutput(null);
      onClearTemplate();
      if (onClearActivePrompt) onClearActivePrompt();
    }
  }, [initialTemplate, onClearTemplate, onClearActivePrompt, updateState]);

  useEffect(() => {
    if (activePrompt) {
      updateState(() => ({
        modality: activePrompt.modality,
        seed: activePrompt.originalSeed,
        params: activePrompt.params || {},
        isThinking: false
      }));
      setOutput(activePrompt.enhancedPrompt);
      setJsonOutput(null);
      setViewMode('text');
    }
  }, [activePrompt, updateState]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, jsonOutput, viewMode]);

  const handleParamChange = (name: string, value: string) => {
    updateState(prev => ({
      ...prev,
      params: { ...prev.params, [name]: value }
    }));
  };

  const handleGenerate = async () => {
    if (!state.seed.trim()) return;
    
    setIsGenerating(true);
    setOutput('');
    setJsonOutput(null);
    setViewMode('text');
    let fullOutput = '';
    
    await enhancePrompt(state, (chunk) => {
      fullOutput += chunk;
      setOutput(fullOutput);
    });
    
    setIsGenerating(false);
    
    const newVersion = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      originalSeed: state.seed,
      enhancedPrompt: fullOutput,
      params: state.params
    };

    if (activePrompt) {
      const updatedPrompt: GeneratedPrompt = {
        ...activePrompt,
        timestamp: newVersion.timestamp,
        originalSeed: newVersion.originalSeed,
        enhancedPrompt: newVersion.enhancedPrompt,
        modality: state.modality,
        params: state.params,
        versions: [newVersion, ...(activePrompt.versions || [])]
      };
      onGenerated(updatedPrompt);
    } else {
      onGenerated({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: newVersion.timestamp,
        originalSeed: newVersion.originalSeed,
        enhancedPrompt: newVersion.enhancedPrompt,
        modality: state.modality,
        isBookmarked: false,
        params: state.params,
        versions: [newVersion]
      });
    }
  };

  const handleConvertToJson = async () => {
    if (!output || isConverting) return;
    if (jsonOutput) {
      setViewMode('json');
      return;
    }
    
    setIsConverting(true);
    const structured = await convertToJSON(output);
    setJsonOutput(structured);
    setViewMode('json');
    setIsConverting(false);
  };

  const handleCopy = () => {
    const textToCopy = viewMode === 'json' ? jsonOutput || '' : output;
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">1. Select Modality</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {MODALITIES.map((m) => (
            <button
              key={m.value}
              onClick={() => updateState(prev => ({ ...prev, modality: m.value, params: {} }))}
              className={`
                flex flex-col items-center justify-center p-4 rounded-2xl transition-all border
                ${state.modality === m.value 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}
              `}
            >
              <span className="text-2xl mb-2">{m.icon}</span>
              <span className="text-xs font-semibold">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Column */}
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">2. Define Seed Idea</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUndo}
                  disabled={past.length === 0}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${past.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-500 hover:text-indigo-700'}`}
                >
                  Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={future.length === 0}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${future.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-500 hover:text-indigo-700'}`}
                >
                  Redo
                </button>
              </div>
            </div>
            <textarea
              value={state.seed}
              onChange={(e) => updateState(prev => ({ ...prev, seed: e.target.value }))}
              placeholder="Describe your core concept in plain English..."
              className="w-full h-40 glass rounded-2xl p-6 text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none border-gray-200 text-gray-900 bg-white"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">3. Technical Parameters</h2>
              <button 
                onClick={() => updateState(prev => ({ ...prev, params: {} }))}
                className="text-[10px] text-gray-500 hover:text-gray-900"
              >
                Reset Params
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MODALITY_SPECIFIC_CONTROLS[state.modality].map((control) => (
                <div key={control.name} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{control.name}</label>
                  <select
                    value={state.params[control.name] || ''}
                    onChange={(e) => handleParamChange(control.name, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/50 outline-none transition-colors text-gray-900"
                  >
                    <option value="" disabled>Select {control.name}...</option>
                    {control.options.map(opt => (
                      <option key={opt} value={opt} className="bg-white">{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !state.seed.trim()}
              className={`
                flex-1 w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-md
                ${isGenerating || !state.seed.trim()
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              `}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Stacking Prompt Blocks...
                </div>
              ) : (
                'Generate Master Prompt'
              )}
            </button>
            
            <div className="flex items-center gap-3 px-4 py-3 glass rounded-2xl border-gray-200">
              <label className="text-xs font-semibold text-gray-600">Deeper Reasoning</label>
              <button
                onClick={() => updateState(prev => ({ ...prev, isThinking: !prev.isThinking }))}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${state.isThinking ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${state.isThinking ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Output Column */}
        <section className="space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">4. Final Output</h2>
              {output && !isGenerating && (
                <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                  <button 
                    onClick={() => setViewMode('text')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    TEXT
                  </button>
                  <button 
                    onClick={handleConvertToJson}
                    disabled={isConverting}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {isConverting && <div className="w-2 h-2 border-t-2 border-gray-900 rounded-full animate-spin"></div>}
                    JSON
                  </button>
                </div>
              )}
            </div>
            {output && (
              <button 
                onClick={handleCopy}
                className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-tighter"
              >
                Copy {viewMode.toUpperCase()}
              </button>
            )}
          </div>
          
          <div 
            ref={outputRef}
            className="flex-1 min-h-[400px] glass rounded-2xl p-8 mono text-sm leading-relaxed border-gray-200 overflow-y-auto relative group text-gray-800"
          >
            {!output && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="grid grid-cols-2 gap-2 opacity-50">
                  <div className="w-8 h-4 bg-gray-300 rounded-sm"></div>
                  <div className="w-8 h-4 bg-gray-300 rounded-sm"></div>
                  <div className="w-12 h-4 bg-gray-300 rounded-sm"></div>
                  <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
                </div>
                <p className="text-center max-w-[200px]">Build your stack on the left to see the optimized result here.</p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap animate-in fade-in duration-1000">
                {viewMode === 'text' ? output : (jsonOutput || 'Structuring...')}
                {isGenerating && viewMode === 'text' && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse align-middle"></span>}
              </div>
            )}
            
            {output && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-1 rounded border border-indigo-200 backdrop-blur-sm">
                   {viewMode === 'text' ? 'Master Prompt' : 'Structured JSON'}
                 </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
