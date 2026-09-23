import type {
  DemoViews,
  DeliveryEstimate,
  DeliveryIssue,
  Order,
  OrderProduct,
  OrderTotalRow,
  ScenarioKey,
  StatusContent,
  SupportChannels,
  TimelineStage,
  TrackingInfo,
  ViewKey,
} from '@/types/order';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const TAX_RATE = 0.085;
const CURRENCY = 'USD';

/* ------------------------------------------------------------------------- */
/* Date helpers                                                              */
/*                                                                            */
/* All date formatting happens here, on the server, so components only ever    */
/* render pre-formatted strings. Server and client markup therefore match      */
/* even when the visitor's timezone differs from the server's.                */
/* ------------------------------------------------------------------------- */

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

function clock(date: Date): string {
  return timeFormatter.format(date);
}

function utcDayNumber(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
}

/** Pins a timestamp to a fixed UTC hour on the day `days` away from today. */
function atDayOffset(reference: Date, days: number, hour = 9, minute = 0): Date {
  const date = new Date(reference.getTime() + days * DAY_MS);
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}

function hoursAgo(reference: Date, hours: number): Date {
  return new Date(reference.getTime() - hours * HOUR_MS);
}

function minutesAgo(reference: Date, minutes: number): Date {
  return new Date(reference.getTime() - minutes * MINUTE_MS);
}

function dayDiff(target: Date, reference: Date): number {
  return utcDayNumber(target) - utcDayNumber(reference);
}

/** `"Today at 7:42 AM"`, `"Yesterday at 2:14 PM"`, `"Sat, Sep 20"`. */
function eventLabel(date: Date, reference: Date): string {
  const diff = dayDiff(date, reference);
  const time = timeFormatter.format(date);

  if (diff === 0) return `Today at ${time}`;
  if (diff === -1) return `Yesterday at ${time}`;
  if (diff <= -2 && diff >= -6) return `${dateFormatter.format(date)} at ${time}`;
  return dateFormatter.format(date);
}

/** `"Today"`, `"Tomorrow"`, `"Fri, Sep 25"`. */
function dayLabel(date: Date, reference: Date): string {
  const diff = dayDiff(date, reference);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return dateFormatter.format(date);
}

/* ------------------------------------------------------------------------- */
/* Catalogue and support channels                                            */
/* ------------------------------------------------------------------------- */

interface CatalogItem {
  id: string;
  name: string;
  variant: string;
  unitPrice: number;
  image: string;
  imageAlt: string;
}

const CATALOG = {
  tote: {
    id: 'prd_tote',
    name: 'Aria Merino Tote',
    variant: 'Charcoal · One size',
    unitPrice: 128,
    image: '/products/tote.svg',
    imageAlt: 'Placeholder illustration of a charcoal merino tote bag',
  },
  bottle: {
    id: 'prd_bottle',
    name: 'Everyday Insulated Bottle',
    variant: 'Sage · 750 ml',
    unitPrice: 34,
    image: '/products/bottle.svg',
    imageAlt: 'Placeholder illustration of a sage green insulated bottle',
  },
  mugs: {
    id: 'prd_mugs',
    name: 'Stoneware Mug Set',
    variant: 'Clay · Set of 2',
    unitPrice: 42,
    image: '/products/mug.svg',
    imageAlt: 'Placeholder illustration of a stoneware mug',
  },
  sneakers: {
    id: 'prd_sneakers',
    name: 'Trail Runner Sneakers',
    variant: 'Storm · UK 9',
    unitPrice: 119,
    image: '/products/sneaker.svg',
    imageAlt: 'Placeholder illustration of a trail running sneaker',
  },
} satisfies Record<string, CatalogItem>;

function item(key: keyof typeof CATALOG, quantity: number): OrderProduct {
  return { ...CATALOG[key], quantity };
}

const SUPPORT_CHANNELS: SupportChannels = {
  chatWaitLabel: 'Live chat · usually answers in under 2 minutes',
  phoneLabel: '+1 (800) 555-0134',
  phoneHref: 'tel:+18005550134',
  emailLabel: 'support@rovex.example',
  emailHref: 'mailto:support@rovex.example',
  hoursLabel: 'Open daily · 7:00 AM – 11:00 PM PT',
  responseLabel: 'Email replies within 24 hours',
};

