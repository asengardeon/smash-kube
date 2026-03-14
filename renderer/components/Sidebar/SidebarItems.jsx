import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SidebarGroup = ({ label, children, isOpen, onToggle }) => {
  return (
    <div className="mb-2">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors"
      >
        {label}
        <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  );
};

export const SidebarItem = ({ id, label, icon: Icon, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all ${active ? 'bg-accent/10 text-accent border-r-2 border-accent font-semibold' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
  >
    <Icon size={16} className={active ? 'text-accent' : 'text-gray-500'} />
    <span className="truncate">{label}</span>
  </button>
);
