# Content/copy plan — Viewer & Organization sections

Scope: **text only**. No layout/design changes. Existing elements can be
reworded; new elements (a bullet, a card, a line) can be **added** if a real
feature deserves mentioning, but nothing gets removed structurally. Goal:
make the copy accurate to what's actually built, not just prettier.

Dashboard section is out of scope for now — viewer + organization first.

---

## 1. Open terminology decisions

| Word | Used today | Options | Recommendation |
|---|---|---|---|
| **Venue** | ~~Consistent everywhere~~ **Decided: "building."** Renamed across all viewer/org copy, `/venues` → `/buildings` (old URL 308-redirects, nothing breaks), route constant renamed to `PUBLIC_ROUTES.BUILDINGS`. | — | Done. |
| **Organization** | Consistent | `organization` / `team` / `company` | Keep **organization** — matches the data model (`Organizations` collection, `owner/manager/member` roles), no reason to diverge. |
| Homepage H1 | "Where do you want to go?" | keep / "Find your way inside any building" / other | Keep short-form unless you want the H1 itself to explain the product to first-time visitors. |
| Primary CTA | "Get started" (used 3x across both sections) | keep / vary by context | Keep as one consistent phrase — already always points at registering an organization. |

Pick venue-vs-building first — it touches the most copy below.

---

## 2. Real features not currently advertised

The organization pages' "capabilities" section only lists 3 generic bullets
(keep info current / help visitors find their way / accessible journeys).
These are real, differentiating features that aren't mentioned anywhere on
the public site at all — candidates to **add**, not just reword:

- **QR code stickers per room** — generate, download, print; scanning opens
  the visitor straight into that room's directions.
- **Team roles & email invitations** — Owner/Manager/Member, invite by
  email, no shared passwords.
- **Block a member's access** without removing them.
- **Multi-floor routing** — routes that cross floors via stairs/elevator/
  escalator, not just single-floor directions.
- **Rich floor editor** — rooms, walls, doors, stairs, elevators,
  escalators, washrooms, exits, POIs, shelves, sections — not just a flat
  room list.

---

## 3. Viewer section — page by page

### Home (`/`)
- H1 + sub: fine as-is, pending venue/building call.
- "Filter by organization" / "Browse venues" / "Recently added": all
  reference "venue(s)" — rename together if we switch the word.
- Bottom CTA ("Manage a venue? ... Get started"): same.

### Venues directory (`/venues`)
- H1 "Venue directory", sub "Search by building name..." — **already
  inconsistent within itself** (venue in the title, building in the
  subtext). First thing to fix regardless of which word wins.
- Empty state copy is accurate, no change needed.

### About (`/about`)
- Accurate to what's built (search → floor → route). Could add a 4th step
  or a line about QR-code entry (scan a sticker → land directly on a room)
  since that's now a real, common entry point, not just search.

---

## 4. Organization section — page by page

### Landing (`/organization`)
- Hero: accurate, generic on purpose (fine for a hero).
- **Capabilities section: done.** Added two cards — "Print a QR code for
  any room" and "Invite your team with roles" — alongside the original 3.
- CTA: fine as-is.

### About (`/organization/about`)
- **Tagline: done.** "Never get lost inside a building again" (visitor-
  voiced) → "Help every visitor find their way, without the guesswork."
  (organization-voiced, echoes the mission section's "should not require
  guesswork" line below it).
- "Our mission" / "How Wayfinder works" / "Your maps stay private": all
  accurate, no changes needed.

---

## 5. Suggested order of work

1. Decide venue vs. building (§1).
2. Fix the venue/building self-inconsistency on the venues directory page.
3. Fix the org-about page's visitor-voiced tagline.
4. Add 1-2 real capabilities (QR codes, roles/invitations) to the org
   landing page's capabilities section.
5. Everything else is a straight reword pass once §1 is decided.
