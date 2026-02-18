const VERSION_PREFIX_REGEX = /^[vV]/;
const VALID_VERSION_REGEX = /^\d+(\.\d+)*$/;
const DELIMITER = '.';

export type VersionComparisonResult =
  | 'greater'
  | 'equal'
  | 'lesser'
  | 'invalid';

export function normalizeVersion(raw: string, depth?: number): string {
  const trimmed = raw.trim().replace(VERSION_PREFIX_REGEX, '');

  if (!VALID_VERSION_REGEX.test(trimmed)) {
    return '';
  }

  const segments = trimmed.split(DELIMITER).map(Number);
  const sliced =
    depth !== undefined && depth > 0 ? segments.slice(0, depth) : segments;

  const padded = [...sliced, 0, 0, 0].slice(0, Math.max(sliced.length, 3));

  return padded.join(DELIMITER);
}

export function compareVersions(
  current: string,
  latest: string,
  depth?: number
): VersionComparisonResult {
  const normalizedCurrent = normalizeVersion(current, depth);
  const normalizedLatest = normalizeVersion(latest, depth);

  if (normalizedCurrent === '' || normalizedLatest === '') {
    return 'invalid';
  }

  const currentSegments = normalizedCurrent.split(DELIMITER).map(Number);
  const latestSegments = normalizedLatest.split(DELIMITER).map(Number);

  const maxLength = Math.max(currentSegments.length, latestSegments.length);

  for (let i = 0; i < maxLength; i++) {
    const c = currentSegments[i] ?? 0;
    const l = latestSegments[i] ?? 0;

    if (l > c) {
      return 'greater';
    }
    if (l < c) {
      return 'lesser';
    }
  }

  return 'equal';
}
