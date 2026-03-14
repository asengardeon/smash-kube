const k8sService = require('../main/services/k8sService');
const k8s = require('@kubernetes/client-node');

jest.mock('@kubernetes/client-node', () => {
  return {
    KubeConfig: jest.fn().mockImplementation(() => ({
      loadFromDefault: jest.fn(),
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

  test('loadConfig should load from default', () => {
    k8sService.loadConfig();
    expect(k8s.KubeConfig).toHaveBeenCalled();
  });

  test('isManualAuth should detect full credentials', () => {
    const cluster = {
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      sessionToken: 'token'
    };
    expect(k8sService.isManualAuth(cluster)).toBe(true);
  });

  test('isManualAuth should return false if any credential is missing', () => {
    const cluster = {
      accessKeyId: 'key',
      secretAccessKey: 'secret'
    };
    expect(k8sService.isManualAuth(cluster)).toBe(false);
  });

  test('resetConfig should clear internal state', () => {
    k8sService.loadConfig();
    expect(k8sService.kubeConfig).not.toBeNull();
    k8sService.resetConfig();
    expect(k8sService.kubeConfig).toBeNull();
    expect(k8sService.apiClients).toEqual({});
  });
});
