# Architecture

This document describes the component architecture, data model, state
management, and extension strategy for the Rovex order tracking screen.

---

## 1. High-level overview

The application is a **single-page, server-rendered** Next.js route that
renders one of several possible "views" of an order. There is no client-side
router — the selected view is encoded in a `?scenario=` query parameter so that
every state is shareable and crawlable.

```
browser ──GET /?scenario=delayed──► app/page.tsx (SSR)
                                      │
                                      ▼
                          OrderTrackingScreen (client component)
                                      │  renders one <OrderView>
                                      ▼
                          reusable presentational components
```

### Server vs. client boundary

| Layer             | Location                                          | Responsibility                                                                                                      |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Route handler** | `app/page.tsx`                                    | `async` server component. Reads `searchParams`, builds mock data from the current date, passes props to the screen. |
| **Orchestration** | `OrderTrackingScreen.tsx`                         | `'use client'`. Owns all interaction state (active view, open sheet, refresh, toasts).                              |
| **Presentation**  | `components/order-tracking/*` + `components/ui/*` | Pure, reusable components that receive data via props.                                                              |
| **Data model**    | `types/order.ts`, `data/mock-orders.ts`           | Type definitions and mock-data factory.                                                                             |

Only `OrderTrackingScreen` and the sheet components are marked `'use client'`.
Everything else is SSR-friendly, which means the initial HTML is fully
populated and the smoke test can assert on server-rendered markup.

---

## 2. Component tree

```
OrderTrackingPage (app/page.tsx)  [server]
├── ToastProvider (components/ui/Toast.tsx)  [client]
└── OrderTrackingScreen  [client]
    ├── header
    │   ├── brand icon + title + order subtitle
    │   └── support button → opens SupportSheet
    ├── main
    │   │   (one of the following, based on `view.kind`)
    │   ├── kind: 'order'
    │   │   ├── StatusBanner        ← eyebrow, h1, description, next step, "why late?"
    │   │   ├── DeliveryEstimateCard  ← estimated delivery with badge + overdue notice
    │   │   ├── DeliveryTimeline     ← vertical stage list (4 stages)
    │   │   ├── OrderSummary         ← products + payment breakdown
    │   │   ├── TrackingDetails      ← carrier, tracking number, address
    │   │   └── SupportActions       ← scenario-aware buttons
    │   ├── kind: 'loading'
    │   │   └── TrackingSkeleton + hint card
    │   ├── kind: 'error'
    │   │   └── TrackingErrorState (retry + support)
    │   └── kind: 'not_found'
    │       └── OrderNotFoundState (lookup form + sample chips)
    └── bottom sheets (portaled)
        ├── OrderDetailsSheet  ← full order breakdown
        ├── SupportSheet       ← chat (mock) + phone + email
        └── ReportIssueSheet   ← validated delivery-issue form
```

The **`ScenarioSwitcher`** is a sticky chip bar at the bottom of the screen
The **`ScenarioSwitcher`** is a sticky chip bar at the bottom of the screen
used only for demo review; it is not part of a production order screen.

---

## 3. Component responsibilities

### `OrderTrackingScreen` (orchestrator)

Holds all local interaction state and delegates rendering to presentational
children:

| State             | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `viewKey`         | Active demo view (`on_time`, `delayed`, …). Synced to `?scenario=`. |
| `openSheet`       | Which bottom sheet is open (`details`, `support`, `report`).        |
| `isRefreshing`    | Spinner state for the timeline refresh button.                      |
| `updatedLabel`    | "Updated just now" / "Updated with the latest carrier scan".        |
| `notificationsOn` | Whether the customer opted into tracking-live notifications.        |
| `reportSubmitted` | Shows the "submission confirmed" banner after a report.             |
| `isRetrying`      | Spinner state for the error-state retry button.                     |
| `lookupError`     | Inline validation error for the not-found lookup form.              |

It also wires up URL sync (`history.pushState`), `popstate` handling, and
timers that are cleaned up on unmount to prevent leaks.

### Presentational components

