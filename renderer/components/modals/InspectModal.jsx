import React from 'react';

export const InspectModal = ({ isOpen, title, data, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl h-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            Fechar
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto bg-black font-mono text-xs text-green-400 custom-scrollbar">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
