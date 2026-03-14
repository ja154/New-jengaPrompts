
import React from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between glass z-10 sticky top-0 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 bg-white/60 rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            JengaPrompts <span className="text-indigo-600 text-sm font-medium ml-1">PRO</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Guest Access
        </div>
      </div>
    </header>
  );
};
