'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CircleHelp, Package } from 'lucide-react';
import { DeliveryEstimateCard } from '@/components/order-tracking/DeliveryEstimateCard';
import { DeliveryTimeline } from '@/components/order-tracking/DeliveryTimeline';
import { OrderDetailsSheet } from '@/components/order-tracking/OrderDetailsSheet';
import { OrderSummary } from '@/components/order-tracking/OrderSummary';
import {
  ReportIssueSheet,
  type ReportIssuePayload,
} from '@/components/order-tracking/ReportIssueSheet';
import { ScenarioSwitcher } from '@/components/order-tracking/ScenarioSwitcher';
import { StatusBanner } from '@/components/order-tracking/StatusBanner';
import { SupportActions, type SupportActionId } from '@/components/order-tracking/SupportActions';
import { SupportSheet } from '@/components/order-tracking/SupportSheet';
import { TrackingDetails } from '@/components/order-tracking/TrackingDetails';
import {
  OrderNotFoundState,
  TrackingErrorState,
  TrackingSkeleton,
} from '@/components/order-tracking/TrackingStates';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  findScenarioForOrderNumber,
  SCENARIO_KEYS,
  UI_STATE_KEYS,
  VIEW_META,
} from '@/data/mock-orders';
import type { DemoViews, Order, ScenarioKey, ViewKey } from '@/types/order';

const ALL_VIEW_KEYS: ViewKey[] = [...SCENARIO_KEYS, ...UI_STATE_KEYS];

/** Stable heading ids keep the section landmarks predictable for a11y tests. */
const HEADING_IDS = {
  status: 'tracking-status-heading',
  estimate: 'tracking-estimate-heading',
  timeline: 'tracking-timeline-heading',
  summary: 'tracking-summary-heading',
  details: 'tracking-details-heading',
  support: 'tracking-support-heading',
};

type SheetKey = 'details' | 'support' | 'report';

function isViewKey(value: string | null): value is ViewKey {
  return value !== null && (ALL_VIEW_KEYS as string[]).includes(value);
}

