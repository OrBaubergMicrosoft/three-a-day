# Three a Day: Prototype Plan and Public-Release Checklist

## Prototype goal

Build a personal-use app for iPhone and Android that lets someone save at least three positive things from each day, browse past entries, and optionally receive a daily local reminder. Journal data stays on the device; the prototype has no accounts or cloud sync.

## Confirmed requirements

- Support iPhone and Android.
- Require at least three items to save a day's entry; allow more without a cap.
- Let users create today's entry and browse previous entries.
- Store journal entries on-device only.
- Offer an optional daily reminder with a user-selected local time.
- Deliver a working personal prototype, with public release treated as a later phase.

## Proposed implementation

Use **Expo with React Native and TypeScript** to share the app across iOS and Android. Use **Expo SQLite** for local journal storage and **Expo Notifications** for scheduled local reminders. These choices keep the prototype cross-platform and avoid introducing a backend.

### Data and behavior

- Store each entry with a local calendar date, its ordered list of text items, and creation/update timestamps.
- Treat an entry as belonging to the device's local calendar day. Enforce at least three non-empty items when saving, and allow additional items.
- Store reminder enabled/disabled state and the selected local time on-device. Ask for notification permission when the user enables reminders, explain why it is needed, and handle denial without blocking journaling.
- Keep saved entries available offline. Do not send journal content or reminder settings to a service.

### Delivery steps

1. **Bootstrap the app:** Create the Expo TypeScript project, configure iOS and Android targets, and verify it launches on both platforms.
2. **Build the journal flow:** Add a simple home screen for today's entry and past entries; support adding/removing item fields, validation, saving, and viewing an entry.
3. **Add local persistence:** Define the SQLite schema and repository functions; load entries on launch and verify entries survive app restarts.
4. **Add reminders:** Build settings for enable/disable and time selection, schedule a daily local notification, and replace or cancel the existing schedule when settings change.
5. **Polish and verify:** Check empty, incomplete, long, and multiple-item entries; test offline use, date boundaries, notification permission states, and accessibility basics on iOS and Android.
6. **Prepare a personal build:** Produce installable development/test builds and document how to install, configure, and reset local data.

### Prototype acceptance criteria

- A user can create and save an entry with three or more items; fewer than three cannot be saved.
- Saved entries remain on the device after closing and reopening the app.
- The user can browse and open previous entries and start today's entry.
- Reminders can be turned off or set to a chosen local time; permission denial is handled clearly.
- The core flows work on a tested iPhone and Android device without an account or network connection.

## Public-release checklist

Complete and verify these before a store launch; items that require product or legal judgment should be reviewed by the owner.

### Product and privacy

- [ ] Decide whether editing or deleting saved entries is supported and make the behavior clear.
- [ ] Decide whether users need an in-app data export or deletion/reset control.
- [ ] Publish an accurate privacy policy describing local storage, notifications, diagnostics, and any future data collection.
- [ ] Confirm the app does not transmit journal text or other sensitive content; audit analytics and crash-reporting SDKs before adding them.
- [ ] Review applicable privacy, consumer-protection, and age-rating requirements for the intended markets.

### Quality and accessibility

- [ ] Test supported iOS and Android versions, screen sizes, upgrades, fresh installs, and low-storage behavior.
- [ ] Test reminder scheduling across time-zone changes, daylight-saving transitions, reboot, permission revocation, and app updates.
- [ ] Verify keyboard navigation, screen-reader labels/order, dynamic text sizing, contrast, and touch-target sizes.
- [ ] Add focused automated tests for entry validation, local persistence, and reminder setting changes; establish a regression test pass for release candidates.
- [ ] Confirm data migration behavior before shipping any schema update.

### Store and operational readiness

- [ ] Secure the app name, bundle/package identifiers, developer accounts, signing credentials, and release access.
- [ ] Prepare app icon, screenshots, store descriptions, support contact, age rating, and category metadata.
- [ ] Complete Apple privacy disclosures and Google Play Data safety declarations based on the actual shipped app and SDK behavior.
- [ ] Review store policies for notification permission prompts and any included third-party SDKs.
- [ ] Decide on a support and issue-reporting process, and document how users can reset or remove locally stored data.
- [ ] Run TestFlight and Google Play testing tracks, resolve launch-blocking issues, and obtain owner approval before production rollout.
- [ ] Keep a versioned release checklist, rollback/disablement plan, and post-release monitoring plan.
