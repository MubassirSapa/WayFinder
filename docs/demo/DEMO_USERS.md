# Demo Users and Seed Data

Run `npm run demo:seed` to create or refresh both demo accounts and their map data. The command is idempotent: rerunning it refreshes only the two demo buildings. The map records come from the production-style Payload exports in `scripts/seed-data/`; exported MongoDB IDs are remapped to newly created Payload IDs, so the same seed works with MongoDB and SQLite.

| User | Email | Password | Organization | Demo Floors |
| --- | --- | --- | --- | --- |
| Dr. Maya Chen | `maya@wayfinder.demo` | `WayfinderDemo!2026` | Northstar Medical Centre | Floor 1; Floor 2; Floor 3 |
| Jordan Rivera | `jordan@wayfinder.demo` | `WayfinderDemo!2026` | Harbourfront Galleria | Floor 1; Floor 2 |

Both accounts are seeded as verified organization users. Floors are assigned sequential levels and every adjacent floor pair is connected by bidirectional stairs, elevator, and escalator edges. If an exported floor lacks one of those connectors, the seeder creates it and connects it to the nearest same-floor route node. This makes the data suitable for repeatable multi-floor navigation and accessibility tests.

These credentials are for local demonstrations and QA only. Do not reuse the password for real accounts or production environments.
