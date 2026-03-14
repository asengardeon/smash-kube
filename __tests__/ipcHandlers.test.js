jest.mock('electron-store');

const awsService = require('../main/services/awsService');
const k8sService = require('../main/services/k8sService');
const { registerIpcHandlers } = require('../main/handlers/ipcHandlers');
const Store = require('electron-store');
const { ipcMain } = require('electron');

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn()
  }
}));

jest.mock('../main/services/awsService');
jest.mock('../main/services/k8sService');

describe('ipcHandlers', () => {
  let handlers = {};

  beforeEach(() => {
    jest.clearAllMocks();
    ipcMain.handle.mockImplementation((name, handler) => {
      handlers[name] = handler;
    });
    registerIpcHandlers();
  });

  test('should register all handlers', () => {
    expect(ipcMain.handle).toHaveBeenCalledWith('get-clusters', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('save-clusters', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('list-eks-clusters', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('update-kubeconfig', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('k8s-call', expect.any(Function));
  });

  test('get-clusters handler should call store.get', () => {
    // Let's use the prototype because instances are not working as expected
    const mockStore = Store.mock.instances[0];
    
    // Setup the mock on the prototype if we can't get the instance
    Store.prototype.get.mockReturnValue(['cluster']);
    
    const result = handlers['get-clusters']();
    expect(Store.prototype.get).toHaveBeenCalledWith('clusters', []);
    expect(result).toEqual(['cluster']);
  });

  test('list-eks-clusters handler should call awsService.listEksClusters', async () => {
    const mockArgs = { profile: 'p', region: 'r' };
    awsService.listEksClusters.mockResolvedValue(['c1']);
    
    const result = await handlers['list-eks-clusters']({}, mockArgs);
    expect(awsService.listEksClusters).toHaveBeenCalledWith('p', 'r');
    expect(result).toEqual(['c1']);
  });

  test('k8s-call handler should call k8sService.call', async () => {
    const mockArgs = { method: 'm', args: { a: 1 }, cluster: { id: 1 } };
    k8sService.call.mockResolvedValue({ body: 'ok' });
    
    const result = await handlers['k8s-call']({}, mockArgs);
    expect(k8sService.call).toHaveBeenCalledWith('m', { a: 1 }, { id: 1 });
    expect(result).toEqual({ body: 'ok' });
  });
});
