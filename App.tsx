
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Workspace } from './components/Workspace';
import { PromptLibrary } from './components/PromptLibrary';
import { ResultCard } from './components/ResultCard';
import { GeneratedPrompt, Modality, PromptTemplate } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'library' | 'history' | 'bookmarks'>('workspace');
  const [history, setHistory] = useState<GeneratedPrompt[]>([]);
  const [bookmarks, setBookmarks] = useState<GeneratedPrompt[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Load persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem('jp_history');
    const savedBookmarks = localStorage.getItem('jp_bookmarks');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('jp_history', JSON.stringify(history));
    localStorage.setItem('jp_bookmarks', JSON.stringify(bookmarks));
  }, [history, bookmarks]);

  const addToHistory = (prompt: GeneratedPrompt) => {
    setHistory(prev => [prompt, ...prev].slice(0, 10));
  };

  const toggleBookmark = (prompt: GeneratedPrompt) => {
    setBookmarks(prev => {
      const exists = prev.find(p => p.id === prompt.id);
      if (exists) return prev.filter(p => p.id !== prompt.id);
      return [...prev, { ...prompt, isBookmarked: true }];
    });
    setHistory(prev => prev.map(p => p.id === prompt.id ? { ...p, isBookmarked: !p.isBookmarked } : p));
  };

  const handleInjectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('workspace');
  };

  return (
    <div className="flex h-screen overflow-hidden text-gray-100 selection:bg-indigo-500/30">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        historyCount={history.length}
        bookmarkCount={bookmarks.length}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-4">
          <div className="max-w-5xl mx-auto w-full">
            {activeTab === 'workspace' && (
              <Workspace 
                onGenerated={addToHistory} 
                initialTemplate={selectedTemplate}
                onClearTemplate={() => setSelectedTemplate(null)}
              />
            )}
            
            {activeTab === 'library' && (
              <PromptLibrary onInject={handleInjectTemplate} />
            )}
            
            {(activeTab === 'history' || activeTab === 'bookmarks') && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
                  <span className="text-sm text-gray-400">
                    {activeTab === 'history' ? history.length : bookmarks.length} Prompts
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {(activeTab === 'history' ? history : bookmarks).map(prompt => (
                    <ResultCard 
                      key={prompt.id} 
                      prompt={prompt} 
                      onToggleBookmark={() => toggleBookmark(prompt)} 
                    />
                  ))}
                  {(activeTab === 'history' ? history : bookmarks).length === 0 && (
                    <div className="py-20 text-center glass rounded-2xl border-dashed border-2 border-white/5">
                      <p className="text-gray-400">No prompts found in your {activeTab}.</p>
                      <button 
                        onClick={() => setActiveTab('workspace')}
                        className="mt-4 text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                      >
                        Go to Workspace
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Mobile Toggle (Only visible when sidebar closed) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed bottom-6 left-6 z-50 p-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
