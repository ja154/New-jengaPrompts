
import React, { useState } from 'react';
import { TEMPLATES } from '../constants';
import { PromptTemplate, Category } from '../types';

interface LibraryProps {
  onInject: (template: PromptTemplate) => void;
}

export const PromptLibrary: React.FC<LibraryProps> = ({ onInject }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Object.values(Category)];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 400+ pro templates..."
            className="w-full pl-12 pr-6 py-4 glass rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-white/10"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`
                px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                ${activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div 
            key={template.id}
            className="glass rounded-2xl border-white/10 hover:border-indigo-500/30 transition-all group overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
                  {template.modality}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">{template.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                {template.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {Object.entries(template.parameters).map(([k, v]) => (
                  <span key={k} className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-500">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => onInject(template)}
              className="w-full py-4 bg-white/5 border-t border-white/10 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
            >
              Inject to Workspace
            </button>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-32 text-center glass rounded-2xl border-dashed border-2 border-white/5">
            <p className="text-gray-500">No templates match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
