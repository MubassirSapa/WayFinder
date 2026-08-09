# Auth Pages Redesign Plan — Split-Screen Illustration Layout

Status: **planned, not yet implemented.** This document describes the target
design and the steps to get there. Nothing in this doc has been built yet.

## Goal

**Decision (locked in): illustrations are bespoke, not stock.** Stock
illustrations (undraw or otherwise) — even carefully recolored — carry a
real risk of reading as generic "template SaaS" to a design-literate
audience, which matters here because this is being presented to industry
partners. Instead, every auth-page illustration is built from Wayfinder's
own existing visual language: floor plates, pins, nodes, and route lines —
the same primitives already established by `ViewerHeroVisual`
(`src/features/viewer/components/ViewerHeroVisual.tsx`) on the public home
page. This is a stronger choice for a premium look: it's 100% original, it
reinforces the actual product identity (this is an indoor-wayfinding app —
illustrating auth with wayfinding metaphors is on-brand in a way no stock
illustration set can be), and it costs nothing in licensing or attribution
risk. The tradeoff is more design/build effort than dropping in a stock
SVG — accepted deliberately.

Replace the current single-column, centered auth card with a responsive
two-column layout: an illustration panel on one side, the form on the
other — the same split-screen pattern shown in the reference image the team
provided (a login-page mockup), adapted to Wayfinder's own theme and brand.

**Explicitly not copying from the reference**: its color palette. The
reference is a layout/structure reference only — panel proportions, where
the logo sits, where the illustration sits, spacing rhythm. All colors come
from Wayfinder's existing theme tokens (`global.css`), light and dark.

## Current state

Every auth page (`signin`, `signup`, `register-organization`,
`forgot-password`, `reset-password`, `check-email`, `verify-email`,
`invite`) shares one layout:

- `src/app/(frontend)/(auth)/layout.tsx` renders `AuthFrame`
  (`src/features/auth/shared/AuthFrame.tsx`) around every page in the
  `(auth)` route group.
- `AuthFrame` is a single centered column, max-width 560px, no illustration:
  ```
  <main> -> centered column -> {children}
  ```
- Each page's own section component (e.g. `SigninSection` →
  `SigninForm`) renders a `FormCard` (`src/components/shared/form/
  FormCard.tsx`) — the actual card with the brand header, title,
  description, fields, and footer CTAs. `FormCard` itself doesn't change in
  this plan; only what wraps it does.
- There is currently **no illustration anywhere in the auth flow.** The
  closest precedent in the app is `ViewerHeroVisual`
  (`src/features/viewer/components/ViewerHeroVisual.tsx`) — a bespoke,
  hand-built 3D "floor plate" SVG used on the public home page hero. It's
  worth knowing this exists: it's a different visual language (abstract,
  geometric, map-themed, built from `<div>`s and inline `<svg>` rather than
  an illustration library) from the flat, people-based undraw.co style the
  reference image uses. This plan intentionally introduces a second visual
  language (illustrations) for the auth flow specifically, not a
  replacement for the home hero's style.

## New layout

### Desktop / tablet (≥ the chosen breakpoint)

Two columns, full-height:

```
+------------------------+------------------------+
|                        |                         |
|     Illustration       |      Brand + Form       |
|        panel           |         panel           |
|   (decorative, one     |   (FormCard content,    |
|  bespoke scene + a     |    unchanged from       |
|    short headline)     |    today)                |
|                        |                         |
+------------------------+------------------------+
```

- The **side alternates per page** (see table below) — illustration left
  on some pages, right on others, so the flow doesn't feel monotonous as a
  user moves signin → signup → forgot-password → etc. The form panel
  itself never changes side relative to which panel it's paired with; only
  which side each page puts the illustration on changes.
- Illustration panel: a background tint (a muted theme token, e.g.
  `bg-muted` or a soft `bg-primary/5`, not a hardcoded color), the SVG
  centered, and a short one-line headline/subtext beneath it (optional,
  mirrors the reference's "Exam Mastery Hub" caption under its
  illustration).
