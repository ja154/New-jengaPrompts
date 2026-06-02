
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Undo2, Redo2, RotateCcw } from 'lucide-react';
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
  const [state, setState] = useState<WorkspaceState>(() => {
    const saved = localStorage.getItem('jp_workspace_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) || {};
        return {
          modality: parsed.modality || 'text',
          seed: parsed.seed || '',
          params: parsed.params || {},
          isThinking: parsed.isThinking ?? true
        };
      } catch (e) {
        console.error('Failed to parse saved workspace state', e);
      }
    }
    return {
      modality: 'text',
      seed: '',
      params: {},
      isThinking: true
    };
  });
  
  const [past, setPast] = useState<WorkspaceState[]>([]);
  const [future, setFuture] = useState<WorkspaceState[]>([]);
  
  const stateRef = useRef(state);
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = useCallback((updater: (prev: WorkspaceState) => WorkspaceState) => {
    setState(prev => {
      const next = updater(prev);
      
      const seedChanged = prev.seed !== next.seed;
      const othersChanged = 
        prev.modality !== next.modality || 
        prev.isThinking !== next.isThinking || 
        JSON.stringify(prev.params) !== JSON.stringify(next.params);

      if (othersChanged) {
        setPast(p => [...p, prev].slice(-50));
        setFuture([]);
        isTypingRef.current = false;
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      } else if (seedChanged) {
        if (!isTypingRef.current) {
          setPast(p => [...p, prev].slice(-50));
          setFuture([]);
          isTypingRef.current = true;
        }
        
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          isTypingRef.current = false;
        }, 1000);
      }
      
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setPast(currentPast => {
      if (currentPast.length === 0) return currentPast;
      const newPast = [...currentPast];
      const prevState = newPast.pop()!;
      
      setState(currentState => {
        setFuture(currentFuture => [currentState, ...currentFuture]);
        return prevState;
      });
      
      isTypingRef.current = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      
      return newPast;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setFuture(currentFuture => {
      if (currentFuture.length === 0) return currentFuture;
      const newFuture = [...currentFuture];
      const nextState = newFuture.shift()!;
      
      setState(currentState => {
        setPast(currentPast => [...currentPast, currentState].slice(-50));
        return nextState;
      });
      
      isTypingRef.current = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      
      return newFuture;
    });
  }, []);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && isZ) {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (isMod && isY) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const [output, setOutput] = useState(() => localStorage.getItem('jp_workspace_output') || '');
  const [jsonOutput, setJsonOutput] = useState<string | null>(() => localStorage.getItem('jp_workspace_json_output'));
  const [viewMode, setViewMode] = useState<'text' | 'json'>(() => (localStorage.getItem('jp_workspace_view_mode') as 'text' | 'json') || 'text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-save logic
  useEffect(() => {
    localStorage.setItem('jp_workspace_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('jp_workspace_output', output);
  }, [output]);

  useEffect(() => {
    if (jsonOutput) {
      localStorage.setItem('jp_workspace_json_output', jsonOutput);
    } else {
      localStorage.removeItem('jp_workspace_json_output');
    }
  }, [jsonOutput]);

  useEffect(() => {
    localStorage.setItem('jp_workspace_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (initialTemplate) {
      updateState(() => ({
        modality: initialTemplate.modality,
        seed: initialTemplate.seed,
        params: initialTemplate.parameters,
        isThinking: true
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
        isThinking: true
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
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10),
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
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10),
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
        <h2 className="text-sm font-medium text-zinc-300 ml-1 mb-2">Modality</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {MODALITIES.map((m) => (
            <button
              key={m.value}
              onClick={() => updateState(prev => ({ ...prev, modality: m.value, params: {} }))}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl transition-all border
                ${state.modality === m.value 
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100' 
                  : 'bg-[#18181b] border-transparent text-zinc-500 hover:bg-[#27272a] hover:text-zinc-300'}
              `}
            >
              <span className={`text-2xl mb-2 transition-transform ${state.modality === m.value ? 'scale-110' : 'grayscale opacity-50'}`}>{m.icon}</span>
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
              <h2 className="text-sm font-medium text-zinc-300 ml-1">Prompt Idea</h2>
              <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={handleUndo}
                  disabled={past.length === 0}
                  title="Undo (Ctrl+Z)"
                  className={`p-1.5 rounded-lg transition-all ${past.length === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-800 active:scale-95'}`}
                >
                  <Undo2 size={14} />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={future.length === 0}
                  title="Redo (Ctrl+Y)"
                  className={`p-1.5 rounded-lg transition-all ${future.length === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-800 active:scale-95'}`}
                >
                  <Redo2 size={14} />
                </button>
                <div className="w-px h-4 bg-zinc-800 mx-1" />
                <button
                  onClick={() => updateState(prev => ({ ...prev, seed: '' }))}
                  disabled={!state.seed}
                  title="Clear Seed"
                  className={`p-1.5 rounded-lg transition-all ${!state.seed ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 active:scale-95'}`}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
            <textarea
              value={state.seed}
              onChange={(e) => updateState(prev => ({ ...prev, seed: e.target.value }))}
              placeholder="Describe what you want the AI to do..."
              className="w-full h-40 glass p-4 text-base focus:ring-1 focus:ring-zinc-600 outline-none transition-all resize-none text-zinc-100 bg-[#09090b]/50 placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300 ml-1">Properties</h2>
              <button 
                onClick={() => updateState(prev => ({ ...prev, params: {} }))}
                className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider"
              >
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MODALITY_SPECIFIC_CONTROLS[state.modality].map((control) => (
                <div key={control.name} className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 ml-1 capitalize">{control.name}</label>
                  <select
                    value={state.params[control.name] || ''}
                    onChange={(e) => handleParamChange(control.name, e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-zinc-500 outline-none transition-colors text-zinc-300 appearance-none cursor-pointer hover:border-zinc-700"
                  >
                    <option value="" disabled className="bg-[#18181b]">Select {control.name}...</option>
                    {control.options.map(opt => (
                      <option key={opt} value={opt} className="bg-[#18181b]">{opt}</option>
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
                flex-1 w-full py-3.5 rounded-xl font-medium text-sm transition-all
                ${isGenerating || !state.seed.trim()
                  ? 'bg-[#27272a] text-zinc-500 cursor-not-allowed'
                  : 'bg-zinc-100 hover:bg-white text-zinc-900 active:scale-[0.98] shadow-sm'}
              `}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-zinc-500/20 border-t-zinc-900 rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                'Generate Prompt'
              )}
            </button>
            
            <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl">
              <label className="text-xs font-medium text-zinc-400">Deep Reasoning</label>
              <button
                onClick={() => updateState(prev => ({ ...prev, isThinking: !prev.isThinking }))}
                className={`w-10 h-5 rounded-full p-1 transition-colors ${state.isThinking ? 'bg-zinc-100' : 'bg-zinc-800'}`}
              >
                <div className={`w-3 h-3 rounded-full shadow transition-transform ${state.isThinking ? 'bg-zinc-900 translate-x-5' : 'bg-zinc-500 translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Output Column */}
        <section className="space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-zinc-300 ml-1">Output</h2>
              {output && !isGenerating && (
                <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                  <button 
                    onClick={() => setViewMode('text')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'text' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Text
                  </button>
                  <button 
                    onClick={handleConvertToJson}
                    disabled={isConverting}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${viewMode === 'json' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {isConverting && <div className="w-2 h-2 border-t-2 border-zinc-100 rounded-full animate-spin"></div>}
                    JSON
                  </button>
                </div>
              )}
            </div>
            {output && (
              <button 
                onClick={handleCopy}
                className="text-xs text-zinc-400 hover:text-zinc-200 font-medium"
              >
                Copy {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
              </button>
            )}
          </div>
          
          <div 
            ref={outputRef}
            className="flex-1 min-h-[400px] glass p-6 mono text-sm leading-relaxed overflow-y-auto relative group text-zinc-300 bg-[#09090b]/50"
          >
            {!output && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                <div className="grid grid-cols-2 gap-3 opacity-20">
                  <div className="w-12 h-1 bg-zinc-500 rounded-full"></div>
                  <div className="w-8 h-1 bg-zinc-500 rounded-full"></div>
                  <div className="w-16 h-1 bg-zinc-500 rounded-full"></div>
                  <div className="w-10 h-1 bg-zinc-500 rounded-full"></div>
                </div>
                <p className="text-center max-w-[240px] text-xs font-medium">Ready for generation</p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap animate-in fade-in duration-1000">
                {viewMode === 'text' ? output : (jsonOutput || 'Structuring...')}
                {isGenerating && viewMode === 'text' && <span className="inline-block w-2 h-5 bg-zinc-400 ml-1 animate-pulse align-middle"></span>}
              </div>
            )}
            
            {output && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-zinc-800/80 text-zinc-400 text-[10px] font-medium px-2 py-1 rounded border border-zinc-700 backdrop-blur-sm">
                   {viewMode === 'text' ? 'Ready' : 'Structured'}
                 </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
