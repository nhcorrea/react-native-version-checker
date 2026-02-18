import { needUpdate } from '../use-cases/need-update';
import * as providerRegistry from '../providers/provider-registry';
import { ValidationError } from '../errors';
import type { StoreProvider } from '../providers/types';

jest.mock('../NativeVersionChecker', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      country: 'US',
      packageName: 'com.example.app',
      currentVersion: '1.0.0',
      currentBuildNumber: '1',
    }),
  },
}));

const mockProvider: StoreProvider = {
  getVersion: jest.fn().mockResolvedValue({
    version: '2.0.0',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.example.app',
  }),
};

beforeEach(() => {
  (mockProvider.getVersion as jest.Mock).mockClear();
  jest.spyOn(providerRegistry, 'resolveProvider').mockReturnValue(mockProvider);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('needUpdate', () => {
  it('should detect update needed when latest > current', async () => {
    const result = await needUpdate();

    expect(result.isNeeded).toBe(true);
    expect(result.currentVersion).toBe('1.0.0');
    expect(result.latestVersion).toBe('2.0.0');
    expect(result.storeUrl).toContain('play.google.com');
  });

  it('should detect no update needed when versions are equal', async () => {
    const result = await needUpdate({
      currentVersion: '2.0.0',
      latestVersion: '2.0.0',
    });

    expect(result.isNeeded).toBe(false);
  });

  it('should respect depth parameter', async () => {
    const result = await needUpdate({
      currentVersion: '1.0.0',
      latestVersion: '1.0.5',
      depth: 2,
    });

    expect(result.isNeeded).toBe(false);
  });

  it('should use provided currentVersion instead of native', async () => {
    const result = await needUpdate({
      currentVersion: '3.0.0',
    });

    expect(result.currentVersion).toBe('3.0.0');
    expect(result.isNeeded).toBe(false);
  });

  it('should skip provider call when latestVersion is provided', async () => {
    const result = await needUpdate({
      latestVersion: '1.5.0',
    });

    expect(result.latestVersion).toBe('1.5.0');
    expect(result.isNeeded).toBe(true);
    expect(mockProvider.getVersion).not.toHaveBeenCalled();
  });

  it('should throw ValidationError for invalid options', async () => {
    await expect(needUpdate({ depth: -1 })).rejects.toThrow(ValidationError);
  });
});
