import { useState, useEffect } from 'react';

export const useClusters = () => {
  const [clusters, setClusters] = useState([]);
  const [activeCluster, setActiveCluster] = useState(null);

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = async () => {
    try {
      const storedClusters = await window.electron.getClusters();
      setClusters(storedClusters);
    } catch (err) {
      console.error('Failed to load clusters:', err);
    }
  };

  const saveClusters = async (newClusters) => {
    await window.electron.saveClusters(newClusters);
    setClusters(newClusters);
  };

  const deleteCluster = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cluster da sua lista local?')) {
      const newClusters = clusters.filter(c => c.id !== id);
      await saveClusters(newClusters);
      if (activeCluster?.id === id) {
        setActiveCluster(null);
      }
    }
  };

  return {
    clusters,
    activeCluster,
    setActiveCluster,
    saveClusters,
    deleteCluster,
    loadClusters
  };
};
