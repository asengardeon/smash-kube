const k8s = require('@kubernetes/client-node');

class K8sService {
  constructor() {
    this.kubeConfig = null;
    this.apiClients = {};
  }

  /**
   * Loads the Kubernetes configuration from the default location or from manual credentials.
   * @param {Object} cluster - Cluster configuration object.
   */
  loadConfig(cluster) {
    console.log('[K8sService] Loading configuration...');
    this.kubeConfig = new k8s.KubeConfig();
    try {
      if (cluster && cluster.authMethod === 'local' && cluster.kubeconfigPath) {
        console.log(`[K8sService] Loading custom kubeconfig: ${cluster.kubeconfigPath}`);
        this.kubeConfig.loadFromFile(cluster.kubeconfigPath);
      } else {
        this.kubeConfig.loadFromDefault();
      }
      
      if (this.isManualAuth(cluster)) {
        this.applyManualAuth(cluster);
      }
      
      // Clear cached clients when config changes
      this.apiClients = {};
      return this.kubeConfig;
    } catch (e) {
      console.error('[K8sService] Error reading kubeconfig:', e.message);
      throw new Error("Não foi possível ler o arquivo ~/.kube/config. Verifique se o AWS CLI está configurado.");
    }
  }

  isManualAuth(cluster) {
    return !!(cluster && cluster.authMethod === 'manual' && cluster.accessKeyId && cluster.secretAccessKey && cluster.sessionToken);
  }

  applyManualAuth(cluster) {
    console.log('[K8sService] Applying manual credentials');
    const user = this.kubeConfig.users[0];
    if (user && user.user) {
      user.user = {
        ...user.user,
        exec: undefined,
        'auth-provider': undefined,
        token: undefined,
      };
      process.env.AWS_ACCESS_KEY_ID = cluster.accessKeyId;
      process.env.AWS_SECRET_ACCESS_KEY = cluster.secretAccessKey;
      process.env.AWS_SESSION_TOKEN = cluster.sessionToken;
    }
  }

  getApiClient(apiClass) {
    if (!this.kubeConfig) throw new Error("KubeConfig not loaded");
    const className = apiClass.name;
    if (!this.apiClients[className]) {
      this.apiClients[className] = this.kubeConfig.makeApiClient(apiClass);
    }
    return this.apiClients[className];
  }

