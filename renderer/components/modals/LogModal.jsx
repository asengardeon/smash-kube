import React from 'react';
import { Terminal, RefreshCw, FileText } from 'lucide-react';

export const LogModal = ({ isOpen, logModal, onRefresh, onTogglePrevious, onCopy, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-5xl h-full flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <Terminal size={18} className="text-accent" /> Logs: {logModal.podName}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Namespace: {logModal.namespace}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={onRefresh}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
                title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={onTogglePrevious}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${logModal.previous ? 'bg-orange-900/40 text-orange-400 border border-orange-800' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'}`}
              title={logModal.previous ? "Ver logs atuais" : "Ver logs antes do restart"}
            >
              {logModal.previous ? "Logs Atuais" : "Logs Pre-Restart"}
            </button>
            <button 
              onClick={onCopy}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              title="Copiar"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-900/30 rounded-lg text-red-400 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto bg-black font-mono text-sm text-gray-300 whitespace-pre">
          {logModal.logs}
        </div>
      </div>
    </div>
  );
};
