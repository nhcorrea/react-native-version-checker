import { z } from 'zod';

import {
  StoreResultSchema,
  type StoreResult,
} from '../schemas/store-result.schema';
import { buildAppStoreUrl } from '../core/url-builder';
import { NetworkError, ParseError, ProviderError } from '../errors';
import type { StoreProvider, StoreProviderOptions } from './types';

const iTunesResponseSchema = z.object({
  resultCount: z.number().int().nonnegative(),
  results: z.array(
    z.object({
      version: z.string(),
      trackId: z.number(),
    })
  ),
});

export class AppStoreProvider implements StoreProvider {
  async getVersion(options: StoreProviderOptions): Promise<StoreResult> {
    const { packageName, country, fetchOptions } = options;

    if (!packageName) {
      throw new ProviderError('packageName is required for App Store provider');
    }

    const countryPath = country ? `${country}/` : '';
    const cacheBuster = Date.now();
    const url = `https://itunes.apple.com/${countryPath}lookup?bundleId=${encodeURIComponent(
      packageName
    )}&date=${cacheBuster}`;

    let response: Response;
    try {
      response = await fetch(url, fetchOptions as RequestInit);
    } catch (error) {
      throw new NetworkError(
        `Failed to fetch App Store data for "${packageName}"`,
        error
      );
    }

    if (!response.ok) {
      throw new NetworkError(
        `App Store responded with status ${response.status} for "${packageName}"`
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (error) {
      throw new ParseError('Failed to parse App Store JSON response', error);
    }

    const parsed = iTunesResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new ParseError(
        `Invalid App Store response structure: ${parsed.error.message}`
      );
    }

    const { resultCount, results } = parsed.data;

    if (resultCount === 0 || results.length === 0) {
      throw new ProviderError(
        `No App Store results found for bundle ID "${packageName}"`
      );
    }

    const firstResult = results[0]!;
    const storeUrl = buildAppStoreUrl(String(firstResult.trackId), country);

    const storeResult = StoreResultSchema.safeParse({
      version: firstResult.version,
      storeUrl,
    });

    if (!storeResult.success) {
      throw new ParseError(
        `Invalid version format from App Store: "${firstResult.version}"`
      );
    }

    return storeResult.data;
  }
}