| Component              | File                       | Props                                                                  | Notes                                                                       |
| ---------------------- | -------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `StatusBanner`         | `StatusBanner.tsx`         | `status`, `headingId`, `exceptionNote?`                                | Tone-driven colour/icon; `h1` headline; optional `<details>` disclosure.    |
| `DeliveryEstimateCard` | `DeliveryEstimateCard.tsx` | `estimate`, `headingId`, `hasOpenIssue?`                               | Badge per `EstimateState`; overdue callout when `isOverdue`.                |
| `DeliveryTimeline`     | `DeliveryTimeline.tsx`     | `stages`, `headingId`, `updatedLabel`, `isRefreshing`, `onRefresh`     | `aria-current="step"` on the active step; screen-reader status text.        |
| `OrderSummary`         | `OrderSummary.tsx`         | `order`, `headingId`, `onViewDetails`                                  | `next/image` for product thumbnails, currency via `formatCurrency()`.       |
| `TrackingDetails`      | `TrackingDetails.tsx`      | `order`, `headingId`, `onCopyTrackingNumber`                           | Falls back to an informative placeholder when no tracking number exists.    |
| `SupportActions`       | `SupportActions.tsx`       | `order`, `headingId`, `notificationsOn`, `reportSubmitted`, `onAction` | `SCENARIO_ACTIONS` map drives primary/secondary button labels and variants. |
| `ScenarioSwitcher`     | `ScenarioSwitcher.tsx`     | `active`, `onChange`                                                   | Collapsible chip bar; `aria-pressed` on each chip.                          |

### Bottom-sheet components

| Sheet               | Triggers from                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `OrderDetailsSheet` | Order Summary → "View order details"                                                                                 |
| `SupportSheet`      | Header support button, Status Banner next-step, Support Actions → "Contact support", Error state → "Contact support" |
| `ReportIssueSheet`  | Support Actions → "Report a delivery issue" (delivered-not-received scenario)                                        |

All three use the shared `BottomSheet` primitive (portal, focus trap, Escape
to close, scroll lock, focus restoration).

### UI primitives (`components/ui`)

| Primitive              | Purpose                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| `Button`               | `buttonClasses()` helper for consistent classes across `<button>` and `<a>`. |
| `Card` / `SectionCard` | Card wrapper with header (title + description + action) and body.            |
| `Badge`                | Tone-driven status badge.                                                    |
| `Skeleton`             | Shimmer placeholder for the loading state.                                   |
| `BottomSheet`          | Accessible modal drawer.                                                     |
| `Toast`                | Polite live-region notification queue.                                       |

---

## 4. Data model

### Mock data (`data/mock-orders.ts`)

A `buildOrder()` factory computes totals (subtotal, tax at 8.5 %, promo,
shipping) and assembles the `Order` shape from simpler inputs. Four scenario
factories (`createOnTimeOrder`, `createDelayedOrder`,
`createDeliveredNotReceivedOrder`, `createTrackingUnavailableOrder`) build the
sample orders from a reference date, using helpers (`atDayOffset`,
`minutesAgo`, `eventLabel`, `dayLabel`, `clock`) that format in UTC.

Key functions exported from this module:

- `createScenarioOrders(reference)` → `Record<ScenarioKey, Order>`
- `createDemoViews(reference)` → `DemoViews` (every view the switcher can show)
- `findScenarioForOrderNumber(orders, value)` → mock "lookup by order number"
- `normalizeOrderNumber(value)` → strips non-alphanumerics
- `SCENARIO_KEYS`, `UI_STATE_KEYS`, `VIEW_META` → metadata for the switcher

---

## 5. State management

There is **no global store** (Redux, Zustand, etc.). State lives entirely in
`OrderTrackingScreen` via `useState` and `useCallback` handlers. This is
intentional — the screen has no remote data-fetching layer, so a store would
add complexity without benefit.

The data flow is strictly **top-down**:

```
page.tsx (server)
  → builds views + orders (date-aware mock data)
  → passes as props
    → OrderTrackingScreen (owns UI state)
      → passes props + callbacks to presentational children
```

Bottom sheets receive `open`/`onClose` booleans from the parent; they do not
manage their own visibility. Toast notifications are delivered through a

### State 2 — Delivered but not received (`delivered_not_received`)

- `status.tone = 'critical'` (rose) → red banner.
- `estimate.state = 'delivered'` with a "marked delivered" detail.
- Timeline `delivered` step has `status: 'exception'` and a `note` stating the
  customer reported it missing; `deliveryIssue` is populated.