  /**
   * Executes a Kubernetes API call with retry logic.
   */
  async call(method, args, cluster) {
    if (!this.kubeConfig) {
      this.loadConfig(cluster);
    }
    
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await this.executeMethod(method, args);
      } catch (err) {
        attempt++;
        const isNetworkError = this.isRetryableError(err);
        console.error(`[K8sService] API error (Attempt ${attempt}):`, err.code || err.message);

        if (isNetworkError && attempt <= maxRetries) {
          this.resetConfig();
          this.loadConfig(cluster);
          continue;
        }
        throw this.formatError(err);
      }
    }
  }

  isRetryableError(err) {
    return err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.errno === -54 || err.status === 401;
  }

  formatError(err) {
    if (err.response?.body) return err.response.body;
    return { message: err.message || "Erro desconhecido na API do Kubernetes" };
  }

  async executeMethod(method, args) {
    const k8sApi = this.getApiClient(k8s.CoreV1Api);
    const appsApi = this.getApiClient(k8s.AppsV1Api);
    const networkingApi = this.getApiClient(k8s.NetworkingV1Api);
    const batchApi = this.getApiClient(k8s.BatchV1Api);
    const storageApi = this.getApiClient(k8s.StorageV1Api);
    const autoscalingApi = this.getApiClient(k8s.AutoscalingV1Api);

    const ns = args?.namespace && args.namespace !== 'all' ? args.namespace : null;

    switch (method) {
      case 'listNamespaces': return (await k8sApi.listNamespace()).body;
      case 'listPods': return ns ? (await k8sApi.listNamespacedPod(ns)).body : (await k8sApi.listPodForAllNamespaces()).body;
      case 'listDeployments': return ns ? (await appsApi.listNamespacedDeployment(ns)).body : (await appsApi.listDeploymentForAllNamespaces()).body;
      case 'listServices': return ns ? (await k8sApi.listNamespacedService(ns)).body : (await k8sApi.listServiceForAllNamespaces()).body;
      case 'listNodes': return (await k8sApi.listNode()).body;
      case 'listConfigMaps': return ns ? (await k8sApi.listNamespacedConfigMap(ns)).body : (await k8sApi.listConfigMapForAllNamespaces()).body;
      case 'listIngresses': return ns ? (await networkingApi.listNamespacedIngress(ns)).body : (await networkingApi.listIngressForAllNamespaces()).body;
      case 'listStatefulSets': return ns ? (await appsApi.listNamespacedStatefulSet(ns)).body : (await appsApi.listStatefulSetForAllNamespaces()).body;
      case 'listDaemonSets': return ns ? (await appsApi.listNamespacedDaemonSet(ns)).body : (await appsApi.listDaemonSetForAllNamespaces()).body;
      case 'listJobs': return ns ? (await batchApi.listNamespacedJob(ns)).body : (await batchApi.listJobForAllNamespaces()).body;
      case 'listCronJobs': return ns ? (await batchApi.listNamespacedCronJob(ns)).body : (await batchApi.listCronJobForAllNamespaces()).body;
      case 'listSecrets': return ns ? (await k8sApi.listNamespacedSecret(ns)).body : (await k8sApi.listSecretForAllNamespaces()).body;
      case 'listStorageClasses': return (await storageApi.listStorageClass()).body;
      case 'listPersistentVolumes': return (await k8sApi.listPersistentVolume()).body;
      case 'listPersistentVolumeClaims': return ns ? (await k8sApi.listNamespacedPersistentVolumeClaim(ns)).body : (await k8sApi.listPersistentVolumeClaimForAllNamespaces()).body;
      case 'listHPA': return ns ? (await autoscalingApi.listNamespacedHorizontalPodAutoscaler(ns)).body : (await autoscalingApi.listHorizontalPodAutoscalerForAllNamespaces()).body;
      case 'listResourceQuotas': return ns ? (await k8sApi.listNamespacedResourceQuota(ns)).body : (await k8sApi.listResourceQuotaForAllNamespaces()).body;
      case 'listEndpoints': return ns ? (await k8sApi.listNamespacedEndpoints(ns)).body : (await k8sApi.listEndpointsForAllNamespaces()).body;
      case 'listEvents': return ns ? (await k8sApi.listNamespacedEvent(ns)).body : (await k8sApi.listEventForAllNamespaces()).body;
      case 'getPodLogs': return (await k8sApi.readNamespacedPodLog(args.name, args.namespace, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, args.previous || false)).body;
      case 'describeResource': return this.generateDescribe(args);
      default: throw new Error(`Método ${method} não implementado`);
    }
  }

  resetConfig() {
    this.kubeConfig = null;
    this.apiClients = {};
  }

  async generateDescribe(args) {
    const { kind, name, namespace } = args;
    const k8sApi = this.getApiClient(k8s.CoreV1Api);
    const appsApi = this.getApiClient(k8s.AppsV1Api);
    const networkingApi = this.getApiClient(k8s.NetworkingV1Api);
    const batchApi = this.getApiClient(k8s.BatchV1Api);
    const autoscalingApi = this.getApiClient(k8s.AutoscalingV1Api);
    const storageApi = this.getApiClient(k8s.StorageV1Api);

    let resourceData;
    switch (kind.toLowerCase()) {
      case 'pod': resourceData = (await k8sApi.readNamespacedPod(name, namespace)).body; break;
      case 'deployment': resourceData = (await appsApi.readNamespacedDeployment(name, namespace)).body; break;
      case 'service': resourceData = (await k8sApi.readNamespacedService(name, namespace)).body; break;
      case 'node': resourceData = (await k8sApi.readNode(name)).body; break;
      case 'configmap': resourceData = (await k8sApi.readNamespacedConfigMap(name, namespace)).body; break;
      case 'secret': resourceData = (await k8sApi.readNamespacedSecret(name, namespace)).body; break;
      case 'ingress': resourceData = (await networkingApi.readNamespacedIngress(name, namespace)).body; break;
      case 'statefulset': resourceData = (await appsApi.readNamespacedStatefulSet(name, namespace)).body; break;
      case 'daemonset': resourceData = (await appsApi.readNamespacedDaemonSet(name, namespace)).body; break;
      case 'job': resourceData = (await batchApi.readNamespacedJob(name, namespace)).body; break;
      case 'cronjob': resourceData = (await batchApi.readNamespacedCronJob(name, namespace)).body; break;
      case 'hpa': resourceData = (await autoscalingApi.readNamespacedHorizontalPodAutoscaler(name, namespace)).body; break;
      case 'pv': resourceData = (await k8sApi.readPersistentVolume(name)).body; break;
      case 'pvc': resourceData = (await k8sApi.readNamespacedPersistentVolumeClaim(name, namespace)).body; break;
      case 'storageclass': resourceData = (await storageApi.readStorageClass(name)).body; break;
      case 'endpoints': resourceData = (await k8sApi.readNamespacedEndpoints(name, namespace)).body; break;
      case 'resourcequota': resourceData = (await k8sApi.readNamespacedResourceQuota(name, namespace)).body; break;
      default: throw new Error(`Describe não implementado para: ${kind}`);
    }

    return this.formatDescribeOutput(resourceData);
  }

  formatDescribeOutput(resourceData) {
    let output = `Name: \t\t${resourceData.metadata.name}\n`;
    output += `Namespace: \t${resourceData.metadata.namespace || '<none>'}\n`;
    output += `Labels: \t${Object.entries(resourceData.metadata.labels || {}).map(([k, v]) => `${k}=${v}`).join(', ') || '<none>'}\n`;
    output += `API Version: \t${resourceData.apiVersion}\nKind: \t\t${resourceData.kind}\n`;
    output += `Creation: \t${resourceData.metadata.creationTimestamp}\n`;
    output += `------------------------------------------------------------\n\n`;
    output += `Spec:\n${JSON.stringify(resourceData.spec, null, 2)}\n\n`;
    output += `Status:\n${JSON.stringify(resourceData.status, null, 2)}\n`;
    return output;
  }
}

module.exports = new K8sService();
