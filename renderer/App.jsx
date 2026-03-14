import React, { useState } from 'react';
import { useClusters } from './hooks/useClusters';
import { useK8sResources } from './hooks/useK8sResources';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { ResourceTable } from './components/Table/ResourceTable';
import { ClusterModal } from './components/modals/ClusterModal';
import { LogModal } from './components/modals/LogModal';
import { InspectModal } from './components/modals/InspectModal';
import { DescribeModal } from './components/modals/DescribeModal';
import { HelpModal } from './components/modals/HelpModal';
import { v4 as uuidv4 } from 'uuid';
import { Globe } from 'lucide-react';

const App = () => {
  const { 
    clusters, activeCluster, setActiveCluster, 
    saveClusters, deleteCluster 
  } = useClusters();

  const [currentView, setCurrentView] = useState('pods');
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    loading, error, setError, resources, namespaces, 
    refreshData, fetchInitialData
  } = useK8sResources(activeCluster, currentView, selectedNamespace);

  // Modais State
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [clusterModalType, setClusterModalType] = useState('add');
  const [formData, setFormData] = useState({ 
    name: '', region: '', profile: '', ssoUrl: '', ssoRegion: '',
    authMethod: 'local', accessKeyId: '', secretAccessKey: '', sessionToken: '',
    kubeconfigPath: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [availableClusters, setAvailableClusters] = useState([]);
  const [isFetchingClusters, setIsFetchingClusters] = useState(false);

  const [logModal, setLogModal] = useState({ isOpen: false, podName: '', namespace: '', logs: '', previous: false });
  const [inspectModal, setInspectModal] = useState({ isOpen: false, title: '', data: null });
  const [describeModal, setDescribeModal] = useState({ isOpen: false, title: '', content: '' });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const resetForm = () => {
    setFormData({ 
      name: '', region: '', profile: '', ssoUrl: '', ssoRegion: '',
      authMethod: 'local', accessKeyId: '', secretAccessKey: '', sessionToken: '',
      kubeconfigPath: ''
    });
    setEditingId(null);
    setClusterModalType('add');
    setAvailableClusters([]);
  };

  const openAddModal = () => {
    resetForm();
    setClusterModalType('add');
    setIsClusterModalOpen(true);
  };

  const openEditModal = (cluster) => {
    setFormData({ ...cluster });
    setEditingId(cluster.id);
    setClusterModalType('edit');
    setIsClusterModalOpen(true);
  };

  const handleClusterSubmit = async (e) => {
    e.preventDefault();
    let updatedCluster;
    if (clusterModalType === 'add') {
      updatedCluster = { ...formData, id: uuidv4() };
      await saveClusters([...clusters, updatedCluster]);
    } else {
      updatedCluster = { ...formData, id: editingId };
      await saveClusters(clusters.map(c => c.id === editingId ? updatedCluster : c));
      if (activeCluster?.id === editingId) {
        setActiveCluster(updatedCluster);
        selectCluster(updatedCluster);
      }
    }
    setIsClusterModalOpen(false);
  };

  const selectCluster = async (cluster) => {
    setError(null);
    try {
      await window.electron.updateKubeconfig(cluster);
      setActiveCluster(cluster);
      await fetchInitialData(cluster);
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Erro de conexão'));
    }
  };

  const fetchClustersFromAws = async () => {
    setIsFetchingClusters(true);
    try {
      const list = await window.electron.listEksClusters({ 
        profile: formData.profile, 
        region: formData.region 
      });
      setAvailableClusters(list);
    } catch (err) {
      alert(`Erro ao listar clusters: ${err.message || err}`);
    } finally {
      setIsFetchingClusters(false);
    }
  };

  const viewLogs = async (pod, previous = false) => {
    setLogModal({ 
      isOpen: true, podName: pod.metadata.name, namespace: pod.metadata.namespace, 
      logs: 'Carregando logs...', previous 
    });
    try {
      const logs = await window.electron.k8sCall('getPodLogs', { 
        name: pod.metadata.name, namespace: pod.metadata.namespace, 
        cluster: activeCluster, previous 
      });
      setLogModal(prev => ({ ...prev, logs }));
    } catch (err) {
      setLogModal(prev => ({ ...prev, logs: `Erro ao buscar logs: ${err.message || err}` }));
    }
  };

  const handleDescribe = async (kind, name, namespace) => {
    setDescribeModal({ isOpen: true, title: `Describe ${kind}: ${name}`, content: 'Carregando...' });
    try {
      const content = await window.electron.k8sCall('describeResource', { kind, name, namespace, cluster: activeCluster });
      setDescribeModal(prev => ({ ...prev, content }));
    } catch (err) {
      setDescribeModal(prev => ({ ...prev, content: `Erro ao buscar describe: ${err.message || err}` }));
    }
  };

  return (
    <div className="flex h-screen w-full select-none bg-dark-bg text-gray-200">
      <Sidebar 
        clusters={clusters}
        activeCluster={activeCluster}
        selectCluster={selectCluster}
        onAddCluster={openAddModal}
        onEditCluster={openEditModal}
        onDeleteCluster={deleteCluster}
        onShowHelp={() => setIsHelpOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentView={currentView}
          activeCluster={activeCluster}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedNamespace={selectedNamespace}
          setSelectedNamespace={setSelectedNamespace}
          namespaces={namespaces}
          onReconnect={() => selectCluster(activeCluster)}
          onRefresh={refreshData}
          loading={loading}
        />

        <main className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              <strong>Erro:</strong> {error}
            </div>
          )}

          {!activeCluster ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Globe size={48} className="mb-4 text-gray-600" />
              <h2 className="text-xl font-bold mb-2">Bem-vindo ao Smash Kube</h2>
              <p className="max-w-xs text-sm">Selecione um cluster na barra lateral ou adicione um novo para começar.</p>
            </div>
          ) : (
            <ResourceTable 
              view={currentView}
              items={resources[currentView] || []}
              onViewLogs={viewLogs}
              onInspect={(title, data) => setInspectModal({ isOpen: true, title, data })}
              onDescribe={handleDescribe}
              searchTerm={searchTerm}
            />
          )}
        </main>
      </div>

      <ClusterModal 
        isOpen={isClusterModalOpen}
        modalType={clusterModalType}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleClusterSubmit}
        onClose={() => setIsClusterModalOpen(false)}
        onFetchClusters={fetchClustersFromAws}
        isFetchingClusters={isFetchingClusters}
        availableClusters={availableClusters}
      />

      <LogModal 
        isOpen={logModal.isOpen}
        podName={logModal.podName}
        namespace={logModal.namespace}
        logs={logModal.logs}
        previous={logModal.previous}
        onClose={() => setLogModal(prev => ({ ...prev, isOpen: false }))}
        onRefresh={() => viewLogs({ metadata: { name: logModal.podName, namespace: logModal.namespace } }, logModal.previous)}
        onTogglePrevious={() => viewLogs({ metadata: { name: logModal.podName, namespace: logModal.namespace } }, !logModal.previous)}
      />

      <InspectModal 
        isOpen={inspectModal.isOpen}
        title={inspectModal.title}
        data={inspectModal.data}
        onClose={() => setInspectModal(prev => ({ ...prev, isOpen: false }))}
      />

      <DescribeModal 
        isOpen={describeModal.isOpen}
        title={describeModal.title}
        content={describeModal.content}
        onClose={() => setDescribeModal(prev => ({ ...prev, isOpen: false }))}
      />

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
