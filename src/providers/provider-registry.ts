import { ValidationError } from '../errors';
import { AppStoreProvider } from './app-store.provider';
import { PlayStoreProvider } from './play-store.provider';
import type { StoreProvider } from './types';

const builtInProviders: Record<string, StoreProvider> = {
  appStore: new AppStoreProvider(),
  playStore: new PlayStoreProvider(),
};

export function resolveProvider(
  provider: string | StoreProvider
): StoreProvider {
  if (typeof provider === 'string') {
    const resolved = builtInProviders[provider];
    if (!resolved) {
      throw new ValidationError(
        `Unknown provider "${provider}". Available providers: ${Object.keys(
          builtInProviders
        ).join(', ')}`
      );
    }
    return resolved;
  }

  if (
    typeof provider === 'object' &&
    provider !== null &&
    'getVersion' in provider &&
    typeof provider.getVersion === 'function'
  ) {
    return provider;
  }

  throw new ValidationError(
    'Provider must be a provider name string or an object implementing StoreProvider interface'
  );
}
