import { OrderTrackingScreen } from '@/components/order-tracking/OrderTrackingScreen';
import { ToastProvider } from '@/components/ui/Toast';
import {
  createDemoViews,
  createScenarioOrders,
  SCENARIO_KEYS,
  UI_STATE_KEYS,
} from '@/data/mock-orders';
import type { ViewKey } from '@/types/order';

const ALL_VIEW_KEYS: ViewKey[] = [...SCENARIO_KEYS, ...UI_STATE_KEYS];

/**
 * `?scenario=` keeps every order state deep-linkable (handy for reviews and
 * design QA). Unknown values fall back to the on-time order.
 */
function resolveView(value: string | string[] | undefined): ViewKey {
  const candidate = Array.isArray(value) ? value[0] : value;

  return ALL_VIEW_KEYS.find((key) => key === candidate) ?? 'on_time';
}

/**
 * The mock data is generated per request so the timelines, "today" labels and
 * delay windows always describe the moment the page is opened. Reading
 * `searchParams` keeps this route dynamically rendered on Vercel.
 */
export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialView = resolveView(resolvedSearchParams.scenario);

  const reference = new Date();

  return (
    <ToastProvider>
      <OrderTrackingScreen
        orders={createScenarioOrders(reference)}
        views={createDemoViews(reference)}
        initialView={initialView}
      />
    </ToastProvider>
  );
}