- Form panel: effectively today's `AuthFrame` inner column, just no longer
  centered on the full viewport — centered within its own half.

### Mobile

Illustration panel is **dropped entirely**, not shrunk or stacked above the
form — the reference image's own mobile behavior for this pattern is
typically "form only," and that also keeps the auth flow fast and
uncluttered on a phone, consistent with how the rest of the app already
prioritizes mobile (Section 11 of `WAYFINDER_PROJECT_CONTEXT.md` notes
several phone-specific visibility toggles already in place elsewhere in the
app — same pattern, applied here). Below the breakpoint, the layout
collapses back to exactly what `AuthFrame` renders today: single centered
column, full width, no illustration.

Breakpoint recommendation: hide the illustration panel below `lg` (1024px),
matching the "full app chrome only on larger screens" pattern already used
elsewhere (e.g. the dashboard sidebar). Confirm against how the form itself
reads at `md` (768px–1023px) before finalizing — if the form panel alone
feels cramped in a half-width column at `md`, drop to `lg` as the cutoff for
switching to single-column rather than shrinking the illustration panel.

## Illustration design system — bespoke, built from Wayfinder's own primitives

No external asset source. Every illustration is composed from a small set
of shared, reusable visual primitives — the same idea `ViewerHeroVisual`
already proves out (its `ViewerFloorPlate`/`ViewerRoute` sub-components are
themselves reusable building blocks, not one monolithic drawing). Building
the auth illustrations the same way keeps them visually consistent as a
set (a real requirement for a "premium," not "eight random pictures,"
feel) and keeps the actual SVG/CSS code small and DRY.

### Shared primitives (build once, reuse across all 8 pages)

- **`IllustrationPin`** — the location-pin/marker shape already implied by
  `MapPin` usage elsewhere in the app; a filled circle-and-point shape,
  themeable via `currentColor`.
- **`IllustrationFloorPlate`** — a simplified, flat (not 3D-tilted like the
  hero's) rounded rectangle with a few inset "room" rectangles, matching
  `ViewerFloorPlate`'s visual grammar without reusing its exact 3D
  transform (the auth pages read better as calmer/flatter than the home
  hero's angled 3D stack — this is a deliberate, smaller-scale variant of
  the same idea, not a copy-paste).
- **`IllustrationNode`** — a small circle, optionally with a pulse/glow
  ring (CSS `animation`, theme-token color), representing a `MapNode`.
- **`IllustrationRoute`** — a dashed or solid path between two points with
  an arrowhead marker, directly modeled on `ViewerRoute`'s existing
  `<path>` + `marker` SVG pattern (same `markerEnd`, same
  `strokeLinecap="round"` styling) — reused almost verbatim, since it
  already looks good and is already theme-token-driven.

### Per-page composition (see table below for the concept assigned to each page)

Each page's illustration composes 2–4 of the primitives above into a small
scene, plus a one-line CSS/SVG animation (see "Motion" below) that makes it
feel alive rather than static — this is a major part of what separates
"premium" from "generic": a static stock illustration vs. a small, subtle,
on-brand animation loop that only this product could have.

### Color

Single accent color throughout: `currentColor` wrapped in `text-primary`
(the existing green primary token), exactly like `ViewerRoute` already
does — no second/third illustration color, no gradients unless a theme
token already defines one. Neutral structural strokes (floor plate
outlines, room dividers) use `text-foreground/20`–`/30` opacity steps or
`border-border`-equivalent stroke colors, matching `ViewerFloorPlate`'s
existing `border-foreground/20` treatment. This is a hard rule per
`CLAUDE.md`'s "theme tokens only, never a hardcoded color" convention —
already satisfied by design here since every primitive is
`currentColor`/token-based from the start, not retrofitted.

### Motion

A small, tasteful animation per page — not a full Lottie/After-Effects
production, CSS-only, matching the codebase's existing style (plain
Tailwind/CSS, no animation library dependency exists in `package.json`
today and none is needed for this). Ideas, pick one or two per
illustration, not all at once:

