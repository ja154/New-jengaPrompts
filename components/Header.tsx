
import React from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between glass z-10 sticky top-0 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#27272a] rounded-lg lg:hidden text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#fafafa] rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-[#09090b] rounded-sm"></div>
          </div>
          <h1 className="text-xl font-medium tracking-tight text-white">
            JengaPrompts
          </h1>
        </div>
      </div>
    </header>
  );
};
