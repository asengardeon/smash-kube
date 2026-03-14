const k8sService = require('../main/services/k8sService');
const k8s = require('@kubernetes/client-node');

jest.mock('@kubernetes/client-node', () => {
  return {
    KubeConfig: jest.fn().mockImplementation(() => ({
      loadFromDefault: jest.fn(),
      loadFromFile: jest.fn(),
      makeApiClient: jest.fn(),
      users: [{ user: { name: 'user' } }]
    })),
    CoreV1Api: class {},
    AppsV1Api: class {},
    NetworkingV1Api: class {},
    BatchV1Api: class {},
    StorageV1Api: class {},
    AutoscalingV1Api: class {}
  };
});

describe('K8sService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    k8sService.resetConfig();
  });

  test('loadConfig should load default config', () => {
    const config = k8sService.loadConfig();
    expect(config.loadFromDefault).toHaveBeenCalled();
  });

  test('loadConfig should load from custom file for local auth', () => {
    const cluster = { authMethod: 'local', kubeconfigPath: '/path/to/config' };
    const config = k8sService.loadConfig(cluster);
    expect(config.loadFromFile).toHaveBeenCalledWith('/path/to/config');
    expect(config.loadFromDefault).not.toHaveBeenCalled();
  });

  test('isManualAuth should detect manual credentials', () => {
    const manualCluster = {
      authMethod: 'manual',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      sessionToken: 'token'
    };
    expect(k8sService.isManualAuth(manualCluster)).toBe(true);
    expect(k8sService.isManualAuth({ authMethod: 'manual' })).toBe(false);
    expect(k8sService.isManualAuth({ accessKeyId: 'key', secretAccessKey: 'secret', sessionToken: 'token' })).toBe(false);
  });

  test('call should execute method on API client', async () => {
    const mockBody = { items: [] };
    const mockApi = {
      listNamespace: jest.fn().mockResolvedValue({ body: mockBody })
    };
    
    // Mock getApiClient to return our mockApi
    jest.spyOn(k8sService, 'getApiClient').mockReturnValue(mockApi);

    const result = await k8sService.call('listNamespaces', {});
    expect(result).toEqual(mockBody);
    expect(mockApi.listNamespace).toHaveBeenCalled();
  });

  test('call should retry on retryable error', async () => {
    const mockBody = { items: [] };
    const mockApi = {
      listNamespace: jest.fn()
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockResolvedValueOnce({ body: mockBody })
    };
    
    jest.spyOn(k8sService, 'getApiClient').mockReturnValue(mockApi);
    jest.spyOn(k8sService, 'loadConfig').mockImplementation(() => {});

    const result = await k8sService.call('listNamespaces', {});
    expect(result).toEqual(mockBody);
    expect(mockApi.listNamespace).toHaveBeenCalledTimes(2);
  });

  test('formatError should extract body if present', () => {
    const err = { response: { body: { message: 'Api Error' } } };
    expect(k8sService.formatError(err)).toEqual({ message: 'Api Error' });
  });
});