- A route line that draws itself in on mount (`stroke-dasharray`/
  `stroke-dashoffset` animation — a well-known, cheap, premium-feeling SVG
  technique).
- A node's pulse ring (`animate-ping`-style, Tailwind already ships this
  utility) on the "destination" point of a route.
- A gentle idle float (`translateY` keyframe loop, a few px, several
  seconds duration) on the pin/marker, so the panel doesn't feel frozen
  even before any interaction.
- A one-time fade/slide-in on page load (`opacity`/`translateY` transition
  on mount), applied consistently across all 8 so page-to-page navigation
  in the auth flow feels like one coherent system.

Keep every animation subtle and slow (premium reads as *calm*, not busy) —
this is the opposite instinct from a flashy marketing-site animation.

### Rendering approach

Inline SVG as React components (no separate asset files, no `<img>`/
`next/image` involved at all, since nothing is downloaded) — this is what
makes `currentColor` + Tailwind text-color theming and CSS-driven
animation possible in the first place, and matches how `ViewerHeroVisual`
is already built.

## Component architecture

New shared component, e.g. `AuthSplitFrame`
(`src/features/auth/shared/AuthSplitFrame.tsx`), replacing `AuthFrame` as
what `(auth)/layout.tsx` renders — or, if per-page illustration/side needs
to be set by the page itself rather than the shared layout, keep
`AuthFrame` as the layout and have each page's section component render a
new `AuthSplitPanel` wrapper around its own `FormCard`. The second approach
is very likely the right one, since the illustration and its side are
**per-page**, not global — the layout component only knows "render
children," it doesn't know which page it's wrapping.

Recommended shape:

```tsx
// src/features/auth/shared/AuthSplitFrame.tsx
type AuthSplitFrameProps = {
  illustration: React.ReactNode; // the inlined SVG component
  illustrationSide: "left" | "right";
  illustrationHeadline?: string;
  children: React.ReactNode; // the existing FormCard-based section
};
```

Each page's `*Section.tsx` component (e.g. `SigninSection`) picks its own
illustration + side and passes them into `AuthSplitFrame`, wrapping its
existing form component unchanged:

```tsx
// SigninSection.tsx (illustrative shape, not final code)
const SigninSection = () => (
  <AuthSplitFrame
    illustration={<LoginIllustration />}
    illustrationSide="left"
    illustrationHeadline="Find your way in, every time."
  >
    <SigninForm />
  </AuthSplitFrame>
);
```

This keeps every existing form component (`SigninForm`, `SignupForm`, etc.)
completely untouched — only the section-level wrapper changes, matching
this project's own layering convention (pages/sections own layout, forms
own form logic).

`AuthFrame`'s existing single-column behavior effectively becomes the
"form panel, no illustration" fallback — it doesn't need to be deleted; it
can stay as the base the split layout builds on, or `AuthSplitFrame` can
subsume it entirely and `AuthFrame` gets removed once every page migrates.
Decide during implementation once the exact desktop/mobile markup is
drafted — don't decide this preemptively in the plan.

## Per-page illustration and side assignment

Sides strictly alternate in route-list order so the pattern reads as
intentional, not random. Concepts below compose the shared primitives
above into a small scene per page — final exact composition (positions,
counts, which motion) is a build-time design decision, not fixed in
concrete here.

| Page | Route | Side | Concept |
|---|---|---|---|
| Sign in | `/signin` | Left | A route line draws in toward a single glowing node sitting at an open floor-plate entrance — "a route in" |
| Sign up | `/signup` | Right | An empty floor plate fills in with room rectangles one by one — a space being created |
| Register organization | `/register-organization` | Left | Several floor plates stack/assemble into one building outline — org = a whole building, not just one floor |
| Forgot password | `/forgot-password` | Right | A pin with a pulsing ring, searching over a faint, incomplete route — "finding your way back in" |
| Reset password | `/reset-password` | Left | A node's pulse ring resolves into a solid route continuing onward — "unlocked, path continues" |
| Check email | `/check-email` | Right | A route line travels from a node to a small envelope-shaped marker at the edge of the frame — "sent" |
| Verify email | `/verify-email` | Left | A node flips from hollow/dashed to solid + a small checkmark accent — "confirmed" |
| Accept invitation | `/invite` | Right | Two separate small routes merge into one shared node — "joining" |

