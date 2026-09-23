import type { ReactNode } from 'react';
import { CalendarClock, CalendarDays, CircleCheck, Clock, TriangleAlert } from 'lucide-react';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { SectionCard } from '@/components/ui/Card';
import type { DeliveryEstimate, EstimateState } from '@/types/order';

interface EstimateMeta {
  title: string;
  badgeLabel: string;
  badgeTone: BadgeTone;
  icon: ReactNode;
}

const ESTIMATE_META: Record<EstimateState, EstimateMeta> = {
  on_track: {
    title: 'Estimated delivery',
    badgeLabel: 'On schedule',
    badgeTone: 'success',
    icon: <CalendarDays className="size-3.5" />,
  },
  revised: {
    title: 'Revised estimate',
    badgeLabel: 'Delayed',
    badgeTone: 'warning',
    icon: <CalendarClock className="size-3.5" />,
  },
  pending: {
    title: 'Estimated delivery',
    badgeLabel: 'Pending',
    badgeTone: 'neutral',
    icon: <Clock className="size-3.5" />,
  },
  delivered: {
    title: 'Delivery record',
    badgeLabel: 'Delivered',
    badgeTone: 'success',
    icon: <CircleCheck className="size-3.5" />,
  },
};

export interface DeliveryEstimateCardProps {
  estimate: DeliveryEstimate;
  headingId: string;
  /** True when a delivery issue is open — overrides the badge wording. */
  hasOpenIssue?: boolean;
}

export function DeliveryEstimateCard({
  estimate,
  headingId,
  hasOpenIssue = false,
}: DeliveryEstimateCardProps) {
  const meta = ESTIMATE_META[estimate.state];
  const badgeLabel = hasOpenIssue ? 'Issue open' : meta.badgeLabel;
  const badgeTone: BadgeTone = hasOpenIssue ? 'warning' : meta.badgeTone;

  return (
    <SectionCard
      headingId={headingId}
      title={meta.title}
      action={
        <Badge tone={badgeTone} icon={meta.icon}>
          {badgeLabel}
        </Badge>
      }
    >
      <p className="text-2xl leading-8 font-semibold tracking-tight text-slate-900">
        {estimate.value}
      </p>
      {estimate.window ? (
        <p className="mt-1 text-[13px] font-medium text-slate-700">{estimate.window}</p>
      ) : null}
      {estimate.detail ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">{estimate.detail}</p>
      ) : null}

      {estimate.isOverdue ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 ring-1 ring-amber-100">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            The window you were promised has passed. The estimate above is the latest update from
            the carrier.
          </span>
        </p>
      ) : null}
    </SectionCard>
  );
}
