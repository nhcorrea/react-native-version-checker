import { buildAppStoreUrl, buildPlayStoreUrl } from '../core/url-builder';

describe('buildAppStoreUrl', () => {
  it('should build URL without country code', () => {
    expect(buildAppStoreUrl('123456789')).toBe(
      'itms-apps://apps.apple.com/app/id123456789'
    );
  });

  it('should build URL with country code', () => {
    expect(buildAppStoreUrl('123456789', 'BR')).toBe(
      'itms-apps://apps.apple.com/BR/app/id123456789'
    );
  });

  it('should throw for invalid appID', () => {
    expect(() => buildAppStoreUrl('12 34')).toThrow('Invalid appID');
    expect(() => buildAppStoreUrl('id=123&foo')).toThrow('Invalid appID');
  });
});

describe('buildPlayStoreUrl', () => {
  it('should build a valid Play Store URL', () => {
    expect(buildPlayStoreUrl('com.example.app')).toBe(
      'https://play.google.com/store/apps/details?id=com.example.app'
    );
  });

  it('should throw for invalid packageName', () => {
    expect(() => buildPlayStoreUrl('com example app')).toThrow(
      'Invalid packageName'
    );
    expect(() => buildPlayStoreUrl('pkg&inject=1')).toThrow(
      'Invalid packageName'
    );
  });
});
