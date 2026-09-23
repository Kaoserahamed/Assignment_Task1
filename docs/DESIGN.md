# Design

This document covers the design principles, responsive approach, visual
language, accessibility and key UX decisions behind the Rovex order tracking
screen.

---

## 1. Design principles

1. **Calm over clever.** The screen communicates status clearly and
   quickly. Motion is purposeful (skeleton shimmer, sheet slide-in, refresh
   spin) and disabled under `prefers-reduced-motion`.
2. **Colour as signal, not decoration.** Every hue maps to a status tone
   (see §4). No decorative gradients, no purely ornamental elements.
3. **Consistent card grammar.** Every content block uses the same
   `SectionCard` header (title + description + optional action) so scanning
   the page feels uniform from estimate to summary to support.
4. **Mobile-first, not mobile-only.** The layout is a centred 440 px column;
   on wider viewports it simply stops growing and centres, keeping the
   mobile reading experience intact.
5. **Data-driven, not hardcoded.** Stage lists, support actions, badge
   wording and banner copy all come from typed data maps, so adding a state
   or tone requires no JSX duplication.
6. **Honest empty states.** When data is missing (no tracking number, an
   error, a not-found order) the screen explains what happened and offers a
   concrete next step — never a blank or broken-looking view.

---

## 2. Responsive design approach

### Viewport strategy

The entire UI lives in a centred container:

```tsx
max-w-[440px]   // ≈ largest mobile phone (iPhone 15 Pro Max)
overflow-x-clip // belt-and-braces: zero horizontal scroll
min-h-dvh       // dynamic viewport height (excludes mobile browser chrome)
```

| Target width | Notes                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| **360 px**   | Tightest supported; single column, `px-4` gutters, all text legible.         |
| **390 px**   | iPhone 14 / Pixel defaults; cards sit comfortably.                           |
| **430 px**   | iPhone 15 Pro Max; the max-width stops growth so the layout doesn't stretch. |

### Breakpoints

---

## 3. Typography and spacing

### Typography scale

| Element                | Size / weight                              | Font       |
| ---------------------- | ------------------------------------------ | ---------- |
| Page title (small)     | `text-sm / font-semibold`                  | Geist Sans |
| Status headline (`h1`) | `text-xl / font-semibold / tracking-tight` | Geist Sans |
| Card titles (`h2`)     | `text-sm / font-semibold`                  | Geist Sans |
| Body copy              | `text-[13px] / leading-5`                  | Geist Sans |
| Captions / hints       | `text-xs / leading-5` and `text-[11px]`    | Geist Sans |
| Order number           | `font-mono / text-[11px]`                  | Geist Mono |

Geist Sans is loaded via `next/font/google` with automatic font-optional
behaviour. Monospace is used sparingly for order numbers and tracking codes,
giving them a "scan the label" quality.

### Spacing system

Tailwind's default 4 px scale is used throughout (`space-y-3`, `px-4`,
`py-2.5`). No custom spacing tokens were introduced to keep the mental model
simple.

### Touch targets

Every interactive control is at least **44 px** tall
(`min-h-11` = 2.75 rem in the Tailwind 4 spacing scale). Buttons use
`rounded-full` for a soft, tappable affordance. Verified by the smoke test's
CSS assertion for `min-h-11`.

### Shadows and borders

- Cards: `shadow-sm ring-1 ring-slate-200/80` — subtle depth, no heavy drop-shadow.
- Status banners: tone-specific `ring-1` (e.g. `ring-amber-200/80` for
  warnings) with a tinted `bg-*` background.
- Dividers: `border-dashed border-slate-200` between summary rows.
- Focus rings: `outline: 2px solid var(--color-indigo-600); outline-offset: 2px`
  applied globally to `:focus-visible` elements.

---

## 4. Color and status semantics

The palette intentionally leans on Tailwind's built-in **slate / indigo /
emerald / amber / rose** scales so that status semantics stay predictable and
consistent across components:

| Tone        | Palette | Used for                                       |
| ----------- | ------- | ---------------------------------------------- |
| **indigo**  | 50–950  | Brand actions, informational, current step     |
| **emerald** | 50–700  | Success / completed stages                     |
| **amber**   | 50–800  | Delays, warnings, exceptions needing attention |
| **rose**    | 50–700  | Critical problems (delivered but missing)      |
| **slate**   | 100–900 | Background, borders, neutral text              |

These map onto the `StatusTone` and `BadgeTone` types in the code:

- `info` → indigo banners, blue icons
- `success` → emerald badges, green checkmarks
- `warning` → amber banners, triangle-alert icons
- `critical` → rose banners, circle-alert icons
- `neutral` → slate (used for pending estimates)

### Stage status mapping

