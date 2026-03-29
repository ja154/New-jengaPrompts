
import React, { useState, useMemo } from 'react';
import { TEMPLATES } from '../constants';
import { PromptTemplate, Category } from '../types';

interface LibraryProps {
  onInject: (template: PromptTemplate) => void;
}

export const PromptLibrary: React.FC<LibraryProps> = ({ onInject }) => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract all unique tags from templates
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    TEMPLATES.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  const categories = Object.values(Category);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => {
      const matchesSearch = 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category as Category);
      
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => t.tags?.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [search, selectedCategories, selectedTags]);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSearch('');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || search.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        {/* Search and Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description or tag..."
              className="w-full pl-12 pr-6 py-4 glass rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all border-[#242429] text-gray-100 bg-[#0a0a0c]/50 placeholder:text-gray-700"
            />
          </div>
          
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2 px-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Categories</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategories([])}
              className={`
                px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border
                ${selectedCategories.length === 0 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                  : 'bg-[#121215] border-[#242429] text-gray-500 hover:bg-[#1a1a1e] hover:text-gray-300'}
              `}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`
                  px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border
                  ${selectedCategories.includes(cat) 
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' 
                    : 'bg-[#121215] border-[#242429] text-gray-500 hover:bg-[#1a1a1e] hover:text-gray-300'}
                `}
              >
                {selectedCategories.includes(cat) && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Bar */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Sub-categories & Tags</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`
                  px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border
                  ${selectedTags.includes(tag)
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                    : 'bg-[#121215] border-[#242429] text-gray-500 hover:bg-[#1a1a1e] hover:text-gray-300'}
                `}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div 
            key={template.id}
            className="glass rounded-2xl border-[#242429] hover:border-indigo-500/50 transition-all group overflow-hidden flex flex-col bg-[#121215]"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                  {template.modality}
                </span>
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors text-gray-100">{template.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {template.description}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {template.tags?.map(tag => (
                  <span key={tag} className="text-[9px] text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {Object.entries(template.parameters).map(([k, v]) => (
                  <span key={k} className="text-[9px] bg-[#1a1a1e] border border-[#242429] px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase tracking-tighter">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => onInject(template)}
              className="w-full py-4 bg-[#1a1a1e] border-t border-[#242429] text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 hover:bg-indigo-500/10 transition-all"
            >
              Inject to Workspace
            </button>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-32 text-center glass rounded-2xl border-dashed border-2 border-[#242429]">
            <p className="text-gray-500 mb-2 font-bold uppercase text-[10px] tracking-widest">No matching templates found</p>
            <button 
              onClick={clearFilters}
              className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 underline underline-offset-4"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
