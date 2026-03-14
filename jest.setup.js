import '@testing-library/jest-dom';

global.window.electron = {
  getClusters: jest.fn(),
  saveClusters: jest.fn(),
  updateKubeconfig: jest.fn(),
  k8sCall: jest.fn(),
  listEksClusters: jest.fn(),
};

global.confirm = jest.fn();
global.alert = jest.fn();
