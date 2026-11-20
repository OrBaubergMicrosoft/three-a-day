# Three a Day

Three a Day is a gratitude-journaling app for recording at least three good things from each day.

## Prototype scope

- iPhone and Android support.
- At least three items per daily entry, with no maximum.
- A way to create today's entry and browse previous entries.
- On-device journal storage; no accounts or cloud sync in the prototype.
- Daily local reminders at a user-selected time are planned for a later milestone.

The prototype uses Expo, React Native, and TypeScript, with Expo SQLite for on-device entries. Reminders are planned for a later milestone. See the [implementation plan and public-release checklist](docs/implementation-plan-and-public-release-checklist.md) and the [roadmap](docs/roadmap.md).

## Development

Install dependencies and start the Expo development server:

```shell
npm install
npm start
```

Run focused tests and the TypeScript check with `npm test` and `npm run typecheck`.

Native builds and the physical-device restart, offline, and OS backup/restore checklist are documented in [native device testing](docs/native-device-testing-checklist.md). Expo Go does not validate the app's native backup rules.

## Data and privacy

Journal entries are stored on the user's device in SQLite. The Android backup rules exclude the journal database, and the iOS SQLite directory is excluded from device backups in builds generated from this project. These protections do not apply when running in Expo Go. The app does not require an account or cloud service, and journal content is not sent over the network. Each local calendar date has at most one saved entry; entries require at least three non-empty items and preserve item order.

## Contributing

The roadmap tracks the planned prototype milestones. Please open an issue to discuss changes before expanding the prototype beyond its stated scope.