- `SupportActions` shows the open issue (reference, status, next step) and
  offers "Report a delivery issue" (primary, danger) + "Contact support"
  (secondary).
- Submitting the report form opens a toast **emphasising nothing is resolved
  yet**.

### State 3 — Tracking not available (`tracking_unavailable`)

- `tracking = null` (no carrier number).
- `status.tone = 'info'` but `headline = 'Tracking is not available yet'`.
- `estimate.state = 'pending'`: value = "Awaiting dispatch", with explanation
  text instead of a date.
- Timeline stays on the `processing` stage (current) with an explanatory note;
  the remaining stages are `upcoming`.
- `TrackingDetails` renders a dashed-placeholder card explaining no number has
  been issued yet.
- `SupportActions` primary button = "Notify me when tracking is live"
  (toggles `notificationsOn`).

---

## 7. Extending with a backend

The component pipeline is already backend-agnostic. To connect real data:

1. **Replace mock data in `page.tsx`.** Swap `createScenarioOrders()` and
   `createDemoViews()` for an API call that returns the same `Order` shape.
   The `?scenario=` param would be replaced by a real order identifier.

2. **Type mapping.** The API responses would be mapped to the existing types
   in `types/order.ts`. The server-side formatters (`Intl.DateTimeFormat`
   helpers in `mock-orders.ts`) would move to a shared `lib/` module so both
   the data layer and tests can use them.

3. **Loading states.** The existing `TrackingSkeleton` and
   `TrackingErrorState` are designed to drop in — wire `isRefreshing`,
   `isRetrying`, and the error message from the API response.

4. **Authentication.** The `page.tsx` route would read a session cookie (or
   `vercel/auth`) and redirect unauthenticated visitors to login.

5. **Real-time updates.** The refresh button (`onRefresh`) already has a
   loading state; replace the local `setTimeout` with a real fetch and poll
   on an interval when the sheet is open.

No component signatures would need to change — only the data source in
`page.tsx` and the mock helpers that become real API calls.
`ToastProvider` context so any handler can call `showToast()`.

---

## 6. How the three required order states are handled

All three scenarios reuse the **same component pipeline**
(`StatusBanner → DeliveryEstimateCard → DeliveryTimeline → OrderSummary →
TrackingDetails → SupportActions`). They differ only in **data** and in the
**action map**:

### State 1 — Delayed (`delayed`)

- `status.tone = 'warning'` (amber) → `StatusBanner` uses the warning style.
- `status.eyebrow = 'Delayed'`, `headline = 'Your delivery is running late'`.
- `estimate.state = 'revised'`, `isOverdue = true` → estimate card shows the
  revised date and an overdue callout.
- Timeline `out_for_delivery` stage has `status: 'exception'` with a `note`
  explaining the storm delay; the `StatusBanner` renders an
  `exceptionNote` disclosure ("Why is it late?").
- `SupportActions` primary button = "Get help with this delay".

### Types (`types/order.ts`)

The data model is designed so that **all display strings are pre-formatted on
the server**. Components never call `Intl` or date helpers — they just render
the strings they receive. This keeps SSR output stable and avoids hydration
mismatch warnings.

```
Order
├── id, orderNumber, scenario
├── placedLabel            ← "Today at 3:05 PM"
├── status                 ← StatusContent (eyebrow, headline, description, tone, nextStep)
├── estimate               ← DeliveryEstimate (state, value, window, detail, isOverdue)
├── stages                 ← TimelineStage[] (each: key, label, description, timestamp, status, note?)
├── products               ← OrderProduct[]
├── totals                 ← OrderTotalRow[]
├── currency, payment, shipping
├── tracking               ← TrackingInfo | null
├── deliveryIssue          ← DeliveryIssue | null
└── support                ← SupportChannels
```

**`ViewKey`** is a discriminated union:

```ts
type OrderView =
  | { kind: 'order'; order: Order }
  | { kind: 'loading'; caption: string }
  | { kind: 'error'; message: string; detail: string; retryScenario: ScenarioKey }
  | { kind: 'not_found'; message: string; detail: string };
```
