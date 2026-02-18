import NativeVersionChecker from './NativeVersionChecker';
import { VersionInfoSchema } from './schemas/version-info.schema';
import type { VersionInfo } from './schemas/version-info.schema';
import { ValidationError } from './errors';

let cachedConstants: VersionInfo | null = null;

function getValidatedConstants(): VersionInfo {
  if (cachedConstants) {
    return cachedConstants;
  }

  const raw = NativeVersionChecker.getConstants();
  const parsed = VersionInfoSchema.safeParse(raw);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid native constants: ${parsed.error.message}`
    );
  }

  cachedConstants = parsed.data;
  return cachedConstants;
}

export function getCountry(): string {
  return getValidatedConstants().country;
}

export function getPackageName(): string {
  return getValidatedConstants().packageName;
}

export function getCurrentVersion(): string {
  return getValidatedConstants().currentVersion;
}

export function getCurrentBuildNumber(): string {
  return getValidatedConstants().currentBuildNumber;
}

// Use cases
export { getLatestVersion } from './use-cases/get-latest-version';
export { needUpdate } from './use-cases/need-update';
export {
  getStoreUrl,
  getAppStoreUrl,
  getPlayStoreUrl,
} from './use-cases/get-store-url';

// Types
export type { NeedUpdateResult } from './schemas/need-update-result.schema';
export type { StoreResult } from './schemas/store-result.schema';
export type { StoreProvider } from './providers/types';
export type { VersionInfo } from './schemas/version-info.schema';
export type {
  GetLatestVersionOptions,
  NeedUpdateOptions,
  GetAppStoreUrlOptions,
  GetPlayStoreUrlOptions,
  GetStoreUrlOptions,
} from './schemas/options.schema';

// Errors
export {
  VersionCheckerError,
  ProviderError,
  ParseError,
  ValidationError,
  NetworkError,
} from './errors';
