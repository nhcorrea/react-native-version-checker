import { z } from 'zod';

import type { StoreProvider } from '../providers/types';

const storeProviderSchema = z.custom<StoreProvider>(
  (val) =>
    typeof val === 'object' &&
    val !== null &&
    'getVersion' in val &&
    typeof (val as StoreProvider).getVersion === 'function',
  { message: 'Provider must implement StoreProvider interface' }
);

export const GetLatestVersionOptionsSchema = z
  .object({
    provider: z.union([z.string(), storeProviderSchema]).optional(),
    forceUpdate: z.boolean().optional().default(false),
    fetchOptions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type GetLatestVersionOptions = z.input<
  typeof GetLatestVersionOptionsSchema
>;

export const NeedUpdateOptionsSchema = z
  .object({
    currentVersion: z.string().optional(),
    latestVersion: z.string().optional(),
    depth: z.number().int().positive().optional(),
    provider: z.union([z.string(), storeProviderSchema]).optional(),
    forceUpdate: z.boolean().optional().default(false),
    fetchOptions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type NeedUpdateOptions = z.input<typeof NeedUpdateOptionsSchema>;

export const GetAppStoreUrlOptionsSchema = z
  .object({
    appID: z.string().min(1, 'appID is required'),
    country: z.string().optional(),
  })
  .strict();

export type GetAppStoreUrlOptions = z.input<typeof GetAppStoreUrlOptionsSchema>;

export const GetPlayStoreUrlOptionsSchema = z
  .object({
    packageName: z.string().optional(),
  })
  .strict();

export type GetPlayStoreUrlOptions = z.input<
  typeof GetPlayStoreUrlOptionsSchema
>;

export const GetStoreUrlOptionsSchema = z.union([
  GetAppStoreUrlOptionsSchema,
  GetPlayStoreUrlOptionsSchema,
]);

export type GetStoreUrlOptions = z.input<typeof GetStoreUrlOptionsSchema>;
