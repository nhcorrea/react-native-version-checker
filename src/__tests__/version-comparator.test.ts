import { normalizeVersion, compareVersions } from '../core/version-comparator';

describe('normalizeVersion', () => {
  it('should trim whitespace', () => {
    expect(normalizeVersion(' 1.0.0 ')).toBe('1.0.0');
  });

  it('should strip v prefix', () => {
    expect(normalizeVersion('v1.2.3')).toBe('1.2.3');
    expect(normalizeVersion('V1.2.3')).toBe('1.2.3');
  });

  it('should pad short versions with zeros', () => {
    expect(normalizeVersion('1')).toBe('1.0.0');
    expect(normalizeVersion('1.2')).toBe('1.2.0');
  });

  it('should keep versions with 3+ segments as-is', () => {
    expect(normalizeVersion('1.2.3')).toBe('1.2.3');
    expect(normalizeVersion('1.2.3.4')).toBe('1.2.3.4');
  });

  it('should apply depth to slice segments', () => {
    expect(normalizeVersion('1.2.3', 2)).toBe('1.2.0');
    expect(normalizeVersion('1.2.3', 1)).toBe('1.0.0');
  });

  it('should return empty string for invalid versions', () => {
    expect(normalizeVersion('abc')).toBe('');
    expect(normalizeVersion('')).toBe('');
    expect(normalizeVersion('1.2.x')).toBe('');
  });
});

describe('compareVersions', () => {
  it('should detect when latest is greater', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBe('greater');
    expect(compareVersions('1.0.0', '2.0.0')).toBe('greater');
    expect(compareVersions('1.2', '1.3.0')).toBe('greater');
  });

  it('should detect equal versions', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe('equal');
    expect(compareVersions('2.1.0', '2.1.0')).toBe('equal');
  });

  it('should detect when current is greater (no update needed)', () => {
    expect(compareVersions('2.0.0', '1.9.9')).toBe('lesser');
    expect(compareVersions('1.1.0', '1.0.9')).toBe('lesser');
  });

  it('should handle v prefix', () => {
    expect(compareVersions('v1.0.0', '1.0.1')).toBe('greater');
  });

  it('should handle whitespace', () => {
    expect(compareVersions(' 1.0.0 ', '1.0.1')).toBe('greater');
  });

  it('should respect depth parameter', () => {
    expect(compareVersions('1.0.0', '1.0.1', 2)).toBe('equal');
    expect(compareVersions('1.0.0', '1.1.0', 1)).toBe('equal');
    expect(compareVersions('1.0.0', '1.1.0', 2)).toBe('greater');
  });

  it('should return invalid for non-version strings', () => {
    expect(compareVersions('abc', '1.0.0')).toBe('invalid');
    expect(compareVersions('1.0.0', 'xyz')).toBe('invalid');
    expect(compareVersions('', '')).toBe('invalid');
  });

  it('should handle single-segment versions', () => {
    expect(compareVersions('1', '2')).toBe('greater');
    expect(compareVersions('2', '1')).toBe('lesser');
    expect(compareVersions('1', '1')).toBe('equal');
  });
});
