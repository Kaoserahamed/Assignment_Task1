# Testing

This document describes the testing strategy, commands, and validation results
for the order tracking screen.

---

## 1. Testing checklist

### Automated checks (run in CI / locally)

| Check                        | Command                | Result                                         |
| ---------------------------- | ---------------------- | ---------------------------------------------- |
| TypeScript strict type check | `npm run typecheck`    | ✅ Passes — no errors                          |
| ESLint (flat config)         | `npm run lint`         | ✅ Passes — no warnings or errors              |
| Production build             | `npm run build`        | ✅ Passes — Turbopack compiles, 4 static pages |
| Prettier formatting          | `npm run format:check` | ✅ Passes (excluding provided context files)   |
| HTTP smoke test              | `npm run smoke`        | ✅ All 9 page checks + 6 CSS checks pass       |

### Coverage by the smoke test

The smoke test (`scripts/smoke-test.mjs`) is an end-to-end HTTP check that
spins up `next start` and asserts on the **server-rendered HTML** of every
state, plus critical CSS tokens and accessibility invariants.

**Page checks (9):**

1. `on_time` — contains "Your order arrives today", "RVX-48213", "Out for delivery"
2. `delayed` — contains "Your delivery is running late", "Revised estimate", "Why is it late?", "RVX-47988"
3. `delivered_not_received` — contains "Delivered, but not received", "ISS-48213", "Report a delivery issue", "RVX-48102"
4. `tracking_unavailable` — contains "Tracking is not available yet", "Tracking number not issued yet", "Notify me when tracking is live", "RVX-48309"
5. `loading` — contains "Loading tracking updates", "Loading your tracking updates"
6. `error` — contains "We could not load your tracking updates", "Try again", "Contact support"
7. `not_found` — contains "We cannot find that order", "Sample orders", "RVX-48213"
8. Unknown scenario — falls back to the on-time order (single `h1`, "Order tracking")
9. Default route `/` — contains "Order tracking", "Need help with this order?", "Demo states"

**CSS checks (6):**

1. `max-width:440px` — mobile column constraint
2. `overflow-x:clip` — horizontal overflow guard
3. `:has(:checked)` — radio/checkbox card highlighting (ReportIssueSheet)
4. `animation:var(--animate-shimmer)` — skeleton shimmer
5. `min-height:calc(... * 11)` — 44 px touch-target minimum
6. `dvh` — dynamic viewport height

**Accessibility assertions (5, run on every page):**

1. Exactly one `<h1>` per page
2. `<main>` landmark present
3. No button lacks an `aria-label` while containing an `<svg>`
4. At least one focusable element
5. No inline event handlers (`onclick`, `onload`, etc.)

---

## 2. Commands used

```bash
# Static analysis
npx tsc --noEmit        # TypeScript strict check
npm run lint            # ESLint
npx prettier --check .  # Formatting verification

# Build & smoke
npm run build            # Production build
npm run smoke            # Local: starts next start on :4321, runs all checks

# Deploy verification (requires network to Vercel)
SMOKE_BASE_URL=https://order-tracking-screen-six.vercel.app npm run smoke
```

### Exit codes

- `npm run smoke` exits with code `1` if any check fails, `0` on success.
- `tsc --noEmit` and `eslint .` both exit non-zero on any type or lint error.

---

## 3. Responsive testing approach

The layout is verified at the three target widths by:

1. **CSS token assertion** — the smoke test confirms `max-width:440px` (the
   column cap) and `overflow-x:clip` (no horizontal scroll) are present in
   the compiled stylesheet.
2. **Visual inspection** — screenshots were captured at 360 px (see
   `docs/screenshots/`):
   - `on-time-360.png`
   - `delayed-360.png`
   - `delivered-not-received-360.png`
   - `tracking-unavailable-360.png`
3. **Touch-target audit** — the smoke test asserts `min-height:calc(... * 11)`
   (44 px = `min-h-11`) is in the compiled CSS, covering all buttons and inputs.
4. **Viewport meta** — `layout.tsx` sets `width=device-width`,
   `initialScale: 1`, `viewportFit: cover` and `themeColor`, ensuring proper
   mobile rendering (no zoom, safe-area support).

To manually verify in a browser:

- Open DevTools → Toggle device toolbar.
- Select presets: **iPhone SE (320 px)**, **Pixel 5 (360 px)**,
  **iPhone 14 (390 px)**, **iPhone 15 Pro Max (430 px)**.
- Confirm: no horizontal scroll, cards stack vertically, all text is legible,
  buttons are fully tappable.

---

## 4. Order state testing

Each scenario is tested via its `?scenario=` URL:

| Scenario                | URL                                 | Key assertions                                                                                                            |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| On time                 | `/?scenario=on_time`                | "Your order arrives today", "RVX-48213", timeline shows "Out for delivery" as current                                     |
| Delayed                 | `/?scenario=delayed`                | "Your delivery is running late", "Revised estimate", overdue callout, "Why is it late?" disclosure present, "RVX-47988"   |
| Delivered, not received | `/?scenario=delivered_not_received` | "Delivered, but not received", "ISS-48213" issue reference, "Report a delivery issue" button, "RVX-48102"                 |
| Tracking unavailable    | `/?scenario=tracking_unavailable`   | "Tracking is not available yet", "Tracking number not issued yet", "Notify me when tracking is live", "Awaiting dispatch" |
| Loading                 | `/?scenario=loading`                | "Loading tracking updates", skeleton shimmer animation present                                                            |
| Error                   | `/?scenario=error`                  | "We could not load your tracking updates", retry button, contact support link                                             |
| Not found               | `/?scenario=not_found`              | "We cannot find that order", lookup form with sample order chips                                                          |
| Unknown                 | `/?scenario=does-not-exist`         | Falls back to on-time order; single `h1` preserved                                                                        |

### Interaction testing (manual)

| Interaction                                    | Expected result                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Click "View order details"                     | Bottom sheet opens with full order breakdown; Close button works                                             |
| Click "Contact support"                        | Support sheet opens with chat/phone/email; Escape closes                                                     |
| Click "Report a delivery issue"                | Report sheet opens; form validates on submit (requires reason + checkbox)                                    |
| Submit report form                             | Toast appears: "Delivery issue submitted… nothing is resolved yet"; open-issue badge shows in SupportActions |
| Click "Copy" on tracking number                | Toast: "Tracking number copied"                                                                              |
| Click refresh in timeline                      | Spinner animates; toast: "Tracking refreshed"                                                                |
| Toggle notifications                           | Toast confirms on/off state                                                                                  |
| Click "Load the delayed order" (loading state) | Switches to the delayed scenario                                                                             |
| Type wrong order number + submit (not-found)   | Inline error: "No order matches…"                                                                            |
| Click sample order chip (not-found)            | Loads that order scenario                                                                                    |

---

## 5. Known limitations

- The smoke test asserts on **server-rendered HTML** only. Client-side
  interactions (sheet animations, toast appearance) are verified manually, not
  by automated assertions.
- There is no visual-regression suite (e.g. Percy/Chromatic). Screenshots in
  `docs/screenshots/` are the only visual record.
- Browser support is not explicitly tested beyond Chromium-based rendering via
  `next start`. The code targets modern browsers (Tailwind JIT, `:has()`,
  `env(safe-area-inset-*)` are not polyfilled).
- The external Vercel deployment could not be reached from the build
  environment (network restriction), so the smoke test was validated against
  the local production server (`next start`). The Vercel deployment itself
  was confirmed successful via the `vercel deploy --prod` CLI step.
