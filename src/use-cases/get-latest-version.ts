import { Platform } from 'react-native';

import { GetLatestVersionOptionsSchema } from '../schemas/options.schema';
import type { GetLatestVersionOptions } from '../schemas/options.schema';
import { resolveProvider } from '../providers/provider-registry';
import NativeVersionChecker from '../NativeVersionChecker';
import { ValidationError } from '../errors';

export async function getLatestVersion(
  options?: GetLatestVersionOptions
): Promise<string> {
  const parsed = GetLatestVersionOptionsSchema.safeParse(options ?? {});

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid options for getLatestVersion: ${parsed.error.message}`
    );
  }

  const { provider: providerInput, fetchOptions } = parsed.data;

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
  const constants = NativeVersionChecker.getConstants();

  const result = await provider.getVersion({
    packageName: constants.packageName,
    country: constants.country,
    fetchOptions,
  });

  return result.version;
}
