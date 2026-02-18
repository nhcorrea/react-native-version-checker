# react-native-version-checker

Type-safe app version checking and update prompts for React Native (iOS & Android).

Built with TypeScript strict mode and runtime validation via [Zod](https://zod.dev). Supports React Native New Architecture (TurboModule).

## Features

- **Fully typed API** -- every function, option, and return value is strictly typed
- **Runtime validation** -- all external data (native bridge, store APIs) validated with Zod schemas
- **Typed error hierarchy** -- catch specific errors (`NetworkError`, `ParseError`, `ProviderError`) instead of generic `Error`
- **New Architecture** -- TurboModule support (JSI, no JSON bridge)
- **Zero global state** -- stateless functions, no singletons
- **Custom providers** -- implement `StoreProvider` to fetch versions from any source
- **Minimal dependencies** -- only `zod` as production dependency

## Requirements

- React Native >= 0.73
- iOS >= 13.4
- Android `minSdk` >= 21

## Installation

```sh
npm install react-native-version-checker
# or
yarn add react-native-version-checker
```

For iOS, install pods:

```sh
cd ios && pod install
```

## Quick Start

```ts
import { needUpdate } from 'react-native-version-checker';

const result = await needUpdate();

if (result.isNeeded) {
  // Prompt the user to update
  console.log(`New version available: ${result.latestVersion}`);
  console.log(`Update at: ${result.storeUrl}`);
}
```

## API Reference

### App Metadata

Functions that read metadata from the native platform. These are synchronous and return cached, Zod-validated values.

#### `getCountry()`

Returns the device's country code (e.g. `"US"`, `"BR"`).

```ts
import { getCountry } from 'react-native-version-checker';

const country: string = getCountry();
```

#### `getPackageName()`

Returns the app's package name / bundle identifier (e.g. `"com.myapp"`).

```ts
import { getPackageName } from 'react-native-version-checker';

const pkg: string = getPackageName();
```

#### `getCurrentVersion()`

Returns the app's current version string (e.g. `"1.2.3"`).

```ts
import { getCurrentVersion } from 'react-native-version-checker';

const version: string = getCurrentVersion();
```

#### `getCurrentBuildNumber()`

Returns the app's current build number as a **string** (consistent across iOS and Android).

```ts
import { getCurrentBuildNumber } from 'react-native-version-checker';

const build: string = getCurrentBuildNumber();
```

---

### Version Checking

#### `getLatestVersion(options?)`

Fetches the latest published version from the App Store (iOS) or Play Store (Android).

```ts
import { getLatestVersion } from 'react-native-version-checker';

const latestVersion: string = await getLatestVersion();
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `provider` | `string \| StoreProvider` | Auto (per platform) | Provider to use: `'appStore'`, `'playStore'`, or a custom `StoreProvider` object |
| `fetchOptions` | `Record<string, unknown>` | `undefined` | Custom options passed to `fetch()` |

**Examples:**

```ts
// Force a specific provider
const version = await getLatestVersion({ provider: 'appStore' });

// With custom fetch options (e.g. timeout, headers)
const version = await getLatestVersion({
  fetchOptions: {
    signal: AbortSignal.timeout(5000),
  },
});
```

---

#### `needUpdate(options?)`

Determines whether the app needs an update by comparing the current version against the latest store version. Returns a fully typed `NeedUpdateResult`.

```ts
import { needUpdate } from 'react-native-version-checker';
import type { NeedUpdateResult } from 'react-native-version-checker';

const result: NeedUpdateResult = await needUpdate();
// {
//   isNeeded: true,
//   currentVersion: "1.0.0",
//   latestVersion: "1.2.0",
//   storeUrl: "itms-apps://apps.apple.com/US/app/id123456789"
// }
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `currentVersion` | `string` | Native version | Override the current version (useful for testing) |
| `latestVersion` | `string` | Fetched from store | Skip the store request by providing the latest version directly |
| `depth` | `number` | `Infinity` | Number of version segments to compare |
| `provider` | `string \| StoreProvider` | Auto (per platform) | Provider to use |
| `fetchOptions` | `Record<string, unknown>` | `undefined` | Custom options passed to `fetch()` |

**Examples:**

```ts
// Only notify on major or minor updates (ignore patch)
const result = await needUpdate({ depth: 2 });
// "1.0.0" vs "1.0.5" → isNeeded: false (patch ignored)
// "1.0.0" vs "1.1.0" → isNeeded: true  (minor changed)

// Only notify on major updates
const result = await needUpdate({ depth: 1 });
// "1.0.0" vs "1.9.0" → isNeeded: false (minor ignored)
// "1.0.0" vs "2.0.0" → isNeeded: true  (major changed)

// Compare manually without store request
const result = await needUpdate({
  currentVersion: '1.0.0',
  latestVersion: '2.0.0',
});

// Use a version from your own backend
const backendVersion = await fetchVersionFromMyAPI();
const result = await needUpdate({ latestVersion: backendVersion });
```

---

### Store URLs

#### `getStoreUrl(options)`

Returns the store URL for the current platform (App Store on iOS, Play Store on Android).

```ts
import { getStoreUrl } from 'react-native-version-checker';

// On iOS - requires appID
const url = await getStoreUrl({ appID: '123456789' });

// On Android - uses native packageName if not provided
const url = await getStoreUrl({});
```

#### `getAppStoreUrl(options)`

Returns an App Store URL (`itms-apps://`) that opens directly in the App Store app.

```ts
import { getAppStoreUrl } from 'react-native-version-checker';

const url = await getAppStoreUrl({ appID: '123456789' });
// "itms-apps://apps.apple.com/US/app/id123456789"

// With explicit country
const url = await getAppStoreUrl({ appID: '123456789', country: 'BR' });
// "itms-apps://apps.apple.com/BR/app/id123456789"
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `appID` | `string` | Yes | The App Store app ID |
| `country` | `string` | No | Country code (defaults to device locale) |

#### `getPlayStoreUrl(options?)`

Returns a Google Play Store URL.

```ts
import { getPlayStoreUrl } from 'react-native-version-checker';

const url = await getPlayStoreUrl();
// "https://play.google.com/store/apps/details?id=com.myapp"

// With explicit package name
const url = await getPlayStoreUrl({ packageName: 'com.other.app' });
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `packageName` | `string` | No | Defaults to the native package name |

---

### Custom Providers

You can implement the `StoreProvider` interface to fetch version information from any source -- your own backend, a CMS, Firebase Remote Config, etc.

```ts
import { needUpdate, getLatestVersion } from 'react-native-version-checker';
import type { StoreProvider, StoreResult } from 'react-native-version-checker';

const myProvider: StoreProvider = {
  async getVersion({ packageName }): Promise<StoreResult> {
    const res = await fetch(`https://api.mybackend.com/version/${packageName}`);
    const data = await res.json();

    return {
      version: data.latestVersion,     // must match /^\d+(\.\d+)*$/
      storeUrl: data.updateUrl,
    };
  },
};