/* ------------------------------------------------------------------------- */
/* Order factory                                                             */
/* ------------------------------------------------------------------------- */

interface BuildOrderInput {
  orderNumber: string;
  scenario: ScenarioKey;
  reference: Date;
  placedAt: Date;
  status: StatusContent;
  estimate: DeliveryEstimate;
  stages: TimelineStage[];
  products: OrderProduct[];
  tracking: TrackingInfo | null;
  trackingNumberIssuedAt?: Date | null;
  deliveryIssue?: DeliveryIssue | null;
  discount?: number;
  shippingFee?: number;
}

function buildOrder({
  orderNumber,
  scenario,
  reference,
  placedAt,
  status,
  estimate,
  stages,
  products,
  tracking,
  trackingNumberIssuedAt = null,
  deliveryIssue = null,
  discount = 0,
  shippingFee = 0,
}: BuildOrderInput): Order {
  const subtotal = products.reduce((sum, product) => sum + product.unitPrice * product.quantity, 0);
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + shippingFee + tax) * 100) / 100;

  const totals: OrderTotalRow[] = [
    { label: 'Subtotal', amount: subtotal },
    ...(discount > 0 ? [{ label: 'Promo WELCOME10', amount: discount, isDiscount: true }] : []),
    { label: 'Shipping', amount: shippingFee, display: shippingFee === 0 ? 'Free' : undefined },
    { label: 'Estimated tax', amount: tax },
    { label: 'Total paid', amount: total, isTotal: true },
  ];

  return {
    id: `ord_${orderNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    orderNumber,
    scenario,
    placedLabel: eventLabel(placedAt, reference),
    status,
    estimate,
    stages,
    products,
    totals,
    currency: CURRENCY,
    payment: { method: 'Visa', last4: '4242' },
    shipping: {
      name: 'Alex Rivera',
      line1: '1420 Bayview Terrace, Apt 6B',
      line2: 'Oakland, CA 94607',
    },
    tracking,
    trackingNumberIssuedAtLabel: trackingNumberIssuedAt
      ? eventLabel(trackingNumberIssuedAt, reference)
      : null,
    itemCount: products.reduce((sum, product) => sum + product.quantity, 0),
    support: SUPPORT_CHANNELS,
    deliveryIssue,
  };
}

/* ------------------------------------------------------------------------- */
/* Scenario 1 — order on time (baseline used by the state switcher)          */
/* ------------------------------------------------------------------------- */

function createOnTimeOrder(reference: Date): Order {
  const placedAt = atDayOffset(reference, -3, 15, 42);
  const shippedAt = atDayOffset(reference, -2, 10, 12);
  const trackingIssuedAt = atDayOffset(reference, -3, 18, 5);
  const outForDeliveryAt = minutesAgo(reference, 68);
  const windowStart = new Date(reference.getTime() + 90 * MINUTE_MS);
  const windowEnd = new Date(windowStart.getTime() + 6 * HOUR_MS);

  return buildOrder({
    orderNumber: 'RVX-48213',
    scenario: 'on_time',
    reference,
    placedAt,
    status: {
      eyebrow: 'Out for delivery',
      headline: 'Your order arrives today',
      description:
        'Daniel is on the last leg with your parcel. He will leave it at the front door and send a photo confirmation unless you change the drop-off option.',
      tone: 'info',
      nextStep: `Arriving ${dayLabel(windowStart, reference).toLowerCase()} between ${clock(windowStart)} and ${clock(windowEnd)}.`,
    },
    estimate: {
      state: 'on_track',
      value: dayLabel(windowStart, reference),
      window: `Between ${clock(windowStart)} and ${clock(windowEnd)}`,
      detail: 'Photo confirmation is sent as soon as the parcel is dropped off.',
      isOverdue: false,
    },
    stages: [
      {
        key: 'processing',
        label: 'Order confirmed',
        description: 'Payment approved and the parcel was packed at the Oakland fulfilment centre.',
        timestampLabel: eventLabel(placedAt, reference),
        status: 'completed',
      },
      {
        key: 'shipped',
        label: 'Shipped',
        description: 'Collected by Northwind Express and scanned into their network.',
        timestampLabel: eventLabel(shippedAt, reference),
        status: 'completed',
      },
      {
        key: 'out_for_delivery',
        label: 'Out for delivery',
        description: 'Loaded on the delivery van for your address.',
        timestampLabel: eventLabel(outForDeliveryAt, reference),
        status: 'current',
        note: 'Daniel is 4 stops away.',
      },
      {
        key: 'delivered',
        label: 'Delivered',
        description: 'Left at the front door with a photo confirmation.',
        timestampLabel: null,
        expectedLabel: `${dayLabel(windowStart, reference)} between ${clock(windowStart)} and ${clock(windowEnd)}`,
        status: 'upcoming',
      },
    ],
    products: [item('tote', 1), item('bottle', 1)],
    tracking: {
      carrier: 'Northwind Express',
      trackingNumber: 'NWX-4471-8890-231',
      lastScanLabel: `Out for delivery · ${eventLabel(outForDeliveryAt, reference)}`,
    },
    trackingNumberIssuedAt: trackingIssuedAt,
  });
}

/* ------------------------------------------------------------------------- */
/* Scenario 2 — delayed order                                                */
/* ------------------------------------------------------------------------- */

function createDelayedOrder(reference: Date): Order {
  const placedAt = atDayOffset(reference, -7, 11, 5);
  const shippedAt = atDayOffset(reference, -5, 10, 12);
  const trackingIssuedAt = atDayOffset(reference, -5, 13, 40);
  const originalPromise = atDayOffset(reference, -3, 12, 0);
  const hubScanAt = hoursAgo(reference, 26);
  const revisedStart = atDayOffset(reference, 1, 9, 0);
  const revisedEnd = atDayOffset(reference, 1, 18, 0);

  return buildOrder({
    orderNumber: 'RVX-47988',
    scenario: 'delayed',
    reference,
    placedAt,
    status: {
      eyebrow: 'Delayed',
      headline: 'Your delivery is running late',
      description:
        'A storm closed the Bayview sorting hub for 36 hours, so your parcel missed its delivery slot. It is safe, moving again, and we refresh this page every few hours.',
      tone: 'warning',
      nextStep: `New estimate: ${dayLabel(revisedStart, reference)} between ${clock(revisedStart)} and ${clock(revisedEnd)}.`,
    },
    estimate: {
      state: 'revised',
      value: dayLabel(revisedStart, reference),
      window: `Between ${clock(revisedStart)} and ${clock(revisedEnd)}`,
      detail: `Original estimate was ${dateFormatter.format(originalPromise)} — that window has passed.`,
      isOverdue: true,
    },
    stages: [
      {
        key: 'processing',
        label: 'Order confirmed',
        description: 'Payment approved and the parcel was packed at the Oakland fulfilment centre.',
        timestampLabel: eventLabel(placedAt, reference),
        status: 'completed',
      },
      {
        key: 'shipped',
        label: 'Shipped',
        description: 'Collected by Northwind Express and scanned into their network.',
        timestampLabel: eventLabel(shippedAt, reference),
        status: 'completed',
      },
      {
        key: 'out_for_delivery',
        label: 'Out for delivery',
        description: 'Waiting at the Bayview regional hub before the final leg to your depot.',
        timestampLabel: null,
        expectedLabel: `Originally expected ${dateFormatter.format(originalPromise)}`,
        status: 'exception',
        note: 'Held at Bayview for 36 hours because of a storm closure. Scanned again 26 hours ago and moving to your local depot.',
      },
      {
        key: 'delivered',
        label: 'Delivered',
        description: 'Left at the front door with a photo confirmation.',
        timestampLabel: null,
        expectedLabel: `${dayLabel(revisedStart, reference)} between ${clock(revisedStart)} and ${clock(revisedEnd)}`,
        status: 'upcoming',
      },
    ],
    products: [item('mugs', 2), item('bottle', 1)],
    discount: 10,
    tracking: {
      carrier: 'Northwind Express',
      trackingNumber: 'NWX-4471-2210-774',
      lastScanLabel: `Arrived at Bayview hub · ${eventLabel(hubScanAt, reference)}`,
    },
    trackingNumberIssuedAt: trackingIssuedAt,
  });
}

/* ------------------------------------------------------------------------- */
/* Scenario 3 — marked delivered, but the customer did not receive it        */
/* ------------------------------------------------------------------------- */

function createDeliveredNotReceivedOrder(reference: Date): Order {
  const placedAt = atDayOffset(reference, -6, 18, 30);
  const shippedAt = atDayOffset(reference, -4, 9, 40);
  const outForDeliveryAt = atDayOffset(reference, -1, 7, 55);
  const deliveredAt = atDayOffset(reference, -1, 14, 14);
  const reportedAt = atDayOffset(reference, -1, 16, 2);
  const trackingIssuedAt = atDayOffset(reference, -4, 12, 15);

  return buildOrder({
    orderNumber: 'RVX-48102',
    scenario: 'delivered_not_received',
    reference,
    placedAt,
    status: {
      eyebrow: 'Marked as delivered',
      headline: 'Delivered, but not received',
      description: `Northwind Express closed this delivery on ${dateFormatter.format(deliveredAt)} at ${clock(deliveredAt)} and logged it as "left at the front door". You told us the parcel was not there.`,
      tone: 'critical',
      nextStep:
        'Your report is open — contact support to add details, or check the delivery steps below.',
    },
    estimate: {
      state: 'delivered',
      value: 'Delivered',
      window: `Marked delivered ${eventLabel(deliveredAt, reference)}`,
      detail:
        'The carrier logged the drop-off as "left at the front door" with no signature required.',
      isOverdue: false,
    },
    stages: [
      {
        key: 'processing',
        label: 'Order confirmed',
        description: 'Payment approved and the parcel was packed at the Oakland fulfilment centre.',
        timestampLabel: eventLabel(placedAt, reference),
        status: 'completed',
      },
      {
        key: 'shipped',
        label: 'Shipped',
        description: 'Collected by Northwind Express and scanned into their network.',
        timestampLabel: eventLabel(shippedAt, reference),
        status: 'completed',
      },
      {
        key: 'out_for_delivery',
        label: 'Out for delivery',
        description: 'Loaded on the delivery van for your address.',
        timestampLabel: eventLabel(outForDeliveryAt, reference),
        status: 'completed',
      },
      {
        key: 'delivered',
        label: 'Delivered',
        description: 'Carrier logged the parcel as delivered to your address.',
        timestampLabel: eventLabel(deliveredAt, reference),
        status: 'exception',
        note: `You reported the parcel missing ${eventLabel(reportedAt, reference)}. No resolution yet — support is reviewing it with the carrier.`,
      },
    ],
    products: [item('sneakers', 1)],
    shippingFee: 6.99,
    tracking: {
      carrier: 'Northwind Express',
      trackingNumber: 'NWX-4471-5560-118',
      lastScanLabel: `Delivered · ${eventLabel(deliveredAt, reference)}`,
    },
    trackingNumberIssuedAt: trackingIssuedAt,
    deliveryIssue: {
      reference: 'ISS-48213',
      reportedLabel: eventLabel(reportedAt, reference),
      summary: 'You reported: parcel marked delivered but not received.',
      status: 'open',
      statusLabel: 'Open · waiting for the carrier trace',
      nextStepNote:
        'Nothing is resolved yet. You can add details to this report or ask support to call you back.',
    },
  });
}

/* ------------------------------------------------------------------------- */
/* Scenario 4 — tracking not available yet                                   */
/* ------------------------------------------------------------------------- */

function createTrackingUnavailableOrder(reference: Date): Order {
  const placedAt = hoursAgo(reference, 5);

  return buildOrder({
    orderNumber: 'RVX-48309',
    scenario: 'tracking_unavailable',
    reference,
    placedAt,
    status: {
      eyebrow: 'Order confirmed',
      headline: 'Tracking is not available yet',
      description:
        'Your order is confirmed and being packed at the Oakland fulfilment centre. A tracking number shows up here as soon as Northwind Express scans the parcel.',
      tone: 'info',
      nextStep: 'We email you the moment tracking goes live.',
    },
    estimate: {
      state: 'pending',
      value: 'Awaiting dispatch',
      window:
        'The delivery estimate appears once the carrier collects the parcel — usually within 24 hours.',
      detail: 'Typical transit after dispatch: 3–5 business days.',
      isOverdue: false,
    },
    stages: [
      {
        key: 'processing',
        label: 'Order confirmed',
        description: 'Payment approved. Your items are being picked and packed.',
        timestampLabel: eventLabel(placedAt, reference),
        status: 'current',
        note: 'Tracking steps appear after the first carrier scan.',
      },
      {
        key: 'shipped',
        label: 'Shipped',
        description: 'The parcel leaves the fulfilment centre with Northwind Express.',
        timestampLabel: null,
        expectedLabel: 'Usually within 24 hours of ordering',
        status: 'upcoming',
      },
      {
        key: 'out_for_delivery',
        label: 'Out for delivery',
        description: 'Loaded on the delivery van for your address.',
        timestampLabel: null,
        status: 'upcoming',
      },
      {
        key: 'delivered',
        label: 'Delivered',
        description: 'Left at the front door with a photo confirmation.',
        timestampLabel: null,
        status: 'upcoming',
      },
    ],
    products: [item('bottle', 2), item('tote', 1)],
    tracking: null,
  });
}

/* ------------------------------------------------------------------------- */
/* Public API                                                                */
/* ------------------------------------------------------------------------- */

/** The three required scenarios plus the on-time baseline. */
export const SCENARIO_KEYS: ScenarioKey[] = [
  'on_time',
  'delayed',
  'delivered_not_received',
  'tracking_unavailable',
];

/** Non-data UI states the screen can render, used by the demo switcher. */
export const UI_STATE_KEYS: ViewKey[] = ['loading', 'error', 'not_found'];

export const VIEW_META: Record<ViewKey, { label: string; blurb: string }> = {
  on_time: { label: 'On time', blurb: 'Happy path: out for delivery, arriving today.' },
  delayed: { label: 'Delayed', blurb: 'Original window missed, revised estimate shown.' },
  delivered_not_received: {
    label: 'Delivered, not received',
    blurb: 'Carrier closed the delivery, customer says the parcel is missing.',
  },
  tracking_unavailable: {
    label: 'No tracking yet',
    blurb: 'Order confirmed, carrier has not scanned the parcel.',
  },
  loading: { label: 'Loading', blurb: 'Skeleton shown while tracking data is fetched.' },
  error: { label: 'Error', blurb: 'Tracking service failed; retry is offered.' },
  not_found: { label: 'Not found', blurb: 'No order matches the requested reference.' },
};

export function createScenarioOrders(reference: Date): Record<ScenarioKey, Order> {
  return {
    on_time: createOnTimeOrder(reference),
    delayed: createDelayedOrder(reference),
    delivered_not_received: createDeliveredNotReceivedOrder(reference),
    tracking_unavailable: createTrackingUnavailableOrder(reference),
  };
}

/** Builds every view the demo screen can render for the given moment. */
export function createDemoViews(reference: Date): DemoViews {
  const orders = createScenarioOrders(reference);

  return {
    on_time: { kind: 'order', order: orders.on_time },
    delayed: { kind: 'order', order: orders.delayed },
    delivered_not_received: { kind: 'order', order: orders.delivered_not_received },
    tracking_unavailable: { kind: 'order', order: orders.tracking_unavailable },
    loading: {
      kind: 'loading',
      caption: 'Fetching the latest tracking updates for this order…',
    },
    error: {
      kind: 'error',
      message: 'We could not load your tracking updates',
      detail:
        'The tracking service did not respond. Your order is safe and nothing has been lost — try again in a moment.',
      retryScenario: 'delayed',
    },
    not_found: {
      kind: 'not_found',
      message: 'We cannot find that order',
      detail:
        'Check the order number and try again, or open one of the sample orders from the demo bar below.',
    },
  };
}

export function normalizeOrderNumber(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

/** Mock "lookup" behind the not-found state: resolves a typed order number. */
export function findScenarioForOrderNumber(
  orders: Record<ScenarioKey, Order>,
  value: string
): ScenarioKey | null {
  const needle = normalizeOrderNumber(value);
  if (!needle) return null;

  return (
    SCENARIO_KEYS.find((key) => normalizeOrderNumber(orders[key].orderNumber) === needle) ?? null
  );
}
