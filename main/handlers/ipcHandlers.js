const { ipcMain } = require('electron');
const Store = require('electron-store');
const awsService = require('../services/awsService');
const k8sService = require('../services/k8sService');

const store = new Store();

function registerIpcHandlers() {
  ipcMain.handle('get-clusters', () => {
    return store.get('clusters', []);
  });

  ipcMain.handle('save-clusters', (event, clusters) => {
    store.set('clusters', clusters);
    return true;
  });

  ipcMain.handle('list-eks-clusters', async (event, { profile, region }) => {
    return awsService.listEksClusters(profile, region);
  });

  ipcMain.handle('update-kubeconfig', async (event, cluster) => {
    if (cluster.authMethod === 'local') {
      k8sService.resetConfig();
      return "Using local kubeconfig";
    }
    const result = await awsService.updateKubeconfig(cluster);
    k8sService.resetConfig();
    return result;
  });

  ipcMain.handle('k8s-call', async (event, { method, args, cluster }) => {
    return k8sService.call(method, args, cluster);
  });
}

module.exports = { registerIpcHandlers };
