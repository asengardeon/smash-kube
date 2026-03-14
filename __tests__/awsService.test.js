const awsService = require('../main/services/awsService');
const { exec } = require('child_process');

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('AwsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('listEksClusters should return clusters on success', async () => {
    const mockClusters = { clusters: ['cluster-1', 'cluster-2'] };
    exec.mockImplementation((cmd, callback) => {
      callback(null, { stdout: JSON.stringify(mockClusters), stderr: '' });
    });

    const clusters = await awsService.listEksClusters('my-profile', 'us-east-1');
    expect(clusters).toEqual(['cluster-1', 'cluster-2']);
    expect(exec).toHaveBeenCalled();
  });

  test('listEksClusters should reject on error', async () => {
    exec.mockImplementation((cmd, callback) => {
      const err = new Error('AWS error');
      err.stderr = 'AccessDenied';
      callback(err, { stdout: '', stderr: 'AccessDenied' });
    });

    // It throws an Error where message is error.stderr || "Falha..."
    await expect(awsService.listEksClusters('my-profile')).rejects.toThrow('AccessDenied');
  });
});
