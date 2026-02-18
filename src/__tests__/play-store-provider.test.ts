import * as fs from 'fs';
import * as path from 'path';

import { PlayStoreProvider } from '../providers/play-store.provider';
import { ProviderError, NetworkError, ParseError } from '../errors';

const provider = new PlayStoreProvider();

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf-8');
}

function mockFetchHtml(html: string, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    text: () => Promise.resolve(html),
  } as Response);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PlayStoreProvider', () => {
  it('should extract version from old layout HTML', async () => {
    const html = loadFixture('play-store-old-layout.html');
    mockFetchHtml(html);

    const result = await provider.getVersion({
      packageName: 'com.example.app',
    });

    expect(result.version).toBe('3.2.1');
    expect(result.storeUrl).toContain('play.google.com');
    expect(result.storeUrl).toContain('com.example.app');
  });

  it('should extract version from new layout HTML', async () => {
    const html = loadFixture('play-store-new-layout.html');
    mockFetchHtml(html);

    const result = await provider.getVersion({
      packageName: 'com.example.app',
    });

    expect(result.version).toBe('4.1.0');
  });

  it('should throw ParseError for unknown layout', async () => {
    const html = loadFixture('play-store-unknown-layout.html');
    mockFetchHtml(html);

    await expect(
      provider.getVersion({ packageName: 'com.example.app' })
    ).rejects.toThrow(ParseError);
  });

  it('should throw ProviderError when packageName is missing', async () => {
    await expect(provider.getVersion({})).rejects.toThrow(ProviderError);
  });

  it('should throw NetworkError when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    await expect(
      provider.getVersion({ packageName: 'com.example.app' })
    ).rejects.toThrow(NetworkError);
  });

  it('should throw NetworkError on non-ok response', async () => {
    mockFetchHtml('', false, 404);

    await expect(
      provider.getVersion({ packageName: 'com.example.app' })
    ).rejects.toThrow(NetworkError);
  });

  it('should include sec-fetch-site header', async () => {
    const html = loadFixture('play-store-new-layout.html');
    mockFetchHtml(html);

    await provider.getVersion({ packageName: 'com.example.app' });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]!;
    const options = fetchCall[1] as RequestInit;
    expect((options.headers as Record<string, string>)['sec-fetch-site']).toBe(
      'same-origin'
    );
  });
});
