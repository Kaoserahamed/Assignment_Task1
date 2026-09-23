/**
 * Shared domain types for the order tracking experience.
 *
 * Every string that ends with `Label` is already formatted for display. Mock
 * data resolves dates on the server so that the UI never has to format dates
 * during hydration (which keeps server and client markup identical).
 */

/** The three required scenarios plus the happy path used as a baseline. */
export type ScenarioKey = 'on_time' | 'delayed' | 'delivered_not_received' | 'tracking_unavailable';

/** Everything the screen can render, including the non-data UI states. */
export type ViewKey = ScenarioKey | 'loading' | 'error' | 'not_found';

export type StageKey = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

/** Visual state of a single step in the delivery timeline. */
export type StageStatus = 'completed' | 'current' | 'upcoming' | 'exception';

export interface TimelineStage {
  key: StageKey;
  label: string;
  /** Plain-language explanation of what happens at this stage. */
  description: string;
  /** Pre-formatted timestamp, or `null` while the stage is still ahead. */
  timestampLabel: string | null;
  /** When the stage is still ahead, the date/time it is expected to happen. */
  expectedLabel?: string;
  status: StageStatus;
  /** Extra context, used for exception steps (delay reason, delivery dispute…). */
  note?: string;
}

export type EstimateState = 'on_track' | 'revised' | 'pending' | 'delivered';

/** Estimated delivery information, already formatted for display. */
export interface DeliveryEstimate {
  state: EstimateState;
  /** Prominent value: `"Today"`, `"Fri, Sep 25"`, `"Awaiting dispatch"`… */
  value: string;
  /** Time window or short supporting sentence. */
  window?: string;
  /** Secondary sentence, e.g. the original promise that changed. */
  detail?: string;
  /** True when the promised date already passed (drives the overdue styling). */
  isOverdue: boolean;
}

/** Banner tone drives colour, icon and live-region politeness. */
export type StatusTone = 'info' | 'success' | 'warning' | 'critical';

export interface StatusContent {
  /** Small uppercase label above the headline, e.g. `"Delayed"`. */
  eyebrow: string;
  headline: string;
  description: string;
  tone: StatusTone;
  /** Single actionable sentence rendered inside the banner. */
  nextStep?: string;
}

export interface OrderProduct {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  /** Path to a local placeholder image under `public/products`. */
  image: string;
  imageAlt: string;
}

export interface OrderTotalRow {
  label: string;
  amount: number;
  /** Overrides the formatted amount, e.g. `"Free"` for waived shipping. */
  display?: string;
  /** Renders the row as the order grand total. */
  isTotal?: boolean;
  /** Renders the amount as a saving (prefixed with a minus sign). */
  isDiscount?: boolean;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2: string;
}

export interface PaymentInfo {
  method: string;
  last4: string;
}

export interface TrackingInfo {
  carrier: string;
  /** `null` until the carrier issues a number. */
  trackingNumber: string | null;
  /** Last carrier scan, already formatted. */
  lastScanLabel?: string;
}

export interface SupportChannels {
  chatWaitLabel: string;
  phoneLabel: string;
  phoneHref: string;
  emailLabel: string;
  emailHref: string;
  hoursLabel: string;
  responseLabel: string;
}

/** A delivery issue reported by the customer. Never claims a resolution. */
export interface DeliveryIssue {
  reference: string;
  reportedLabel: string;
  summary: string;
  status: 'open' | 'in_review';
  statusLabel: string;
  nextStepNote: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  scenario: ScenarioKey;
  /** Pre-formatted purchase timestamp. */
  placedLabel: string;
  status: StatusContent;
  estimate: DeliveryEstimate;
  stages: TimelineStage[];
  products: OrderProduct[];
  totals: OrderTotalRow[];
  currency: string;
  payment: PaymentInfo;
  shipping: ShippingAddress;
  /** `null` while no carrier tracking is available yet. */
  tracking: TrackingInfo | null;
  /** `null` when a tracking number has not been issued yet. */
  trackingNumberIssuedAtLabel: string | null;
  itemCount: number;
  support: SupportChannels;
  deliveryIssue: DeliveryIssue | null;
}

/** Discriminated union rendered by `OrderTrackingScreen`. */
export type OrderView =
  | { kind: 'order'; order: Order }
  | { kind: 'loading'; caption: string }
  | { kind: 'error'; message: string; detail: string; retryScenario: ScenarioKey }
  | { kind: 'not_found'; message: string; detail: string };

/** Every view the demo can render, keyed for the state switcher. */
export type DemoViews = Record<ViewKey, OrderView>;
