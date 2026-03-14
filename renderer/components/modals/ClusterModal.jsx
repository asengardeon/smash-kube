import React from 'react';
import { RefreshCw } from 'lucide-react';

export const ClusterModal = ({ 
  isOpen, 
  modalType, 
  formData, 
  setFormData, 
  onSubmit, 
  onClose, 
  onFetchClusters, 
  isFetchingClusters, 
  availableClusters 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold">{modalType === 'add' ? 'Adicionar Cluster EKS' : 'Editar Cluster'}</h3>
          <p className="text-gray-400 text-sm mt-1">Configure os detalhes de conexão para seu cluster EKS.</p>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex bg-gray-800 p-1 rounded-lg mb-4">
            <button 
              type="button"
              onClick={() => setFormData({...formData, authMethod: 'sso'})}
              className={`flex-1 py-2 text-[10px] font-medium rounded-md transition-all ${formData.authMethod === 'sso' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
            >
              AWS SSO
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, authMethod: 'manual'})}
              className={`flex-1 py-2 text-[10px] font-medium rounded-md transition-all ${formData.authMethod === 'manual' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Manual Keys
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, authMethod: 'local'})}
              className={`flex-1 py-2 text-[10px] font-medium rounded-md transition-all ${formData.authMethod === 'local' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Kubeconfig Local
            </button>
          </div>

          {formData.authMethod === 'sso' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">AWS Region *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.region}
                    onChange={e => setFormData({...formData, region: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                    placeholder="us-east-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">AWS Profile *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.profile}
                    onChange={e => setFormData({...formData, profile: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                    placeholder="default"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Cluster Name *</label>
                  <button 
                    type="button"
                    onClick={onFetchClusters}
                    disabled={isFetchingClusters}
                    className="text-[10px] text-accent hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    {isFetchingClusters ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                    Listar clusters da conta
                  </button>
                </div>
                {availableClusters.length > 0 ? (
                  <select 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Selecione um cluster...</option>
                    {availableClusters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                    placeholder="e.g. production-cluster"
                  />
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 mt-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">AWS SSO Configuration (Opcional)</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">SSO Start URL</label>
                    <input 
                      type="text" 
                      value={formData.ssoUrl}
                      onChange={e => setFormData({...formData, ssoUrl: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                      placeholder="https://atech.awsapps.com/start/#"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">SSO Region</label>
                    <input 
                      type="text" 
                      value={formData.ssoRegion}
                      onChange={e => setFormData({...formData, ssoRegion: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                      placeholder="us-east-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : formData.authMethod === 'manual' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Cluster Name *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                  placeholder="e.g. production-cluster"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">AWS Region *</label>
                <input 
                  required
                  type="text" 
                  value={formData.region}
                  onChange={e => setFormData({...formData, region: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                  placeholder="us-east-1"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Access Key ID *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.accessKeyId}
                    onChange={e => setFormData({...formData, accessKeyId: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors text-xs"
                    placeholder="Ex: [SUA_ACCESS_KEY_ID]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Secret Access Key *</label>
                  <input 
                    required
                    type="password" 
                    value={formData.secretAccessKey}
                    onChange={e => setFormData({...formData, secretAccessKey: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors text-xs"
                    placeholder="Insira a sua Secret key..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Session Token *</label>
                  <textarea 
                    required
                    value={formData.sessionToken}
                    onChange={e => setFormData({...formData, sessionToken: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors text-xs h-24 resize-none"
                    placeholder="Ex: [SEU_SESSION_TOKEN]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Nome de Exibição *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors"
                  placeholder="e.g. Local Context"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Caminho do Kubeconfig (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.kubeconfigPath || ''}
                  onChange={e => setFormData({...formData, kubeconfigPath: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition-colors text-xs"
                  placeholder="Ex: /Users/user/.kube/config-custom"
                />
                <p className="text-[10px] text-gray-500 mt-2">
                  Se vazio, será utilizado o caminho padrão <code>~/.kube/config</code>.
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 bg-accent hover:bg-blue-600 py-2.5 rounded-lg font-medium transition-colors"
            >
              {modalType === 'add' ? 'Adicionar Cluster' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
