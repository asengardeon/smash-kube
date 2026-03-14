const { ipcMain } = require('electron');
const Store = require('electron-store');
const awsService = require('../services/awsService');
const k8sService = require('../services/k8sService');

const store = new Store();

function registerIpcHandlers() {
  ipcMain.handle('get-clusters', () => {
    const clusters = store.get('clusters', []);
    
    // --- MODO DEMO: Injetar cluster de demonstração ---
    if (process.env.DEMO_MODE === 'true') {
      const demoCluster = {
        id: 'demo-id-123',
        name: 'demonstracao',
        region: 'us-east-1',
        profile: 'demo-profile',
        authMethod: 'sso'
      };
      // Garantir que o cluster demo apareça na lista se não estiver lá
      if (!clusters.find(c => c.name === 'demonstracao')) {
        return [demoCluster, ...clusters];
      }
    }
    
    return clusters;
  });

  ipcMain.handle('save-clusters', (event, clusters) => {
    store.set('clusters', clusters);
    return true;
  });

  ipcMain.handle('list-eks-clusters', async (event, { profile, region, ssoUrl }) => {
    return awsService.listEksClusters({ profile, region, ssoUrl });
  });

  ipcMain.handle('list-aws-profiles', async () => {
    return awsService.listProfiles();
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
