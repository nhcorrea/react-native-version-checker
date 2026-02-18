import { VersionInfoSchema } from '../schemas/version-info.schema';
import { StoreResultSchema } from '../schemas/store-result.schema';
import { NeedUpdateResultSchema } from '../schemas/need-update-result.schema';
import {
  GetAppStoreUrlOptionsSchema,
  GetPlayStoreUrlOptionsSchema,
} from '../schemas/options.schema';

describe('VersionInfoSchema', () => {
  it('should accept valid version info', () => {
    const result = VersionInfoSchema.safeParse({
      country: 'US',
      packageName: 'com.example.app',
      currentVersion: '1.0.0',
      currentBuildNumber: '42',
    });
    expect(result.success).toBe(true);
  });

  it('should coerce numeric buildNumber to string', () => {
    const result = VersionInfoSchema.parse({
      country: 'US',
      packageName: 'com.example.app',
      currentVersion: '1.0.0',
      currentBuildNumber: 42,
    });
    expect(result.currentBuildNumber).toBe('42');
  });

  it('should reject empty country', () => {
    const result = VersionInfoSchema.safeParse({
      country: '',
      packageName: 'com.example.app',
      currentVersion: '1.0.0',
      currentBuildNumber: '1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    const result = VersionInfoSchema.safeParse({
      country: 'US',
    });
    expect(result.success).toBe(false);
  });
});

describe('StoreResultSchema', () => {
  it('should accept valid store result', () => {
    const result = StoreResultSchema.safeParse({
      version: '1.2.3',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.example',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid version format', () => {
    const result = StoreResultSchema.safeParse({
      version: 'abc',
      storeUrl: 'https://example.com',
    });
    expect(result.success).toBe(false);
  });

  it('should accept single-segment version', () => {
    const result = StoreResultSchema.safeParse({
      version: '5',
      storeUrl: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject version with non-numeric segments', () => {
    const result = StoreResultSchema.safeParse({
      version: '1.2.beta',
      storeUrl: 'https://example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('NeedUpdateResultSchema', () => {
  it('should accept valid need update result', () => {
    const result = NeedUpdateResultSchema.safeParse({
      isNeeded: true,
      currentVersion: '1.0.0',
      latestVersion: '2.0.0',
      storeUrl: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing isNeeded', () => {
    const result = NeedUpdateResultSchema.safeParse({
      currentVersion: '1.0.0',
      latestVersion: '2.0.0',
      storeUrl: 'https://example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('GetAppStoreUrlOptionsSchema', () => {
  it('should accept valid options', () => {
    const result = GetAppStoreUrlOptionsSchema.safeParse({
      appID: '123456789',
      country: 'US',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty appID', () => {
    const result = GetAppStoreUrlOptionsSchema.safeParse({
      appID: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject unknown fields in strict mode', () => {
    const result = GetAppStoreUrlOptionsSchema.safeParse({
      appID: '123',
      unknown: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('GetPlayStoreUrlOptionsSchema', () => {
  it('should accept valid options', () => {
    const result = GetPlayStoreUrlOptionsSchema.safeParse({
      packageName: 'com.example.app',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = GetPlayStoreUrlOptionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
