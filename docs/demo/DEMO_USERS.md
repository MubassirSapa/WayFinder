# Demo Users and Seed Data

Set `DEMO_SEED_PASSWORD` in the target environment file, then run
`npm run demo:seed:local`, `npm run demo:seed:preview`, or
`npm run demo:seed:production`. Each command loads only its matching ignored
environment file. The command is
idempotent: rerunning it refreshes only the two seeded buildings. The map
records come from the portable fixtures in `scripts/seed-data/`; fixture IDs
are remapped to newly created Payload IDs, so the same seed works with MongoDB
and SQLite.

Payload type auto-generation is disabled during application and script startup
so targeting MongoDB cannot rewrite the SQLite-canonical committed types. Run
`npm run payload:types` intentionally after collection schema changes.

When either email already exists in a migrated database, the seeder preserves
that user's existing organization and refreshes its building/map data. On a
fresh database it creates the fallback organization shown below. This keeps
migrated ownership intact while making clean-environment setup deterministic.

| User | Email | Password | Organization | Demo Floors |
| --- | --- | --- | --- | --- |
| Hasan | `hasan.swe.dev@gmail.com` | `DEMO_SEED_PASSWORD` | Northstar Medical Centre | Floor 1; Floor 2; Floor 3 |
| Mubassir | `mubs4edu@gmail.com` | `DEMO_SEED_PASSWORD` | Harbourfront Galleria | Floor 1; Floor 2 |

Both accounts are seeded as verified organization users. Floors are assigned sequential levels and every adjacent floor pair is connected by bidirectional stairs, elevator, and escalator edges. If an exported floor lacks one of those connectors, the seeder creates it and connects it to the nearest same-floor route node. This makes the data suitable for repeatable multi-floor navigation and accessibility tests.

The password is deliberately not committed. Keep it only in ignored local
environment files or encrypted deployment secrets. The preview command loads
`.env.preview`; it does not copy `.env.local` credentials into the preview
database.
