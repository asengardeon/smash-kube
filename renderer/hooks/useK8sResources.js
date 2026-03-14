import { useState, useEffect, useCallback } from 'react';

export const useK8sResources = (activeCluster, currentView, selectedNamespace) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState({});
  const [namespaces, setNamespaces] = useState([]);

  const fetchInitialData = useCallback(async (cluster) => {
    try {
      const nsData = await window.electron.k8sCall('listNamespaces', { cluster });
      setNamespaces(nsData.items || []);
    } catch (err) {
      console.error('[UI] Failed to fetch initial data:', err);
      const errorMsg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
      setError(`Erro K8s: ${errorMsg}`);
    }
  }, []);

  const refreshData = useCallback(async (clusterOverride = null) => {
    const cluster = clusterOverride || activeCluster;
    if (!cluster) return;
    setLoading(true);
    try {
      const methods = {
        overview: 'listNodes',
        pods: 'listPods',
        deployments: 'listDeployments',
        statefulsets: 'listStatefulSets',
        daemonsets: 'listDaemonSets',
        jobs: 'listJobs',
        cronjobs: 'listCronJobs',
        services: 'listServices',
        ingresses: 'listIngresses',
        configmaps: 'listConfigMaps',
        secrets: 'listSecrets',
        hpa: 'listHPA',
        nodes: 'listNodes',
        storageclasses: 'listStorageClasses',
        pvs: 'listPersistentVolumes',
        pvcs: 'listPersistentVolumeClaims',
        events: 'listEvents',
        endpoints: 'listEndpoints',
        resourcequotas: 'listResourceQuotas'
      };

      const result = await window.electron.k8sCall(methods[currentView] || 'listPods', { 
        namespace: selectedNamespace,
        cluster: cluster 
      });
      
      setResources(prev => ({ ...prev, [currentView]: result.items || [] }));
      setError(null);
    } catch (err) {
      console.error('[UI] Refresh failed:', err);
      const errorMsg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
      setError(`Erro ao atualizar: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [activeCluster, currentView, selectedNamespace]);

  useEffect(() => {
    if (activeCluster) {
      refreshData();
    } else {
      setResources({});
      setNamespaces([]);
    }
  }, [currentView, activeCluster, selectedNamespace, refreshData]);

  return {
    loading,
    error,
    setError,
    resources,
    setResources,
    namespaces,
    setNamespaces,
    refreshData,
    fetchInitialData
  };
};
