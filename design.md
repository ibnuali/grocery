# Design — Grocery Planner

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
playful

## Macrostructure family
The product uses one shared Hum system across marketing and app surfaces.

- Marketing landing: Split Studio with H2 split diptych, alternating proof bands, N9 edge-aligned navigation, and Ft5 statement footer
- App views: centred single-column (max-w-2xl), card-based sections, floating action bars
- Authentication: split composition with a quiet product-story panel and a focused form panel; dedicated `/login` and `/register` routes
## Theme — Hum (playful, multi-accent)

- `--color-paper`     oklch(97% 0.012 95)   — warm cream, neutral base
- `--color-paper-2`   oklch(94% 0.016 95)   — tinted band
- `--color-paper-3`   oklch(91% 0.020 95)   — deeper hover
- `--color-ink`       oklch(20% 0.012 250)  — near-black, cool tilt
- `--color-ink-2`     oklch(40% 0.010 250)  — secondary text
- `--color-ink-3`     oklch(56% 0.008 250)  — muted text
- `--color-rule`      oklch(88% 0.014 95)   — borders, dividers
- `--color-accent`    oklch(86% 0.10 350)   — soft pink (primary CTA)
- `--color-accent-2`  oklch(66% 0.18 235)   — sky-cyan (links, hover)
- `--color-accent-3`  oklch(68% 0.24 18)    — coral-red (pop moment)
- `--color-mint`      oklch(80% 0.16 150)   — success states
- `--color-lavender`  oklch(74% 0.16 305)   — decorative tags

## Typography

- Display: Plus Jakarta Sans, weight 600, style normal, tracking -0.025em
- Body:    Plus Jakarta Sans, weight 400
- Mono:    JetBrains Mono, weight 400 (tabular numerals for Rp amounts)
- Display tracking: -0.025em
- Type scale anchor: major third (1.25) from 16px base

## Spacing
4-point named scale. The values are in `tokens.css`. Pages must use named
tokens (`var(--space-md)`), never raw values.

## Motion
- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`
- Reveal: fade + translateY on view-enter (one orchestrated entrance)
- Reduced-motion fallback: opacity-only, ≤ 150 ms
- Button press: lift 2px hover, press DOWN 3px active, snappy easing
- Card hover: lift 4px + shadow brighten + accent tint deepen

## Microinteractions stance
- Silent success (no toast on visible actions)
- Optimistic update + Undo on destructive actions
- Hover delay 800 ms on tooltips, 0 ms on focus
- Star-burst on primary action complete (coral-red, 420ms)

## CTA voice
- Primary CTA: filled push button, soft-pink background, rounded pill shape
- Secondary CTA: soft flat button, paper-2 background
- Tertiary CTA: outline button, hairline border

## What pages MUST share
- The wordmark ("Grocery Planner" in Plus Jakarta Sans 600)
- The accent colour and its placement (≤ 5% per viewport)
- The display + body fonts (Plus Jakarta Sans)
- The CTA voice (push button shape, pill radius, shadow physics)
- Card radius (20px), input radius (12px), pill radius (999px)

## What pages MAY differ on
- Section layout (list vs grid vs form)
- Card density (compact checklist vs spacious plan cards)
- Accent distribution (login = soft-pink hero; in-store = dark mode progress card)

## Exports

### tokens.css
See `tokens.css` at project root.

### shadcn/ui CSS variables
Mapped in `:root` and `.dark` blocks of `index.css`.
