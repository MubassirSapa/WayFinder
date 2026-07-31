# Demo Users and Seed Data

Run `npm run demo:seed` to create or refresh both demo accounts and their map data. The command is idempotent: rerunning it refreshes only the two demo buildings.

| User | Email | Password | Organization | Demo Floors |
| --- | --- | --- | --- | --- |
| Dr. Maya Chen | `maya@wayfinder.demo` | `WayfinderDemo!2026` | Northstar Medical Centre | Lower Level - Diagnostics; Ground Floor - Emergency & Welcome; Level 1 - Clinics; Level 2 - Patient Care |
| Jordan Rivera | `jordan@wayfinder.demo` | `WayfinderDemo!2026` | Harbourfront Galleria | P1 - Parking & Services; Ground Floor - Market Hall; Level 1 - Dining & Entertainment |

Both accounts are seeded as verified organization administrators. Their maps contain searchable destinations, connected same-floor routes, cross-floor stairs, elevators, and escalators, plus accessible and non-accessible route options.

These credentials are for local demonstrations and QA only. Do not reuse the password for real accounts or production environments.
