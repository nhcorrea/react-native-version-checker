import { AppStoreProvider } from '../providers/app-store.provider';
import { ProviderError, NetworkError, ParseError } from '../errors';

import validResponse from './fixtures/itunes-response-valid.json';
import emptyResponse from './fixtures/itunes-response-empty.json';
import malformedResponse from './fixtures/itunes-response-malformed.json';

const provider = new AppStoreProvider();

function mockFetch(data: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AppStoreProvider', () => {
  it('should return version and storeUrl from a valid response', async () => {
    mockFetch(validResponse);

    const result = await provider.getVersion({
      packageName: 'com.example.app',
      country: 'US',
    });

    expect(result.version).toBe('2.5.1');
    expect(result.storeUrl).toContain('itms-apps://');
    expect(result.storeUrl).toContain('123456789');
  });

  it('should throw ProviderError when packageName is missing', async () => {
    await expect(provider.getVersion({})).rejects.toThrow(ProviderError);
  });

  it('should throw ProviderError when resultCount is 0', async () => {
    mockFetch(emptyResponse);

    await expect(
      provider.getVersion({ packageName: 'com.example.app' })
    ).rejects.toThrow(ProviderError);
  });

  it('should throw ParseError for malformed response', async () => {
    mockFetch(malformedResponse);

    await expect(
      provider.getVersion({ packageName: 'com.example.app' })
    ).rejects.toThrow(ParseError);
  });

  it('should throw NetworkError when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    await expect(
      provider.getVersion({ packageName: 'com.example.app' })
    ).rejects.toThrow(NetworkError);
  });

  it('should throw NetworkError on non-ok response', async () => {
    mockFetch({}, false, 500);

    await expect(
      provider.getVersion({ packageName: 'com.example.app' })
    ).rejects.toThrow(NetworkError);
  });

  it('should work without country code', async () => {
    mockFetch(validResponse);

    const result = await provider.getVersion({
      packageName: 'com.example.app',
    });

    expect(result.version).toBe('2.5.1');
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]![0] as string;
    expect(fetchCall).toContain('itunes.apple.com/lookup');
  });
});