function itemLabel(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

export interface OrderTrackingScreenProps {
  /** Full mock orders, keyed by scenario (also used for the lookup demo). */
  orders: Record<ScenarioKey, Order>;
  /** Every renderable state, pre-built for the current request. */
  views: DemoViews;
  initialView: ViewKey;
}

/**
 * Orchestrates the whole order tracking experience: state selection, bottom
 * sheets, toasts and local interaction state. All data arrives through props so
 * the component stays free of data fetching concerns.
 */
export function OrderTrackingScreen({ orders, views, initialView }: OrderTrackingScreenProps) {
  const { showToast } = useToast();

  const [viewKey, setViewKey] = useState<ViewKey>(initialView);

  /** Resolved view object for the selected key. */
  const view = views[viewKey];
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedLabel, setUpdatedLabel] = useState('Updated with the latest carrier scan');
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timers.current.push(id);
  }, []);

  /** Single navigation path: updates the URL so every state stays shareable. */
  const applyView = useCallback((key: ViewKey) => {
    setViewKey(key);
    setLookupError(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `${window.location.pathname}?scenario=${key}`);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const next = new URLSearchParams(window.location.search).get('scenario');
      setViewKey(isViewKey(next) ? next : 'on_time');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const currentOrder = view.kind === 'order' ? view.order : null;
  const sheetOrder = currentOrder ?? orders[view.kind === 'error' ? view.retryScenario : 'on_time'];

  const exceptionNote = useMemo(() => {
    if (!currentOrder || currentOrder.scenario !== 'delayed') return undefined;
    return currentOrder.stages.find((stage) => stage.status === 'exception')?.note;
  }, [currentOrder]);

  const samples = useMemo(
    () =>
      SCENARIO_KEYS.map((key) => ({
        label: VIEW_META[key].label,
        value: orders[key].orderNumber,
      })),
    [orders]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    schedule(() => {
      setIsRefreshing(false);
      setUpdatedLabel('Updated just now');
      showToast({
        title: 'Tracking refreshed',
        description: 'No new carrier scans since the last update.',
      });
    }, 900);
  }, [schedule, showToast]);

  const handleCopyTrackingNumber = useCallback(async () => {
    const trackingNumber = currentOrder?.tracking?.trackingNumber;
    if (!trackingNumber) return;

    try {
      await navigator.clipboard.writeText(trackingNumber);
      showToast({
        title: 'Tracking number copied',
        description: trackingNumber,
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Copy is blocked by your browser',
        description: `Copy it manually: ${trackingNumber}`,
      });
    }
  }, [currentOrder, showToast]);

  const handleSupportAction = useCallback(
    (action: SupportActionId) => {
      switch (action) {
        case 'provide-help':
          setOpenSheet('support');
          break;
        case 'report-issue':
          setOpenSheet('report');
          break;
        case 'view-details':
          setOpenSheet('details');
          break;
        case 'toggle-notifications': {
          const next = !notificationsOn;
          setNotificationsOn(next);
          showToast(
            next
              ? {
                  title: 'Notifications on',
                  description: 'We email you at the first carrier scan.',
                  tone: 'success',
                }
              : { title: 'Notifications off', description: 'You can switch them back on any time.' }
          );
          break;
        }
      }
    },
    [notificationsOn, showToast]
  );

  const handleReportSubmitted = useCallback(
    (payload: ReportIssuePayload) => {
      const hasOpenReport = Boolean(currentOrder?.deliveryIssue);
      setOpenSheet(null);
      setReportSubmitted(true);
      showToast({
        title: hasOpenReport ? 'Details added to your report' : 'Delivery issue submitted',
        description: `${payload.reasonLabel}. Support follows up by email — the issue stays open, nothing is resolved yet.`,
        tone: 'success',
      });
    },
    [currentOrder, showToast]
  );

  const handleRetry = useCallback(() => {
    const target: ScenarioKey = view.kind === 'error' ? view.retryScenario : 'delayed';
    setIsRetrying(true);
    schedule(() => {
      setIsRetrying(false);
      applyView(target);
      showToast({
        title: 'Tracking loaded',
        description: 'Showing the latest carrier updates for your order.',
        tone: 'success',
      });
    }, 950);
  }, [applyView, schedule, showToast, view]);

  const handleLookup = useCallback(
    (rawOrderNumber: string) => {
      const orderNumber = rawOrderNumber.trim();

      if (!orderNumber) {
        setLookupError('Enter the order number from your confirmation email.');
        return;
      }

      const match = findScenarioForOrderNumber(orders, orderNumber);

      if (!match) {
        setLookupError(
          `No order matches "${orderNumber}". Sample numbers use the format RVX-48213.`
        );
        return;
      }

      applyView(match);
      showToast({
        title: `Order ${orders[match].orderNumber} loaded`,
        description: orders[match].status.headline,
        tone: 'success',
      });
    },
    [applyView, orders, showToast]
  );

  const activeKey: ViewKey = currentOrder ? currentOrder.scenario : viewKey;
  const headerSubtitle = currentOrder
    ? `${currentOrder.orderNumber} · ${itemLabel(currentOrder.itemCount)}`
    : 'Rovex demo store · sample orders';

  let content: ReactNode;

  if (view.kind === 'loading') {
    content = (
      <>
        <TrackingSkeleton caption={view.caption} />
        <Card className="p-4">
          <h1 className="text-sm font-semibold text-slate-900">Loading your tracking updates</h1>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            This is the loading state: a connected backend would render it while the tracking API
            responds. Pick another state in the demo bar, or continue with the delayed order.
          </p>
          <Button
            variant="secondary"
            fullWidth
            className="mt-3"
            onClick={() => applyView('delayed')}
          >
            Load the delayed order
          </Button>
        </Card>
      </>
    );
  } else if (view.kind === 'error') {
    content = (
      <TrackingErrorState
        message={view.message}
        detail={view.detail}
        isRetrying={isRetrying}
        onRetry={handleRetry}
        onContactSupport={() => setOpenSheet('support')}
      />
    );
  } else if (view.kind === 'not_found') {
    content = (
      <OrderNotFoundState
        message={view.message}
        detail={view.detail}
        samples={samples}
        errorMessage={lookupError}
        onSubmit={handleLookup}
      />
    );
  } else {
    const { order } = view;

    content = (
      <>
        <StatusBanner
          status={order.status}
          headingId={HEADING_IDS.status}
          exceptionNote={exceptionNote}
        />
        <DeliveryEstimateCard
          estimate={order.estimate}
          headingId={HEADING_IDS.estimate}
          hasOpenIssue={Boolean(order.deliveryIssue) || reportSubmitted}
        />
        <DeliveryTimeline
          stages={order.stages}
          headingId={HEADING_IDS.timeline}
          updatedLabel={updatedLabel}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
        <OrderSummary
          order={order}
          headingId={HEADING_IDS.summary}
          onViewDetails={() => setOpenSheet('details')}
        />
        <TrackingDetails
          order={order}
          headingId={HEADING_IDS.details}
          onCopyTrackingNumber={handleCopyTrackingNumber}
        />
        <SupportActions
          order={order}
          headingId={HEADING_IDS.support}
          notificationsOn={notificationsOn}
          reportSubmitted={reportSubmitted}
          onAction={handleSupportAction}
        />
        <p className="px-1 pt-1 text-center text-[11px] leading-4 text-slate-400">
          Sample order {order.orderNumber} · front-end demo with mock data, no backend connected.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-dvh justify-center bg-slate-100">
        <div className="flex min-h-dvh w-full max-w-[440px] flex-col overflow-x-clip bg-slate-50 sm:border-x sm:border-slate-200">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Package aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Order tracking</p>
                <p className="truncate text-xs text-slate-500">{headerSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenSheet('support')}
                aria-label="Open support options"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-800"
              >
                <CircleHelp aria-hidden="true" className="size-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 space-y-3 px-4 pt-4 pb-5">{content}</main>

          <ScenarioSwitcher active={activeKey} onChange={applyView} />
        </div>
      </div>

      <OrderDetailsSheet
        open={openSheet === 'details'}
        onClose={() => setOpenSheet(null)}
        order={sheetOrder}
      />
      <SupportSheet
        open={openSheet === 'support'}
        onClose={() => setOpenSheet(null)}
        order={sheetOrder}
      />
      <ReportIssueSheet
        open={openSheet === 'report'}
        onClose={() => setOpenSheet(null)}
        order={sheetOrder}
        onSubmitted={handleReportSubmitted}
      />
    </>
  );
}
