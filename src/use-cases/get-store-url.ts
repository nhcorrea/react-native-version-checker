import { Platform } from 'react-native';

import {
  GetAppStoreUrlOptionsSchema,
  GetPlayStoreUrlOptionsSchema,
} from '../schemas/options.schema';
import type {
  GetAppStoreUrlOptions,
  GetPlayStoreUrlOptions,
} from '../schemas/options.schema';
import { buildAppStoreUrl, buildPlayStoreUrl } from '../core/url-builder';
import NativeVersionChecker from '../NativeVersionChecker';
import { ValidationError } from '../errors';

export async function getAppStoreUrl(
  options: GetAppStoreUrlOptions
): Promise<string> {
  const parsed = GetAppStoreUrlOptionsSchema.safeParse(options);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid options for getAppStoreUrl: ${parsed.error.message}`
    );
  }

  const { appID } = parsed.data;
  let { country } = parsed.data;

  if (!country) {
    const constants = NativeVersionChecker.getConstants();
    country = constants.country;
  }

  return buildAppStoreUrl(appID, country);
}

export async function getPlayStoreUrl(
  options?: GetPlayStoreUrlOptions
): Promise<string> {
  const parsed = GetPlayStoreUrlOptionsSchema.safeParse(options ?? {});

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid options for getPlayStoreUrl: ${parsed.error.message}`
    );
  }

  let { packageName } = parsed.data;

  if (!packageName) {
    const constants = NativeVersionChecker.getConstants();
    packageName = constants.packageName;
  }

  return buildPlayStoreUrl(packageName);
}

export async function getStoreUrl(
  options: GetAppStoreUrlOptions | GetPlayStoreUrlOptions
): Promise<string> {
  const resolver = Platform.select({
    ios: () => getAppStoreUrl(options as GetAppStoreUrlOptions),
    android: () => getPlayStoreUrl(options as GetPlayStoreUrlOptions),
  });

  if (!resolver) {
    throw new ValidationError(
      'Unable to determine store URL for this platform'
    );
  }

  return resolver();
}
