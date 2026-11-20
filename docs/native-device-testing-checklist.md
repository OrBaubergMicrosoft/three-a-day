# Native device testing checklist

Use this checklist with standalone native builds on physical devices. Results are intentionally blank until a person runs the checks; no device backup or restore has been verified yet.

## Build and install

The project uses Expo SDK 58 and Continuous Native Generation. `android/` and `ios/` are generated during native builds; do not hand-edit them.

Before the first build:

- Choose and set a stable `expo.ios.bundleIdentifier` in `app.json`. It is currently unset. Confirm the Android application ID, currently `com.anonymous.threeaday`, before creating test data.
- Install dependencies with `npm install`, sign in to the owner's Expo account, and run `npx eas-cli@latest build:configure` once to link/configure Expo Build.
- Use an internal-distribution profile in `eas.json`. For example:

  ```json
  {
    "build": {
      "preview": {
        "distribution": "internal",
        "android": {
          "buildType": "apk"
        }
      }
    }
  }
  ```

- Build standalone artifacts that include the JavaScript bundle:

  ```shell
  npx eas-cli@latest build --platform android --profile preview
  npx eas-cli@latest build --platform ios --profile preview
  ```

- Install each artifact using its Expo Build installation link. Android internal distribution produces an installable APK. iOS internal distribution requires the tester's device UDID to be registered for ad hoc provisioning and an Apple Developer account. Keep signing credentials with the owner; do not put them in the repository.

For local native iteration, `npx expo run:android --device` requires Android Studio/Android SDK. `npx expo run:ios --device` requires macOS and Xcode. These commands create debug builds that use Metro; they are not the offline test artifact. Expo Build can create iOS binaries from Windows, but the Apple account and device-registration prerequisites still apply.

Do not use Expo Go for these checks. Expo Go does not run this app's generated native configuration or backup-exclusion plugin, so it cannot validate native backup rules.

## Restart and offline persistence

Run on each installed iPhone and Android build:

- [ ] Record the device model, OS version, app version, build ID, and install date below.
- [ ] Open the app and save a journal entry with at least three distinct items. Record a unique marker such as `native-test-2026-11-20`.
- [ ] Force-quit the app, reopen it, and confirm the entry and item order are unchanged.
- [ ] Enable airplane mode and verify Wi-Fi and mobile data are off. Force-quit and reopen the app; confirm the entry is still visible.
- [ ] While still offline, create a second entry, force-quit and reopen the app, and confirm both entries and all items remain available.
- [ ] Turn connectivity back on before starting the OS backup test.

Use the installed standalone build, not a development session connected to Metro, for the offline check.

## Actual OS backup and restore

Use a spare or disposable test device. Restoring a device backup can erase the device. Never erase a primary phone or risk the only copy of personal data for this test. Preserve the test backup until results are recorded.

### iPhone

- [ ] Confirm the marker entry exists in the installed native build.
- [ ] Create a real iCloud or computer backup using Apple's device backup flow and wait for it to complete.
- [ ] Restore that backup to a spare iPhone or erase only a disposable test iPhone and restore it during setup. Follow Apple's current restore instructions.
- [ ] If the non-store test app was not reinstalled by iOS, install the same signed build with the same bundle identifier after the device restore, then open it.
- [ ] Confirm the marker entry is **absent**. A restored journal entry means the SQLite directory was not excluded and is a failure.

### Android

- [ ] Confirm the marker entry exists in the installed native build.
- [ ] Enable Google device backup and run **Back up now**. Wait until Android reports the device backup is complete.
- [ ] Restore the backup during setup on a spare or disposable device running the same or a newer Android version. Use the same Google account and restore the app if offered.
- [ ] If the app was not restored automatically, install the same package/signing build and open it so Android can apply any available app-data restore.
- [ ] Confirm the marker entry is **absent**. A restored journal entry means the database exclusion did not take effect and is a failure.
- [ ] If device-to-device transfer is in scope, repeat using that OS setup flow too; Android uses a separate transfer exclusion rule.

Do not count reinstalling the app without an OS backup restore as a backup test. If the OS does not offer a backup or restore for the test app/device, record the case as blocked or not applicable with the reason, not as passed.

## Results

Record one row per device and backup route. Attach build links or non-sensitive screenshots/logs if useful; do not include account credentials or private journal text.

| Platform / device | OS version | App version / build ID | Restart | Offline | Backup route and completed time | Restore result (marker absent?) | Pass / fail / blocked | Tester / date / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| iPhone | | | | | | | Pending | |
| Android | | | | | | | Pending | |

## References

- [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/)
- [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Expo local app development](https://docs.expo.dev/guides/local-app-development/)
- [Apple: restore iPhone from a backup](https://support.apple.com/en-gb/118105)
- [Google: back up or restore Android data](https://support.google.com/android/answer/2819582?hl=en)
- [Android: Auto Backup for apps](https://developer.android.com/identity/data/autobackup)
