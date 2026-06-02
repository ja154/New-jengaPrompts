
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
  const [activePrompt, setActivePrompt] = useState<GeneratedPrompt | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Load persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem('jp_history');
    const savedBookmarks = localStorage.getItem('jp_bookmarks');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarks(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('jp_history', JSON.stringify(history));
    localStorage.setItem('jp_bookmarks', JSON.stringify(bookmarks));
  }, [history, bookmarks]);

  const addToHistory = (prompt: GeneratedPrompt) => {
    setHistory(prev => {
      const existingIndex = prev.findIndex(p => p.id === prompt.id);
      if (existingIndex >= 0) {
        const newHistory = [...prev];
        newHistory[existingIndex] = prompt;
        return newHistory;
      }
      return [prompt, ...prev].slice(0, 50); // Increased from 10 to 50
    });
    setBookmarks(prev => {
      const existingIndex = prev.findIndex(p => p.id === prompt.id);
      if (existingIndex >= 0) {
        const newBookmarks = [...prev];
        newBookmarks[existingIndex] = prompt;
        return newBookmarks;
      }
      return prev;
    });
    if (activePrompt && activePrompt.id === prompt.id) {
      setActivePrompt(prompt);
    }
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
    <div className="flex h-screen overflow-hidden text-gray-100 selection:bg-gray-700 selection:text-white bg-[#09090b]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        historyCount={history.length}
        bookmarkCount={bookmarks.length}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative bg-transparent">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-4">
          <div className="max-w-5xl mx-auto w-full">
            {activeTab === 'workspace' && (
              <Workspace 
                onGenerated={addToHistory} 
                initialTemplate={selectedTemplate}
                onClearTemplate={() => setSelectedTemplate(null)}
                activePrompt={activePrompt}
                onClearActivePrompt={() => setActivePrompt(null)}
              />
            )}
            
            {activeTab === 'library' && (
              <PromptLibrary onInject={handleInjectTemplate} />
            )}
            
            {(activeTab === 'history' || activeTab === 'bookmarks') && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                  <div>
                    <h2 className="text-2xl font-semibold capitalize tracking-tight text-zinc-100">{activeTab}</h2>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Stored Prompt Archive</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-400 capitalize">
                      {activeTab === 'history' ? history.length : bookmarks.length} Records
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {(activeTab === 'history' ? history : bookmarks).map(prompt => (
                    <ResultCard 
                      key={prompt.id} 
                      prompt={prompt} 
                      onToggleBookmark={() => toggleBookmark(prompt)} 
                      onEdit={() => {
                        setActivePrompt(prompt);
                        setActiveTab('workspace');
                      }}
                    />
                  ))}
                  {(activeTab === 'history' ? history : bookmarks).length === 0 && (
                    <div className="py-24 text-center glass border-dashed border-2 border-zinc-800">
                      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-700">
                        <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="text-zinc-500 font-medium text-sm mb-4">No prompts found in your {activeTab}</p>
                      <button 
                        onClick={() => setActiveTab('workspace')}
                        className="text-zinc-300 font-medium text-sm hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700"
                      >
                        Initialize Workspace
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
