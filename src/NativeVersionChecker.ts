import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  getConstants(): {
    country: string;
    packageName: string;
    currentVersion: string;
    currentBuildNumber: string;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('VersionChecker');
