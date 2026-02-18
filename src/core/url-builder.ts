const SAFE_ID_REGEX = /^[a-zA-Z0-9._-]+$/;

function assertSafeId(value: string, label: string): void {
  if (!SAFE_ID_REGEX.test(value)) {
    throw new Error(
      `Invalid ${label}: "${value}". Only alphanumeric characters, dots, hyphens and underscores are allowed.`
    );
  }
}

export function buildAppStoreUrl(appID: string, countryCode?: string): string {
  assertSafeId(appID, 'appID');

  const countryPrefix = countryCode ? `${countryCode}/` : '';
  return `itms-apps://apps.apple.com/${countryPrefix}app/id${appID}`;
}

export function buildPlayStoreUrl(packageName: string): string {
  assertSafeId(packageName, 'packageName');

  return `https://play.google.com/store/apps/details?id=${packageName}`;
}
