import { Platform } from 'react-native';

import { NeedUpdateOptionsSchema } from '../schemas/options.schema';
import type { NeedUpdateOptions } from '../schemas/options.schema';
import type { NeedUpdateResult } from '../schemas/need-update-result.schema';
import { compareVersions } from '../core/version-comparator';
import { resolveProvider } from '../providers/provider-registry';
import NativeVersionChecker from '../NativeVersionChecker';
import { ValidationError } from '../errors';

export async function needUpdate(
  options?: NeedUpdateOptions
): Promise<NeedUpdateResult> {
  const parsed = NeedUpdateOptionsSchema.safeParse(options ?? {});

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid options for needUpdate: ${parsed.error.message}`
    );
  }

  const {
    currentVersion: inputCurrentVersion,
    latestVersion: inputLatestVersion,
    depth,
    provider: providerInput,
    fetchOptions,
  } = parsed.data;

  const constants = NativeVersionChecker.getConstants();
  const currentVersion = inputCurrentVersion ?? constants.currentVersion;

  let latestVersion: string;
  let storeUrl = '';

  if (inputLatestVersion) {
    latestVersion = inputLatestVersion;
  } else {
    const defaultProviderName = Platform.select({
      ios: 'appStore',
      android: 'playStore',
    });

    const providerRef = providerInput ?? defaultProviderName;

    if (!providerRef) {
      throw new ValidationError(
        'Unable to determine default provider for this platform'
      );
    }

    const provider = resolveProvider(providerRef);
    const result = await provider.getVersion({
      packageName: constants.packageName,
      country: constants.country,
      fetchOptions,
    });

    latestVersion = result.version;
    storeUrl = result.storeUrl;
  }

  const comparison = compareVersions(currentVersion, latestVersion, depth);

  return {
    isNeeded: comparison === 'greater',
    currentVersion,
    latestVersion,
    storeUrl,
  };
}