| `StageStatus` | Dot              | Connector   | Icon           | SR label          |
| ------------- | ---------------- | ----------- | -------------- | ----------------- |
| `completed`   | emerald          | emerald-200 | check          | "Completed"       |
| `current`     | indigo (pulsing) | slate-200   | truck          | "In progress"     |
| `upcoming`    | white/slate-300  | slate-200   | dot            | "Not started yet" |
| `exception`   | amber            | amber-200   | triangle-alert | "Needs attention" |

The `current` step also carries `aria-current="step"` on its `<li>` element
and a screen-reader sentence: "Step N of M. Status: …".

---

## 5. Accessibility considerations

| Principle                | Implementation                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Single `h1` per page** | The headline lives in `StatusBanner` (and the loaded states of skeletons/error/empty cards). Smoke-tested for exactly one `h1`.            |
| **Focus management**     | Global `:focus-visible` ring (2 px indigo). Bottom sheets trap Tab, restore focus to the trigger, and close on Escape.                     |
| **ARIA landmarks**       | `<main>` wraps content; each card is a `<section>` with `aria-labelledby`.                                                                 |
| **Live regions**         | Toasts use `aria-live="polite"`; skeleton uses `role="status"`.                                                                            |
| **Icon accessibility**   | Decorative icons have `aria-hidden="true"`. Icon-only buttons have `aria-label`.                                                           |
| **Form semantics**       | The not-found lookup uses a real `<form>` with `<label htmlFor>` and `aria-describedby` for errors. Radio buttons use `fieldset`/`legend`. |
| **Reduced motion**       | `@media (prefers-reduced-motion: reduce)` disables all animations and transitions.                                                         |
| **Colour contrast**      | Slates for body text (≥ 4.5:1 on white); status banners use tinted backgrounds with stronger text (e.g. `amber-800` on `amber-50`).        |
| **Touch targets**        | All controls ≥ 44 px (`min-h-11`).                                                                                                         |
| **Keyboard navigation**  | Full tab order through buttons, sheet close, radio options, and textarea.                                                                  |

---

## 6. Key UX decisions per order scenario

### On-time order (baseline)

- **Tone:** Calm informational (blue). The customer is mid-journey; the goal is
  reassurance and ETA clarity.
- **Next step:** A plain sentence ("Arriving today between 2:42 and 8:42 PM")
  rather than a CTA button — the information itself is the action.
- **Timeline:** The `out_for_delivery` step is `current` with a distance cue
  ("Daniel is 4 stops away"), making the wait feel predictable.

### Delayed order

- **Tone:** Soft amber, never alarm-red. The copy explains the cause (storm
  closed the hub) and confirms the parcel is "safe, moving again."
- **Overdue callout:** A distinct amber box states plainly that the promised
  window passed, without panic-inducing language.
- **Disclosure:** "Why is it late?" is collapsed by default — the explanation
  is available but doesn't dominate the first read.
- **Actions:** "Get help with this delay" (primary) and "View updated delivery
  info" (secondary) — both forward-looking, no false promises of resolution.

### Delivered but not received

- **Tone:** Rose (critical) to signal urgency, but the copy avoids blame words
  like "lost" or "stolen."
- **Honest framing:** The banner states the carrier logged it as delivered and
  that the customer reported it missing — two facts, no invented resolution.
- **Open issue badge:** The report reference (`ISS-48213`) and "waiting for
  carrier trace" status appear prominently so the customer knows a process is
  live.
- **Toast after submit:** "Nothing is resolved yet" is explicit — the system
  does not claim the problem is fixed.

### Tracking not available

- **Tone:** Informational blue — this is expected behaviour, not an error.
- **Explanation over emptiness:** Instead of a blank timeline, `TrackingDetails`
  shows a dashed placeholder card that explains Northwind issues tracking
  numbers after the first scan, with a timeframe.
- **Estimate card:** Uses the `pending` state with "Awaiting dispatch" and a
  note about typical transit times — no fake date is shown.
- **Actions:** "Notify me when tracking is live" (primary) converts anxiety
  into a concrete opt-in; "Contact support" remains available.

There is **one** breakpoint, inherited from Tailwind's `sm` (640 px). Above
640 px the screen gains a subtle side border (`sm:border-x sm:border-slate-200`)
to frame the mobile canvas — no content reflows. Everything below this width is
mobile-optimised by default.

### Layout primitives

- **Header** — sticky, `backdrop-blur`, contains brand icon, order number
  subtitle, and a support shortcut button.
- **Main** — flex column of spaced `SectionCard` blocks, `px-4 pt-4 pb-5`.
- **Footer** — sticky `ScenarioSwitcher` chip bar, `z-30`, `backdrop-blur`.
- **Bottom sheets** — `max-w-[440px]` modal drawers with safe-area padding:
  `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.
