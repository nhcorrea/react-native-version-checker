#import "VersionChecker.h"

@implementation VersionChecker

- (NSDictionary *)getConstants {
    NSString *country = [[NSLocale currentLocale] objectForKey:NSLocaleCountryCode] ?: @"";
    NSString *packageName = [[NSBundle mainBundle] bundleIdentifier] ?: @"";
    NSString *currentVersion = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"] ?: @"";
    NSString *currentBuildNumber = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"] ?: @"";

    return @{
        @"country": country,
        @"packageName": packageName,
        @"currentVersion": currentVersion,
        @"currentBuildNumber": currentBuildNumber,
    };
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeVersionCheckerSpecJSI>(params);
}

+ (NSString *)moduleName
{
    return @"VersionChecker";
}

@end
