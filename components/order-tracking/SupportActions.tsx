import type { ReactNode } from 'react';
import {
  Bell,
  CalendarClock,
  CircleCheck,
  MessageCircle,
  Receipt,
  TriangleAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, type ButtonVariant } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Order, ScenarioKey } from '@/types/order';

/** Every action the support block can ask the screen to perform. */
export type SupportActionId =
  'provide-help' | 'report-issue' | 'toggle-notifications' | 'view-details';

interface ActionSpec {
  id: SupportActionId;
  label: string;
  variant: ButtonVariant;
  icon: ReactNode;
}

interface ScenarioActions {
  blurb: string;
  primary: ActionSpec;
  secondary: ActionSpec;
}

/**
 * Scenario-specific action labels. Keeping them in one map means every state
 * offers the right next step without duplicating UI.
 */
const SCENARIO_ACTIONS: Record<ScenarioKey, ScenarioActions> = {
  on_time: {
    blurb: 'Questions about the drop-off? Support can reach the courier for you.',
    primary: {
      id: 'provide-help',
      label: 'Contact support',
      variant: 'primary',
      icon: <MessageCircle className="size-4" />,
    },
    secondary: {
      id: 'view-details',
      label: 'View order details',
      variant: 'secondary',
      icon: <Receipt className="size-4" />,
    },
  },
  delayed: {
    blurb: 'Your parcel is still on its way. We can share the latest hub scans or refund shipping.',
    primary: {
      id: 'provide-help',
      label: 'Get help with this delay',
      variant: 'primary',
      icon: <MessageCircle className="size-4" />,
    },
    secondary: {
      id: 'view-details',
      label: 'View updated delivery info',
      variant: 'secondary',
      icon: <CalendarClock className="size-4" />,
    },
  },
  delivered_not_received: {
    blurb: 'Report what you found or ask support to start a carrier trace for this parcel.',
    primary: {
      id: 'report-issue',
      label: 'Report a delivery issue',
      variant: 'danger',
      icon: <TriangleAlert className="size-4" />,
    },
    secondary: {
      id: 'provide-help',
      label: 'Contact support',
      variant: 'secondary',
      icon: <MessageCircle className="size-4" />,
    },
  },
  tracking_unavailable: {
    blurb: 'No tracking number yet. We can notify you at the first scan or answer questions now.',
    primary: {
      id: 'toggle-notifications',
      label: 'Notify me when tracking is live',
      variant: 'primary',
      icon: <Bell className="size-4" />,
    },
    secondary: {
      id: 'provide-help',
      label: 'Contact support',
      variant: 'secondary',
      icon: <MessageCircle className="size-4" />,
    },
  },
};

export interface SupportActionsProps {
  order: Order;
  headingId: string;
  notificationsOn: boolean;
  /** Set after the customer submits the report form in the current session. */
  reportSubmitted: boolean;
  onAction: (action: SupportActionId) => void;
}

/**
 * Support card: scenario-aware primary and secondary actions plus the live
 * state of an already reported delivery issue.
 */
export function SupportActions({
  order,
  headingId,
  notificationsOn,
  reportSubmitted,
  onAction,
}: SupportActionsProps) {
  const config = SCENARIO_ACTIONS[order.scenario];
  const { deliveryIssue } = order;

  return (
    <Card>
      <div className="px-4 pt-4">
        <h2 id={headingId} className="text-sm font-semibold text-slate-900">
          Need help with this order?
        </h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{config.blurb}</p>
      </div>

      <div className="px-4 pt-3 pb-4">
        {deliveryIssue ? (
          <div className="mb-3 rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-100">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="warning" icon={<TriangleAlert className="size-3.5" />}>
                {deliveryIssue.status === 'open' ? 'Report open' : 'In review'}
              </Badge>
              <span className="font-mono text-[11px] font-semibold text-amber-800">
                {deliveryIssue.reference}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-amber-900">{deliveryIssue.summary}</p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Reported {deliveryIssue.reportedLabel} · {deliveryIssue.statusLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-700">{deliveryIssue.nextStepNote}</p>
          </div>
        ) : null}

        {!deliveryIssue && reportSubmitted ? (
          <p
            role="status"
            className="mb-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-800 ring-1 ring-emerald-100"
          >
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              Your delivery issue is submitted and open. Support will follow up by email — nothing
              is resolved yet.
            </span>
          </p>
        ) : null}

        {notificationsOn ? (
          <p
            role="status"
            className="mb-3 flex items-start gap-2 rounded-xl bg-indigo-50 px-3 py-2.5 text-xs leading-5 text-indigo-800 ring-1 ring-indigo-100"
          >
            <Bell aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>Notifications on. We email you at the first carrier scan.</span>
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button
            variant={config.primary.variant}
            fullWidth
            icon={config.primary.icon}
            onClick={() => onAction(config.primary.id)}
          >
            {config.primary.id === 'toggle-notifications' && notificationsOn
              ? 'Notifications on'
              : config.primary.label}
          </Button>
          <Button
            variant={config.secondary.variant}
            fullWidth
            icon={config.secondary.icon}
            onClick={() => onAction(config.secondary.id)}
          >
            {config.secondary.label}
          </Button>
        </div>

        <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">
          {order.support.hoursLabel} · {order.support.responseLabel}
        </p>
      </div>
    </Card>
  );
}
