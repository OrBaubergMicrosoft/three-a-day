# Three a Day Roadmap

This roadmap is for the personal-use prototype first. Public distribution is a separate later phase. The proposed stack is Expo, React Native, and TypeScript, with SQLite and local notifications; confirm the choices during app scaffolding.

## Prototype

1. **Scaffold the cross-platform app** — Set up the Expo TypeScript project and confirm it launches on an iPhone and Android device.
2. **Build the daily journal flow** — Create today's entry, add any number of items, require at least three non-empty items to save, and browse/open prior entries.
3. **Persist entries locally** — Save entries in SQLite, load them on startup, and verify offline/restart behavior.
4. **Add configurable reminders** — Let users enable/disable reminders and select a local time; handle notification permissions and schedule updates.
5. **Verify and distribute a personal build** — Test the core flows on both platforms, check accessibility and date/notification edge cases, and document personal installation.

## Later: public release

Before deciding to publish, resolve the product questions and complete the privacy, quality, accessibility, store metadata, testing-track, and operational items in the [public-release checklist](implementation-plan-and-public-release-checklist.md). Do not add accounts or cloud sync as part of the prototype.

## Tracking

The implementation plan and acceptance criteria are in [implementation-plan-and-public-release-checklist.md](implementation-plan-and-public-release-checklist.md). GitHub issues are used to track the prototype milestones; update this roadmap as scope or sequencing changes.
