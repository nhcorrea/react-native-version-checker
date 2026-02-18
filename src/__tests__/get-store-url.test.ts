import { getAppStoreUrl, getPlayStoreUrl } from '../use-cases/get-store-url';
import { ValidationError } from '../errors';

jest.mock('../NativeVersionChecker', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      country: 'BR',
      packageName: 'com.example.app',
      currentVersion: '1.0.0',
      currentBuildNumber: '1',
    }),
  },
}));

describe('getAppStoreUrl', () => {
  it('should build App Store URL with appID and country', async () => {
    const url = await getAppStoreUrl({ appID: '123456789', country: 'US' });
    expect(url).toBe('itms-apps://apps.apple.com/US/app/id123456789');
  });

  it('should use native country when not provided', async () => {
    const url = await getAppStoreUrl({ appID: '123456789' });
    expect(url).toBe('itms-apps://apps.apple.com/BR/app/id123456789');
  });

  it('should throw ValidationError when appID is missing', async () => {
    await expect(getAppStoreUrl({} as never)).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for empty appID', async () => {
    await expect(getAppStoreUrl({ appID: '' })).rejects.toThrow(
      ValidationError
    );
  });
});

describe('getPlayStoreUrl', () => {
  it('should build Play Store URL with provided packageName', async () => {
    const url = await getPlayStoreUrl({ packageName: 'com.other.app' });
    expect(url).toBe(
      'https://play.google.com/store/apps/details?id=com.other.app'
    );
  });

  it('should use native packageName when not provided', async () => {
    const url = await getPlayStoreUrl();
    expect(url).toBe(
      'https://play.google.com/store/apps/details?id=com.example.app'
    );
  });
});
