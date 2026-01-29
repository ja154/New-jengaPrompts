
import React, { useState, useEffect, useRef } from 'react';
import { MODALITIES, MODALITY_SPECIFIC_CONTROLS } from '../constants';
import { Modality, WorkspaceState, GeneratedPrompt, PromptTemplate } from '../types';
import { enhancePrompt } from '../geminiService';

interface WorkspaceProps {
  onGenerated: (prompt: GeneratedPrompt) => void;
  initialTemplate: PromptTemplate | null;
  onClearTemplate: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ onGenerated, initialTemplate, onClearTemplate }) => {
  const [state, setState] = useState<WorkspaceState>({
    modality: 'text',
    seed: '',
    params: {},
    isThinking: false
  });
  
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTemplate) {
      setState({
        modality: initialTemplate.modality,
        seed: initialTemplate.seed,
        params: initialTemplate.parameters,
        isThinking: false
      });
      onClearTemplate();
    }
  }, [initialTemplate, onClearTemplate]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleParamChange = (name: string, value: string) => {
    setState(prev => ({
      ...prev,
      params: { ...prev.params, [name]: value }
    }));
  };

  const handleGenerate = async () => {
    if (!state.seed.trim()) return;
    
    setIsGenerating(true);
    setOutput('');
    let fullOutput = '';
    
    await enhancePrompt(state, (chunk) => {
      fullOutput += chunk;
      setOutput(fullOutput);
    });
    
    setIsGenerating(false);
    
    onGenerated({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      originalSeed: state.seed,
      enhancedPrompt: fullOutput,
      modality: state.modality,
      isBookmarked: false
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">1. Select Modality</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {MODALITIES.map((m) => (
            <button
              key={m.value}
              onClick={() => setState(prev => ({ ...prev, modality: m.value, params: {} }))}
              className={`
                flex flex-col items-center justify-center p-4 rounded-2xl transition-all border
                ${state.modality === m.value 
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
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
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">2. Define Seed Idea</h2>
            <textarea
              value={state.seed}
              onChange={(e) => setState(prev => ({ ...prev, seed: e.target.value }))}
              placeholder="Describe your core concept in plain English..."
              className="w-full h-40 glass rounded-2xl p-6 text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none border-white/10"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">3. Technical Parameters</h2>
              <button 
                onClick={() => setState(prev => ({ ...prev, params: {} }))}
                className="text-[10px] text-gray-500 hover:text-white"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/50 outline-none transition-colors"
                  >
                    <option value="" disabled>Select {control.name}...</option>
                    {control.options.map(opt => (
                      <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
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
                flex-1 w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl
                ${isGenerating || !state.seed.trim()
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}
              `}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Stacking Prompt Blocks...
                </div>
              ) : (
                'Generate Master Prompt'
              )}
            </button>
            
            <div className="flex items-center gap-3 px-4 py-3 glass rounded-2xl border-white/10">
              <label className="text-xs font-semibold text-gray-400">Deeper Reasoning</label>
              <button
                onClick={() => setState(prev => ({ ...prev, isThinking: !prev.isThinking }))}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${state.isThinking ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${state.isThinking ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Output Column */}
        <section className="space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">4. Final Output</h2>
            {output && (
              <button 
                onClick={handleCopy}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-tighter"
              >
                Copy to Clipboard
              </button>
            )}
          </div>
          
          <div 
            ref={outputRef}
            className="flex-1 min-h-[400px] glass rounded-2xl p-8 mono text-sm leading-relaxed border-white/10 overflow-y-auto relative group"
          >
            {!output && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="grid grid-cols-2 gap-2 opacity-20">
                  <div className="w-8 h-4 bg-white rounded-sm"></div>
                  <div className="w-8 h-4 bg-white rounded-sm"></div>
                  <div className="w-12 h-4 bg-white rounded-sm"></div>
                  <div className="w-6 h-4 bg-white rounded-sm"></div>
                </div>
                <p className="text-center max-w-[200px]">Build your stack on the left to see the optimized result here.</p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap animate-in fade-in duration-1000">
                {output}
                {isGenerating && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse align-middle"></span>}
              </div>
            )}
            
            {output && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-indigo-600/20 text-indigo-400 text-[10px] px-2 py-1 rounded border border-indigo-500/20 backdrop-blur-sm">
                   Master Prompt
                 </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
