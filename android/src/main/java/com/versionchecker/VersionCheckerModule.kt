package com.versionchecker

import com.facebook.react.bridge.ReactApplicationContext

class VersionCheckerModule(reactContext: ReactApplicationContext) :
  NativeVersionCheckerSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeVersionCheckerSpec.NAME
  }
}
