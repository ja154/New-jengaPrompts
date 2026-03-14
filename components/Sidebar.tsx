
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
        w-72 glass border-r border-gray-200 h-full flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Navigation</span>
            <button className="lg:hidden" onClick={() => setOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
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
