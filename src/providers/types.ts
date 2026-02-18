import type { StoreResult } from '../schemas/store-result.schema';

export interface StoreProviderOptions {
  packageName?: string;
  country?: string;
  fetchOptions?: Record<string, unknown>;
}

export interface StoreProvider {
  getVersion(options: StoreProviderOptions): Promise<StoreResult>;
}
