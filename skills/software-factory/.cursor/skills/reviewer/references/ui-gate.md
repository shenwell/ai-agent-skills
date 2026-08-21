# UI review gate

Load this file on any job where `ui_surface` is not `none`. These checks are acceptance criteria, not taste. Fail them with `request_changes`.

## Anti-slop

Flag these unless the design contract or the brief asked for that look:

- Cream background near `#F4F1EA` with a terracotta accent and a high-contrast serif display
- Near-black background with a single acid-green or vermilion accent
- Broadsheet layout: hairline rules, zero radius, dense newspaper columns
- Inter or Roboto as the display face
- Purple-on-white gradient "SaaS starter" chrome
- Emoji used as navigation or system icons

## Accessibility floor

- Body text contrast at least 4.5:1 against its surface, in every theme shipped
- Visible keyboard focus on interactive elements
- Icon-only controls have an accessible name
- Form fields have visible labels
- `prefers-reduced-motion` disables or shortens decorative motion

## Tokens and states

- Colors in components come from tokens (`design-system/MASTER.md` or the design contract), not one-off hex
- Empty, loading, and error states exist for the changed surface; empty includes a next action
- Primary click/tap targets are at least 44px

## Visual evidence

For `new_page` or `new_product`, do not approve without a screenshot or a live page the implementer recorded in `verification`. A CSS diff alone is not enough. For `existing` or `new_component`, missing visual evidence is a blocking finding only when the analysis required it; otherwise note it in `suggestions`.
