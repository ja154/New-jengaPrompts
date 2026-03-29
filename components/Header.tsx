
import React from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between glass z-10 sticky top-0 border-b border-[#242429] bg-transparent backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#1a1a1e] rounded-lg lg:hidden text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <div className="w-4 h-4 bg-white/80 rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            JengaPrompts <span className="text-indigo-400 text-[10px] font-bold ml-1 border border-indigo-400/30 px-1.5 py-0.5 rounded tracking-widest">PRO</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#1a1a1e] border border-[#242429] rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          System Online
        </div>
      </div>
    </header>
  );
};
