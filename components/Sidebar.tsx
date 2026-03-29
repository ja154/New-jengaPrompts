
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  activeTab: 'workspace' | 'library' | 'history' | 'bookmarks';
  setActiveTab: (tab: any) => void;
  historyCount: number;
  bookmarkCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setOpen,
  activeTab, 
  setActiveTab, 
  historyCount, 
  bookmarkCount 
}) => {
  const menuItems = [
    { id: 'workspace', label: 'Workspace', icon: '⚡' },
    { id: 'library', label: 'Prompt Library', icon: '📚' },
    { id: 'history', label: 'Local History', icon: '🕒', badge: historyCount },
    { id: 'bookmarks', label: 'Saved Collection', icon: '⭐', badge: bookmarkCount },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" 
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 glass border-r border-[#242429] h-full flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">System Navigation</span>
            <button className="lg:hidden text-gray-400" onClick={() => setOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group border
                  ${activeTab === item.id 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-gray-400 hover:bg-[#1a1a1e] border-transparent hover:text-gray-200'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${activeTab === item.id ? 'bg-indigo-500 text-white' : 'bg-[#242429] text-gray-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>


      </aside>
    </>
  );
};
