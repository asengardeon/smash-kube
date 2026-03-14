import { renderHook, act } from '@testing-library/react';
import { useClusters } from './useClusters';

describe('useClusters hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load clusters on mount', async () => {
    const mockClusters = [{ id: '1', name: 'Cluster 1' }];
    window.electron.getClusters.mockResolvedValue(mockClusters);

    const { result } = renderHook(() => useClusters());

    // Wait for useEffect to trigger loadClusters
    await act(async () => {
      await Promise.resolve(); 
    });

    expect(result.current.clusters).toEqual(mockClusters);
    expect(window.electron.getClusters).toHaveBeenCalled();
  });

  test('saveClusters should update state and call electron', async () => {
    const newClusters = [{ id: '2', name: 'New Cluster' }];
    const { result } = renderHook(() => useClusters());

    await act(async () => {
      await result.current.saveClusters(newClusters);
    });

    expect(result.current.clusters).toEqual(newClusters);
    expect(window.electron.saveClusters).toHaveBeenCalledWith(newClusters);
  });

  test('deleteCluster should confirm and remove cluster', async () => {
    const mockClusters = [{ id: '1', name: 'C1' }, { id: '2', name: 'C2' }];
    window.electron.getClusters.mockResolvedValue(mockClusters);
    window.confirm.mockReturnValue(true);

    const { result } = renderHook(() => useClusters());

    await act(async () => {
      await Promise.resolve(); // load initial
    });

    await act(async () => {
      await result.current.deleteCluster('1');
    });

    expect(result.current.clusters).toEqual([{ id: '2', name: 'C2' }]);
    expect(window.electron.saveClusters).toHaveBeenCalled();
  });
});
