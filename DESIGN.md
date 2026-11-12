# Vaqelra Design System

## Direction

Vaqelra is an English-practice app for Indonesian learners. Its visual language
is a warm travel journal: paper and ink keep the reading area calm, forest green
marks supporting actions, and rust marks the primary action. Fraunces gives
headings an editorial voice; Space Grotesk keeps interface and lesson text easy
to scan.

Dial: ENERGY 2 / RHYTHM 3 / MOTION 2.

## Design principles

- Readability: maintain clear heading levels, readable line lengths, and strong
  text contrast on every page.
- Accessibility: use semantic links and buttons, visible keyboard focus, 44px
  minimum action targets, and respect reduced-motion preferences.
- Simplicity: keep each control tied to a real action and avoid decorative
  elements that do not help a learner.
- Consistency: use the same design tokens and reusable components across pages,
  while varying page composition to fit each task.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F3EBDD` | Main page background |
| Surface | `#FFFCF5` | Raised content surfaces |
| Ink | `#292720` | Primary text |
| Muted ink | `#625A4C` | Secondary text |
| Border | `#81735E` | Dividers and control boundaries |
| Primary action | `#A74E2E` | Main calls to action |
| Primary action hover | `#873D25` | Hover and active feedback |
| Supporting accent | `#355843` | Links, progress, and secondary emphasis |
| Supporting accent hover | `#294434` | Hover feedback |
| Error | `#A34134` | Errors and recording state |

Fraunces is reserved for display headings and prominent scenario names. Space
Grotesk is used for body copy, navigation, labels, and controls. The base radius
is 4px; larger radii are reserved for grouped surfaces, while circles identify
round controls or character marks.

## Component hierarchy

- Atoms: color, type, spacing, border, focus, and radius tokens in
  `tailwind.config.js` and `src/index.css`.
- Molecules: `PageTitle`, `SectionTitle`, `ActionLink`, and `Surface` in
  `src/components/ui.jsx`.
- Organisms: the shared navigation and footer in `src/components/Layout.jsx`,
  scenario rows in `src/components/ScenarioCard.jsx`, and the live practice
  controls in `src/pages/Session.jsx`.
- Templates and pages: each route composes those shared pieces around its own
  content, such as scenario selection, session feedback, or progress history.

## Interaction patterns

- Primary actions use rust-filled `ActionLink`; secondary navigation uses the
  underlined text variant.
- Page and section headings share the same type scale. Containers share the
  same maximum width and responsive gutters.
- Links navigate; buttons change state. Both retain visible focus and hover
  feedback.
- Speaking and listening use a short, one-shot motion cue. Reduced-motion
  preferences disable nonessential animation.
