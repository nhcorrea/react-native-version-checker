import { z } from 'zod';

import {
  StoreResultSchema,
  type StoreResult,
} from '../schemas/store-result.schema';
import { buildPlayStoreUrl } from '../core/url-builder';
import { NetworkError, ParseError, ProviderError } from '../errors';
import type { StoreProvider, StoreProviderOptions } from './types';

const versionStringSchema = z
  .string()
  .regex(/^\d+(\.\d+)*$/, 'Invalid version format');

function extractFromCurrentVersionLayout(html: string): string | null {
  const match = html.match(/Current Version[\s\S]+?>([\d.-]+)<\/span>/);
  return match?.[1]?.trim() ?? null;
}

function extractFromNewLayout(html: string): string | null {
  const match = html.match(/\[\[\["([\d.]+?)"\]\]/);
  return match?.[1]?.trim() ?? null;
}

const MAX_HTML_SNIPPET_LENGTH = 500;

export class PlayStoreProvider implements StoreProvider {
  async getVersion(options: StoreProviderOptions): Promise<StoreResult> {
    const { packageName, fetchOptions } = options;

    if (!packageName) {
      throw new ProviderError(
        'packageName is required for Play Store provider'
      );
    }

    const storeUrl = buildPlayStoreUrl(packageName);
    const url = `${storeUrl}&hl=en&gl=US`;

    const mergedFetchOptions: RequestInit = {
      headers: { 'sec-fetch-site': 'same-origin' },
      ...(fetchOptions as RequestInit),
    };

    let response: Response;
    try {
      response = await fetch(url, mergedFetchOptions);
    } catch (error) {
      throw new NetworkError(
        `Failed to fetch Play Store data for "${packageName}"`,
        error
      );
    }

    if (!response.ok) {
      throw new NetworkError(
        `Play Store responded with status ${response.status} for "${packageName}"`
      );
    }

    let html: string;
    try {
      html = await response.text();
    } catch (error) {
      throw new ParseError('Failed to read Play Store response body', error);
    }

    const extractedVersion =
      extractFromCurrentVersionLayout(html) ?? extractFromNewLayout(html);

    if (extractedVersion === null) {
      const snippet = html.slice(0, MAX_HTML_SNIPPET_LENGTH);
      throw new ParseError(
        `Could not extract version from Play Store page for "${packageName}". HTML snippet: ${snippet}`
      );
    }

    const versionResult = versionStringSchema.safeParse(extractedVersion);
    if (!versionResult.success) {
      throw new ParseError(
        `Extracted version "${extractedVersion}" is not a valid version format`
      );
    }

    const storeResult = StoreResultSchema.safeParse({
      version: versionResult.data,
      storeUrl,
    });

    if (!storeResult.success) {
      throw new ParseError(
        `Invalid store result: ${storeResult.error.message}`
      );
    }

    return storeResult.data;
  }
}
