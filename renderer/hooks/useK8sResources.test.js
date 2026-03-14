import { renderHook, act } from '@testing-library/react';
import { useK8sResources } from './useK8sResources';

describe('useK8sResources hook', () => {
  const mockCluster = { id: '1', name: 'Cluster 1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch data when activeCluster is set', async () => {
    const mockPods = { items: [{ metadata: { name: 'pod1' } }] };
    window.electron.k8sCall.mockResolvedValue(mockPods);

    const { result } = renderHook(() => 
      useK8sResources(mockCluster, 'pods', 'default')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.resources.pods).toEqual(mockPods.items);
    expect(window.electron.k8sCall).toHaveBeenCalledWith('listPods', expect.any(Object));
  });

  test('fetchInitialData should fetch namespaces', async () => {
    const mockNS = { items: [{ metadata: { name: 'ns1' } }] };
    window.electron.k8sCall.mockResolvedValue(mockNS);

    const { result } = renderHook(() => 
      useK8sResources(null, 'pods', 'all')
    );

    await act(async () => {
      await result.current.fetchInitialData(mockCluster);
    });

    expect(result.current.namespaces).toEqual(mockNS.items);
    expect(window.electron.k8sCall).toHaveBeenCalledWith('listNamespaces', { cluster: mockCluster });
  });

  test('refreshData should handle error', async () => {
    window.electron.k8sCall.mockRejectedValue(new Error('K8s Error'));

    const { result } = renderHook(() => 
      useK8sResources(mockCluster, 'pods', 'all')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toContain('Erro ao atualizar: K8s Error');
    expect(result.current.loading).toBe(false);
  });
});
