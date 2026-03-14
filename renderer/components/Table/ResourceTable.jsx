import React from 'react';
import { Search, FileText, Terminal } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

const getAge = (timestamp) => {
  const now = new Date();
  const created = new Date(timestamp);
  const diff = Math.floor((now - created) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export const ResourceTable = ({ view, items, onViewLogs, onInspect, onDescribe }) => {
  if (!items || items.length === 0) return (
    <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl">
      <p className="text-gray-500">Nenhum recurso encontrado.</p>
    </div>
  );

  const renderTable = () => {
    switch (view) {
      case 'pods':
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Namespace</th>
                <th className="pb-3 font-medium">Status / Razão</th>
                <th className="pb-3 font-medium">Restarts</th>
                <th className="pb-3 font-medium">Idade</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {items.map(pod => {
                const containerStatus = pod.status.containerStatuses?.[0];
                const state = containerStatus?.state;
                let reason = '';
                if (state?.waiting) reason = state.waiting.reason;
                if (state?.terminated) reason = state.terminated.reason;

                return (
                  <tr key={pod.metadata.uid} className="text-sm hover:bg-gray-800/30 transition-colors group">
                    <td className="py-4 font-medium text-white max-w-xs truncate" title={pod.metadata.name}>{pod.metadata.name}</td>
                    <td className="py-4 text-gray-400">{pod.metadata.namespace}</td>
                    <td className="py-4">
                      <StatusBadge status={pod.status.phase} reason={reason} />
                    </td>
                    <td className="py-4 text-gray-400">
                      <span className={containerStatus?.restartCount > 0 ? 'text-yellow-500 font-bold' : ''}>
                        {containerStatus?.restartCount || 0}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">{getAge(pod.metadata.creationTimestamp)}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onInspect(`Pod: ${pod.metadata.name}`, pod)} className="p-1.5 hover:bg-gray-700 rounded text-blue-400" title="Inspecionar JSON"><Search size={14} /></button>
                        <button onClick={() => onDescribe('pod', pod.metadata.name, pod.metadata.namespace)} className="p-1.5 hover:bg-gray-700 rounded text-purple-400" title="Describe"><FileText size={14} /></button>
                        <button onClick={() => onViewLogs(pod)} className="p-1.5 hover:bg-gray-700 rounded text-accent" title="Logs"><Terminal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case 'deployments':
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Namespace</th>
                <th className="pb-3 font-medium">Status / Condição</th>
                <th className="pb-3 font-medium">Réplicas (D/D/A/P)</th>
                <th className="pb-3 font-medium">Idade</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {items.map(dep => {
                const available = dep.status.availableReplicas || 0;
                const replicas = dep.spec.replicas || 0;
                const updated = dep.status.updatedReplicas || 0;
                const ready = dep.status.readyReplicas || 0;
                
                const progressing = dep.status.conditions?.find(c => c.type === 'Progressing');
                const availableCond = dep.status.conditions?.find(c => c.type === 'Available');
                
                let status = 'Ready';
                let reason = '';
                
                if (available < replicas) {
                  status = 'Progressing';
                  reason = progressing?.message || 'Scaling...';
                }
                if (availableCond?.status === 'False') {
                  status = 'Failed';
                  reason = availableCond.message;
                }

                return (
                  <tr key={dep.metadata.uid} className="text-sm hover:bg-gray-800/30 transition-colors group">
                    <td className="py-4 font-medium text-white max-w-xs truncate" title={dep.metadata.name}>{dep.metadata.name}</td>
                    <td className="py-4 text-gray-400">{dep.metadata.namespace}</td>
                    <td className="py-4">
                      <StatusBadge status={status} reason={reason} />
                    </td>
                    <td className="py-4 text-gray-400">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono">
                          <span title="Desejado" className="text-blue-400">{replicas}</span>/
                          <span title="Disponível" className="text-green-400">{available}</span>/
                          <span title="Atualizado" className="text-purple-400">{updated}</span>/
                          <span title="Pronto" className="text-yellow-400">{ready}</span>
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase">D/D/A/P</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">{getAge(dep.metadata.creationTimestamp)}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onInspect(`Deployment: ${dep.metadata.name}`, dep)} className="p-1.5 hover:bg-gray-700 rounded text-blue-400" title="Inspecionar JSON"><Search size={14} /></button>
                        <button onClick={() => onDescribe('deployment', dep.metadata.name, dep.metadata.namespace)} className="p-1.5 hover:bg-gray-700 rounded text-purple-400" title="Describe"><FileText size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
        </table>
        );
      case 'statefulsets':
      case 'daemonsets':
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Namespace</th>
                <th className="pb-3 font-medium">Desejado</th>
                <th className="pb-3 font-medium">Atual</th>
                <th className="pb-3 font-medium">Idade</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {items.map(res => (
                <tr key={res.metadata.uid} className="text-sm hover:bg-gray-800/30 transition-colors group">
                  <td className="py-4 font-medium text-white">{res.metadata.name}</td>
                  <td className="py-4 text-gray-400">{res.metadata.namespace}</td>
                  <td className="py-4 text-gray-400">{res.status.desiredNumberScheduled || res.spec.replicas}</td>
                  <td className="py-4 text-gray-400">{res.status.numberReady || res.status.readyReplicas || 0}</td>
                  <td className="py-4 text-gray-400">{getAge(res.metadata.creationTimestamp)}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onInspect(`${res.kind}: ${res.metadata.name}`, res)} className="p-1.5 hover:bg-gray-700 rounded text-blue-400" title="Inspecionar JSON"><Search size={14} /></button>
                      <button onClick={() => onDescribe(res.kind.toLowerCase(), res.metadata.name, res.metadata.namespace)} className="p-1.5 hover:bg-gray-700 rounded text-purple-400" title="Describe"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'jobs':
      case 'cronjobs':
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Namespace</th>
                <th className="pb-3 font-medium">{view === 'jobs' ? 'Conclusões' : 'Agendamento'}</th>
                <th className="pb-3 font-medium">Idade</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-sm">
              {items.map(res => (
                <tr key={res.metadata.uid} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="py-4 font-medium text-white">{res.metadata.name}</td>
                  <td className="py-4 text-gray-400">{res.metadata.namespace}</td>
                  <td className="py-4 text-gray-400">
                    {view === 'jobs' 
                      ? `${res.status.succeeded || 0}/${res.spec.completions || 1}` 
                      : res.spec.schedule}
                  </td>
                  <td className="py-4 text-gray-400">{getAge(res.metadata.creationTimestamp)}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onInspect(`${view === 'jobs' ? 'Job' : 'CronJob'}: ${res.metadata.name}`, res)} className="p-1.5 hover:bg-gray-700 rounded text-blue-400" title="Inspecionar JSON"><Search size={14} /></button>
                      <button onClick={() => onDescribe(view === 'jobs' ? 'job' : 'cronjob', res.metadata.name, res.metadata.namespace)} className="p-1.5 hover:bg-gray-700 rounded text-purple-400" title="Describe"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'services':
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Namespace</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Cluster IP</th>
                <th className="pb-3 font-medium">External IP</th>
                <th className="pb-3 font-medium">Portas</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {items.map(svc => (
                <tr key={svc.metadata.uid} className="text-sm hover:bg-gray-800/30 transition-colors group">
                  <td className="py-4 font-medium text-white">{svc.metadata.name}</td>
                  <td className="py-4 text-gray-400">{svc.metadata.namespace}</td>
                  <td className="py-4 text-gray-400">{svc.spec.type}</td>
                  <td className="py-4 text-gray-400 font-mono text-xs">{svc.spec.clusterIP}</td>
                  <td className="py-4 text-gray-400 font-mono text-xs">
                    {svc.status.loadBalancer?.ingress?.[0]?.hostname || svc.status.loadBalancer?.ingress?.[0]?.ip || '-'}
                  </td>
                  <td className="py-4 text-gray-400 text-xs">
                    {svc.spec.ports.map(p => `${p.port}/${p.protocol}`).join(', ')}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onInspect(`Service: ${svc.metadata.name}`, svc)} className="p-1.5 hover:bg-gray-700 rounded text-blue-400" title="Inspecionar JSON"><Search size={14} /></button>
                      <button onClick={() => onDescribe('service', svc.metadata.name, svc.metadata.namespace)} className="p-1.5 hover:bg-gray-700 rounded text-purple-400" title="Describe"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'nodes':
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Versão</th>
                <th className="pb-3 font-medium">CPU / Memória</th>
                <th className="pb-3 font-medium">SO</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {items.map(node => (
                <tr key={node.metadata.uid} className="text-sm hover:bg-gray-800/30 transition-colors group">
                  <td className="py-4 font-medium text-white">{node.metadata.name}</td>
                  <td className="py-4">
                    <StatusBadge status={node.status.conditions.find(c => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady'} />
                  </td>
                  <td className="py-4 text-gray-400">{node.status.nodeInfo.kubeletVersion}</td>
                  <td className="py-4 text-gray-400">
                    {node.status.capacity.cpu} cores / {node.status.capacity.memory}
                  </td>
                  <td className="py-4 text-gray-400">{node.status.nodeInfo.osImage}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onInspect(`Node: ${node.metadata.name}`, node)} className="p-1.5 hover:bg-gray-700 rounded text-blue-400" title="Inspecionar JSON"><Search size={14} /></button>
                      <button onClick={() => onDescribe('node', node.metadata.name, '')} className="p-1.5 hover:bg-gray-700 rounded text-purple-400" title="Describe"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase">Nodes</p>
              <p className="text-3xl font-bold mt-2">{items.length}</p>
            </div>
          </div>
        );
      default:
        // Render simple table for other resources (ConfigMaps, Secrets, etc.)
        return (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Namespace</th>
                <th className="pb-3 font-medium">Idade</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {items.map(res => (
                <tr key={res.metadata.uid || res.metadata.name} className="text-sm hover:bg-gray-800/30 transition-colors group">
                  <td className="py-4 font-medium text-white truncate max-w-xs">{res.metadata.name}</td>
                  <td className="py-4 text-gray-400">{res.metadata.namespace || '-'}</td>
                  <td className="py-4 text-gray-400">{getAge(res.metadata.creationTimestamp)}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onInspect(`${view}: ${res.metadata.name}`, res)} className="p-1.5 hover:bg-gray-700 rounded text-blue-400" title="Inspecionar JSON"><Search size={14} /></button>
                      <button onClick={() => onDescribe(view === 'pvs' ? 'pv' : (view === 'pvcs' ? 'pvc' : view.slice(0, -1)), res.metadata.name, res.metadata.namespace || '')} className="p-1.5 hover:bg-gray-700 rounded text-purple-400" title="Describe"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="bg-dark-sidebar/30 border border-gray-800 rounded-xl overflow-hidden p-4">
      {renderTable()}
    </div>
  );
};
