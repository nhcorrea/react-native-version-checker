import {
  getCountry,
  getPackageName,
  getCurrentVersion,
  getCurrentBuildNumber,
} from '../index';

jest.mock('../NativeVersionChecker', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      country: 'BR',
      packageName: 'com.example.app',
      currentVersion: '1.2.3',
      currentBuildNumber: '42',
    }),
  },
}));

describe('index - native metadata accessors', () => {
  it('should return country from native constants', () => {
    expect(getCountry()).toBe('BR');
  });

  it('should return packageName from native constants', () => {
    expect(getPackageName()).toBe('com.example.app');
  });

  it('should return currentVersion from native constants', () => {
    expect(getCurrentVersion()).toBe('1.2.3');
  });

  it('should return currentBuildNumber as string', () => {
    expect(getCurrentBuildNumber()).toBe('42');
    expect(typeof getCurrentBuildNumber()).toBe('string');
  });
});
