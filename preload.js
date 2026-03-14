const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getClusters: () => ipcRenderer.invoke('get-clusters'),
  saveClusters: (clusters) => ipcRenderer.invoke('save-clusters', clusters),
  updateKubeconfig: (cluster) => ipcRenderer.invoke('update-kubeconfig', cluster),
  k8sCall: (method, args = {}) => ipcRenderer.invoke('k8s-call', { method, args }),
  listEksClusters: (args) => ipcRenderer.invoke('list-eks-clusters', args),
  listAwsProfiles: () => ipcRenderer.invoke('list-aws-profiles'),
});