// Use with getLatestVersion
const version = await getLatestVersion({ provider: myProvider });

// Use with needUpdate
const result = await needUpdate({ provider: myProvider });
```

The `StoreProvider` interface:

```ts
interface StoreProvider {
  getVersion(options: StoreProviderOptions): Promise<StoreResult>;
}

interface StoreProviderOptions {
  packageName?: string;
  country?: string;
  fetchOptions?: Record<string, unknown>;
}

interface StoreResult {
  version: string;   // validated: /^\d+(\.\d+)*$/
  storeUrl: string;
}
```

---

### Error Handling

Every error thrown by the library is an instance of `VersionCheckerError`. You can catch specific error types to handle different failure modes:

```ts
import {
  needUpdate,
  NetworkError,
  ParseError,
  ProviderError,
  ValidationError,
  VersionCheckerError,
} from 'react-native-version-checker';

try {
  const result = await needUpdate();
} catch (error) {
  if (error instanceof NetworkError) {
    // No internet or store unreachable
    console.warn('Network issue:', error.message);
  } else if (error instanceof ParseError) {
    // Store response has unexpected format
    console.warn('Parse issue:', error.message);
  } else if (error instanceof ProviderError) {
    // App not found in store
    console.warn('Provider issue:', error.message);
  } else if (error instanceof ValidationError) {
    // Invalid options or native data
    console.warn('Validation issue:', error.message);
  }
}
```

**Error hierarchy:**

| Error | Code | When |
|-------|------|------|
| `VersionCheckerError` | -- | Base class for all library errors |
| `NetworkError` | `NETWORK_ERROR` | `fetch()` fails or HTTP status is not ok |
| `ParseError` | `PARSE_ERROR` | Store response cannot be parsed or has unexpected structure |
| `ProviderError` | `PROVIDER_ERROR` | App not found in store or provider-specific failure |
| `ValidationError` | `VALIDATION_ERROR` | Invalid options, typos in option keys, or invalid native data |

Every error includes:
- `message` -- human-readable description
- `code` -- machine-readable string for programmatic handling
- `cause` -- the original underlying error (when applicable)

---

### Exported Types

All types are available for import:

```ts
import type {
  // Return types
  NeedUpdateResult,
  StoreResult,
  VersionInfo,

  // Option types
  GetLatestVersionOptions,
  NeedUpdateOptions,
  GetAppStoreUrlOptions,
  GetPlayStoreUrlOptions,
  GetStoreUrlOptions,

  // Provider interface
  StoreProvider,
} from 'react-native-version-checker';
```

**`NeedUpdateResult`**

```ts
{
  isNeeded: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
}
```

**`VersionInfo`**

```ts
{
  country: string;
  packageName: string;
  currentVersion: string;
  currentBuildNumber: string;
}
```

---

## Full Example

```ts
import { Linking } from 'react-native';
import {
  needUpdate,
  getCurrentVersion,
  NetworkError,
} from 'react-native-version-checker';

async function checkForUpdates() {
  try {
    const result = await needUpdate({ depth: 2 });

    if (result.isNeeded) {
      Alert.alert(
        'Update Available',
        `A new version (${result.latestVersion}) is available. You are on ${result.currentVersion}.`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Update', onPress: () => Linking.openURL(result.storeUrl) },
        ]
      );
    }
  } catch (error) {
    if (error instanceof NetworkError) {
      // Silently ignore -- user is offline
      return;
    }
    // Log unexpected errors to your monitoring service
    console.error(error);
  }
}
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
