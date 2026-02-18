package com.versionchecker

import com.facebook.react.bridge.ReactApplicationContext
import java.util.Locale

class VersionCheckerModule(reactContext: ReactApplicationContext) :
  NativeVersionCheckerSpec(reactContext) {

  override fun getTypedExportedConstants(): Map<String, Any> {
    val context = reactApplicationContext
    val packageName = context.packageName
    val packageInfo = context.packageManager.getPackageInfo(packageName, 0)

    val versionName = packageInfo.versionName ?: ""
    @Suppress("DEPRECATION")
    val versionCode = packageInfo.versionCode.toString()
    val country = Locale.getDefault().country ?: ""

    return mapOf(
      "packageName" to packageName,
      "currentVersion" to versionName,
      "currentBuildNumber" to versionCode,
      "country" to country
    )
  }

  companion object {
    const val NAME = NativeVersionCheckerSpec.NAME
  }
}
