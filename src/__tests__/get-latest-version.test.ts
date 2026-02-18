import { getLatestVersion } from '../use-cases/get-latest-version';
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

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getLatestVersion', () => {
  it('should return version from default provider', async () => {
    jest
      .spyOn(providerRegistry, 'resolveProvider')
      .mockReturnValue(mockProvider);

    const version = await getLatestVersion();

    expect(version).toBe('2.0.0');
  });

  it('should accept a custom StoreProvider object', async () => {
    const customProvider: StoreProvider = {
      getVersion: jest.fn().mockResolvedValue({
        version: '3.0.0',
        storeUrl: 'https://example.com',
      }),
    };

    jest
      .spyOn(providerRegistry, 'resolveProvider')
      .mockReturnValue(customProvider);

    const version = await getLatestVersion({ provider: customProvider });

    expect(version).toBe('3.0.0');
  });

  it('should accept a provider name string', async () => {
    jest
      .spyOn(providerRegistry, 'resolveProvider')
      .mockReturnValue(mockProvider);

    const version = await getLatestVersion({ provider: 'playStore' });

    expect(version).toBe('2.0.0');
    expect(providerRegistry.resolveProvider).toHaveBeenCalledWith('playStore');
  });

  it('should throw ValidationError for invalid options', async () => {
    await expect(
      getLatestVersion({ unknownField: true } as never)
    ).rejects.toThrow(ValidationError);
  });
});
