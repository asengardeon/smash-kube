import React, { useState } from 'react';
import { 
  Globe, 
  HelpCircle, 
  Plus, 
  Database, 
  Settings, 
  Trash2,
  Box,
  Layers,
  Terminal,
  Cpu,
  FileText
} from 'lucide-react';
import { SidebarGroup, SidebarItem } from './SidebarItems';

export const Sidebar = ({ 
  clusters, 
  activeCluster, 
  selectCluster, 
  onAddCluster, 
  onEditCluster, 
  onDeleteCluster, 
  onShowHelp,
  currentView,
  setCurrentView
}) => {
  const [openGroups, setOpenGroups] = useState({
    workloads: true,
    network: true,
    config: true,
    storage: true,
    cluster: true
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="w-72 bg-dark-sidebar border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="font-bold text-lg text-white flex items-center gap-2">
          <Globe className="text-accent" size={24} /> Smash Kube
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clusters</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={onShowHelp} 
              className="p-1 hover:bg-gray-700 rounded text-gray-400 transition-colors"
              title="Ajuda e Atalhos"
            >
              <HelpCircle size={18} />
            </button>
            <button onClick={onAddCluster} className="p-1 hover:bg-gray-700 rounded text-accent transition-colors">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {clusters.map(cluster => (
            <div 
              key={cluster.id} 
              onClick={() => selectCluster(cluster)}
              className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${activeCluster?.id === cluster.id ? 'bg-accent/10 border-accent' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${activeCluster?.id === cluster.id ? 'bg-accent text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <Database size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{cluster.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {cluster.authMethod === 'local' ? 'Kubeconfig Local' : `${cluster.region} / ${cluster.profile}`}
                  </p>
                </div>
              </div>
              <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-gray-900 shadow-xl p-1 rounded-md border border-gray-700">
                <button onClick={(e) => { e.stopPropagation(); onEditCluster(cluster); }} className="p-1.5 hover:bg-gray-700 rounded text-gray-400" title="Editar"><Settings size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteCluster(cluster.id); }} className="p-1.5 hover:bg-red-900/30 rounded text-red-400" title="Excluir"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {clusters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-gray-500">Nenhum cluster adicionado ainda.</p>
            </div>
          )}
        </div>
      </div>

      {activeCluster && (
        <div className="flex-1 overflow-y-auto border-t border-gray-800 py-2 custom-scrollbar">
          <SidebarItem id="overview" label="Visão Geral" icon={Globe} active={currentView === 'overview'} onClick={setCurrentView} />
          
          <SidebarGroup label="Workloads" isOpen={openGroups.workloads} onToggle={() => toggleGroup('workloads')}>
            <SidebarItem id="pods" label="Pods" icon={Box} active={currentView === 'pods'} onClick={setCurrentView} />
            <SidebarItem id="deployments" label="Deployments" icon={Layers} active={currentView === 'deployments'} onClick={setCurrentView} />
            <SidebarItem id="statefulsets" label="StatefulSets" icon={Layers} active={currentView === 'statefulsets'} onClick={setCurrentView} />
            <SidebarItem id="daemonsets" label="DaemonSets" icon={Layers} active={currentView === 'daemonsets'} onClick={setCurrentView} />
            <SidebarItem id="jobs" label="Jobs" icon={Terminal} active={currentView === 'jobs'} onClick={setCurrentView} />
            <SidebarItem id="cronjobs" label="CronJobs" icon={Terminal} active={currentView === 'cronjobs'} onClick={setCurrentView} />
            <SidebarItem id="hpa" label="HPAs" icon={Cpu} active={currentView === 'hpa'} onClick={setCurrentView} />
          </SidebarGroup>

          <SidebarGroup label="Rede" isOpen={openGroups.network} onToggle={() => toggleGroup('network')}>
            <SidebarItem id="services" label="Services" icon={Globe} active={currentView === 'services'} onClick={setCurrentView} />
            <SidebarItem id="ingresses" label="Ingresses" icon={Globe} active={currentView === 'ingresses'} onClick={setCurrentView} />
            <SidebarItem id="endpoints" label="Endpoints" icon={Globe} active={currentView === 'endpoints'} onClick={setCurrentView} />
          </SidebarGroup>

          <SidebarGroup label="Configuração" isOpen={openGroups.config} onToggle={() => toggleGroup('config')}>
            <SidebarItem id="configmaps" label="ConfigMaps" icon={FileText} active={currentView === 'configmaps'} onClick={setCurrentView} />
            <SidebarItem id="secrets" label="Secrets" icon={Settings} active={currentView === 'secrets'} onClick={setCurrentView} />
            <SidebarItem id="resourcequotas" label="ResourceQuotas" icon={FileText} active={currentView === 'resourcequotas'} onClick={setCurrentView} />
          </SidebarGroup>

          <SidebarGroup label="Armazenamento" isOpen={openGroups.storage} onToggle={() => toggleGroup('storage')}>
            <SidebarItem id="pvs" label="PersistentVolumes" icon={Database} active={currentView === 'pvs'} onClick={setCurrentView} />
            <SidebarItem id="pvcs" label="PV Claims" icon={Database} active={currentView === 'pvcs'} onClick={setCurrentView} />
            <SidebarItem id="storageclasses" label="StorageClasses" icon={Database} active={currentView === 'storageclasses'} onClick={setCurrentView} />
          </SidebarGroup>

          <SidebarGroup label="Cluster" isOpen={openGroups.cluster} onToggle={() => toggleGroup('cluster')}>
            <SidebarItem id="nodes" label="Nodes" icon={Cpu} active={currentView === 'nodes'} onClick={setCurrentView} />
            <SidebarItem id="events" label="Eventos" icon={Terminal} active={currentView === 'events'} onClick={setCurrentView} />
          </SidebarGroup>
        </div>
      )}
    </div>
  );
};