(Left/right strictly alternates across this list — if a page is added or
removed from the auth flow later, re-walk the table top to bottom rather
than hand-picking a side, so the alternation stays consistent.)

## Implementation steps

1. **Build the shared primitives** (`IllustrationPin`, `IllustrationFloorPlate`,
   `IllustrationNode`, `IllustrationRoute`) as small, isolated components —
   get these looking right on their own (Storybook-less "just render each
   one on a blank page" check is enough) before composing any full scene,
   since every page's illustration depends on them.
2. **Build `AuthSplitFrame`.** New two-column responsive component per the
   architecture section above. Build it against one real page first (e.g.
   `signin`) rather than in isolation, so the breakpoint/spacing decisions
   are checked against real content immediately.
3. **Verify the mobile fallback** matches `AuthFrame`'s current single-
   column rendering exactly — this is a regression risk since every auth
   page currently relies on that exact centered-column behavior on phone.
4. **Compose the signin illustration first** (route drawing into a node at
   an entrance) using the primitives, including its motion — this is the
   page most likely to actually be shown live to a partner, so it's the
   one worth getting exactly right before repeating the pattern.
5. **Roll out to the remaining 7 pages**, one at a time, composing each
   concept from the table above, and checking each against its own form's
   content length (e.g. `RegisterOrganizationForm` likely has more fields
   than `SigninForm` — confirm the form panel doesn't overflow awkwardly
   against a fixed-height illustration panel).
6. **Decide `AuthFrame`'s fate** (kept as the base, or removed once fully
   subsumed) once all 8 pages are migrated and the shared code is stable.
7. **Cross-check theme tokens and motion** — run the app in both light and
   dark mode on every migrated page (confirm every primitive's
   `currentColor` reads correctly against both), and confirm every
   animation still feels subtle/slow rather than distracting once seen
   next to a real form; add any new token needed to `global.css` rather
   than hardcoding a one-off value, per `CLAUDE.md`'s UI rules.
8. **Add/update tests** if `AuthFrame` or any auth section component has
   existing component tests that assert on current markup structure —
   check `src/features/auth/__tests__/` before starting, so the redesign
   doesn't silently break coverage.

## Files likely touched

- New: `src/features/auth/shared/illustrations/` — the four shared
  primitive components (`IllustrationPin.tsx`, `IllustrationFloorPlate.tsx`,
  `IllustrationNode.tsx`, `IllustrationRoute.tsx`)
- New: `src/features/auth/shared/illustrations/scenes/` — 8 small
  composition components, one per page, each combining primitives into
  that page's concept
- New: `src/features/auth/shared/AuthSplitFrame.tsx`
- Edit: all 8 `*Section.tsx` files under `src/features/auth/pages/*/sections/`
  and `src/features/invitations/pages/invite-accept/InviteAcceptSection.tsx`
- Possibly edit or retire: `src/features/auth/shared/AuthFrame.tsx`,
  `src/app/(frontend)/(auth)/layout.tsx`
- Possibly new theme tokens in `src/app/(frontend)/global.css` (illustration
  panel background tint, if no existing token fits)

## Open questions to resolve before/during implementation

- Exact breakpoint (`lg` vs `md`) — decide against real form content, not
  in the abstract (see "Mobile" section above).
- Whether the illustration headline text (optional, mirrors the reference
  image's caption) is worth adding for all 8 pages or only some — it adds
  content-writing scope (8 short headlines) beyond just the visual layout.
- Whether `AuthFrame` survives as a fallback/base component or gets fully
  replaced — deferred to step 5 above, not decided here.
