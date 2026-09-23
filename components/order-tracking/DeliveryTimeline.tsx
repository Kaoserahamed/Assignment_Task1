import type { ReactNode } from 'react';
import { Check, Dot, LoaderCircle, RefreshCw, TriangleAlert, Truck } from 'lucide-react';
import { SectionCard } from '@/components/ui/Card';
import type { StageStatus, TimelineStage } from '@/types/order';

interface StageVisual {
  dot: string;
  connector: string;
  icon: ReactNode;
}

const STAGE_VISUALS: Record<StageStatus, StageVisual> = {
  completed: {
    dot: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    connector: 'bg-emerald-200',
    icon: <Check className="size-4" />,
  },
  current: {
    dot: 'animate-pulse-soft bg-indigo-600 text-white ring-indigo-300',
    connector: 'bg-slate-200',
    icon: <Truck className="size-4" />,
  },
  upcoming: {
    dot: 'bg-white text-slate-300 ring-slate-200',
    connector: 'bg-slate-200',
    icon: <Dot className="size-6" />,
  },
  exception: {
    dot: 'bg-amber-50 text-amber-600 ring-amber-300',
    connector: 'bg-amber-200',
    icon: <TriangleAlert className="size-4" />,
  },
};

const STATUS_TEXT: Record<StageStatus, string> = {
  completed: 'Completed',
  current: 'In progress',
  upcoming: 'Not started yet',
  exception: 'Needs attention',
};

export interface DeliveryTimelineProps {
  stages: TimelineStage[];
  headingId: string;
  /** Human readable timestamp of the last refresh, e.g. `"Updated just now"`. */
  updatedLabel: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

/**
 * Vertical delivery timeline. Every step exposes its state both visually and
 * as screen-reader text, and the current step is marked with `aria-current`.
 */
export function DeliveryTimeline({
  stages,
  headingId,
  updatedLabel,
  isRefreshing,
  onRefresh,
}: DeliveryTimelineProps) {
  return (
    <SectionCard
      headingId={headingId}
      title="Delivery progress"
      description={updatedLabel}
      action={
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh tracking status"
          className="inline-flex size-9 items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-60"
        >
          <LoaderCircle
            aria-hidden="true"
            className={isRefreshing ? 'size-4 animate-spin' : 'hidden'}
          />
          <RefreshCw aria-hidden="true" className={isRefreshing ? 'hidden' : 'size-4'} />
        </button>
      }
    >
      <ol className="space-y-0">
        {stages.map((stage, index) => {
          const visual = STAGE_VISUALS[stage.status];
          const isLast = index === stages.length - 1;
          const timestamp = stage.timestampLabel ?? stage.expectedLabel;

          return (
            <li key={stage.key} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={['absolute top-8 bottom-0 left-[13px] w-0.5', visual.connector].join(
                    ' '
                  )}
                />
              ) : null}

              <span
                aria-hidden="true"
                className={[
                  'relative z-10 mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full ring-1',
                  visual.dot,
                ].join(' ')}
              >
                {visual.icon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                  {timestamp ? (
                    <p className="text-xs font-medium text-slate-500">{timestamp}</p>
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">{stage.description}</p>

                {stage.note ? (
                  <p
                    className={
                      stage.status === 'exception'
                        ? 'mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs leading-5 text-amber-800 ring-1 ring-amber-100'
                        : stage.status === 'current'
                          ? 'mt-2 text-xs font-medium text-indigo-700'
                          : 'mt-2 text-xs leading-5 text-slate-500'
                    }
                  >
                    {stage.note}
                  </p>
                ) : null}

                <p className="sr-only">
                  Step {index + 1} of {stages.length}. Status: {STATUS_TEXT[stage.status]}.
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
