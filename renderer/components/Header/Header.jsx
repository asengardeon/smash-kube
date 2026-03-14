import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

export const Header = ({ 
  currentView, 
  activeCluster, 
  searchTerm, 
  setSearchTerm, 
  selectedNamespace, 
  setSelectedNamespace, 
  namespaces, 
  onReconnect, 
  onRefresh, 
  loading 
}) => {
  const showNamespaceSelector = ['pods', 'deployments', 'statefulsets', 'daemonsets', 'jobs', 'cronjobs', 'services', 'ingresses', 'configmaps', 'secrets', 'pvcs', 'events', 'hpa', 'endpoints', 'resourcequotas'].includes(currentView);

  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-dark-sidebar/50 backdrop-blur-sm">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-lg font-semibold capitalize">{currentView}</h2>
        {activeCluster && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-800 rounded-md px-2 py-1">
              <Search size={14} className="text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar recursos..." 
                className="bg-transparent border-none text-xs outline-none w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {showNamespaceSelector && (
              <select 
                className="bg-gray-800 text-xs rounded-md px-2 py-1 border-none outline-none"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
              >
                <option value="all">Todos os Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns.metadata.name} value={ns.metadata.name}>{ns.metadata.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {activeCluster && (
          <>
            <button 
              onClick={onReconnect}
              className="text-xs text-blue-400 hover:text-blue-300 border border-blue-400/30 px-3 py-1.5 rounded-md hover:bg-blue-400/10 transition-colors"
              title="Atualizar credenciais EKS e reconectar"
            >
              Reconectar EKS
            </button>
            <button 
              onClick={onRefresh} 
              disabled={loading}
              className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
