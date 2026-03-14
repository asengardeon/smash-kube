import React from 'react';
import { HelpCircle, Search, FileText, Terminal, RefreshCw } from 'lucide-react';

export const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="text-accent" /> Ajuda e Dicas
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <section>
            <h4 className="text-accent font-semibold mb-2 uppercase text-xs tracking-wider">Como começar</h4>
            <p className="text-sm text-gray-300">
              Adicione um cluster clicando no botão <span className="text-accent">+</span> na barra lateral. 
              Você pode usar perfis do AWS CLI (SSO) ou chaves manuais temporárias.
            </p>
          </section>

          <section>
            <h4 className="text-accent font-semibold mb-2 uppercase text-xs tracking-wider">Ações nos Recursos</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <Search size={16} className="text-blue-400 mt-1" />
                <div>
                  <p className="text-xs font-bold text-white">Inspecionar JSON</p>
                  <p className="text-[10px] text-gray-400">Ver o objeto bruto retornado pela API do Kubernetes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <FileText size={16} className="text-purple-400 mt-1" />
                <div>
                  <p className="text-xs font-bold text-white">Describe</p>
                  <p className="text-[10px] text-gray-400">Visão técnica formatada (estilo kubectl describe).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <Terminal size={16} className="text-accent mt-1" />
                <div>
                  <p className="text-xs font-bold text-white">Logs</p>
                  <p className="text-[10px] text-gray-400">Visualizar logs em tempo real (disponível apenas para Pods).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <RefreshCw size={16} className="text-green-400 mt-1" />
                <div>
                  <p className="text-xs font-bold text-white">Refresh</p>
                  <p className="text-[10px] text-gray-400">Clique no ícone de girar no topo para atualizar a lista.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-xl">
            <h4 className="text-blue-400 font-semibold mb-2 text-xs uppercase">Segurança</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Esta aplicação opera em <strong>Modo Somente Consulta</strong>. Nenhuma ação de escrita (delete, edit, create) é enviada para o seu cluster, garantindo a integridade dos ambientes de produção.
            </p>
          </section>
        </div>
        <div className="p-4 bg-gray-800/50 border-t border-gray-800 text-center">
          <p className="text-[10px] text-gray-500">Smash Kube v1.0.0 • Foco em Amazon EKS</p>
        </div>
      </div>
    </div>
  );
};
