import type { ReactNode } from 'react';
import { ChevronDown, CircleAlert, CircleCheck, Truck, TriangleAlert } from 'lucide-react';
import type { StatusContent, StatusTone } from '@/types/order';

interface ToneStyle {
  card: string;
  eyebrow: string;
  iconTile: string;
  icon: ReactNode;
}

const TONE_STYLES: Record<StatusTone, ToneStyle> = {
  info: {
    card: 'bg-white ring-slate-200/80',
    eyebrow: 'text-indigo-600',
    iconTile: 'bg-indigo-50 text-indigo-600',
    icon: <Truck className="size-6" />,
  },
  success: {
    card: 'bg-white ring-emerald-200/70',
    eyebrow: 'text-emerald-700',
    iconTile: 'bg-emerald-50 text-emerald-600',
    icon: <CircleCheck className="size-6" />,
  },
  warning: {
    card: 'bg-amber-50/70 ring-amber-200/80',
    eyebrow: 'text-amber-700',
    iconTile: 'bg-amber-100 text-amber-700',
    icon: <TriangleAlert className="size-6" />,
  },
  critical: {
    card: 'bg-rose-50/70 ring-rose-200/80',
    eyebrow: 'text-rose-700',
    iconTile: 'bg-rose-100 text-rose-700',
    icon: <CircleAlert className="size-6" />,
  },
};

export interface StatusBannerProps {
  status: StatusContent;
  /** Id used for `aria-labelledby`; also the page's heading id. */
  headingId: string;
  /** Extra context rendered in a disclosure, e.g. why a parcel is late. */
  exceptionNote?: string;
}

/**
 * Primary status block: eyebrow, headline (`h1`), supporting copy, the single
 * next step and — for delayed orders — an optional "why is it late" disclosure.
 */
export function StatusBanner({ status, headingId, exceptionNote }: StatusBannerProps) {
  const tone = TONE_STYLES[status.tone];

  return (
    <section
      aria-labelledby={headingId}
      className={['rounded-2xl p-4 shadow-sm ring-1', tone.card].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={[
            'inline-flex size-11 shrink-0 items-center justify-center rounded-xl',
            tone.iconTile,
          ].join(' ')}
        >
          {tone.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={['text-[11px] font-semibold tracking-wide uppercase', tone.eyebrow].join(
              ' '
            )}
          >
            {status.eyebrow}
          </p>
          <h1
            id={headingId}
            className="mt-1 text-xl leading-7 font-semibold tracking-tight text-slate-900"
          >
            {status.headline}
          </h1>
          <p className="mt-2 text-[13px] leading-5 text-slate-600">{status.description}</p>
        </div>
      </div>

      {status.nextStep ? (
        <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-[13px] leading-5 font-medium text-slate-700 ring-1 ring-slate-200/70">
          {status.nextStep}
        </p>
      ) : null}

      {exceptionNote ? (
        <details className="group mt-3 rounded-xl bg-white/80 ring-1 ring-slate-200/70">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[13px] font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
            Why is it late?
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="px-3 pb-3 text-[13px] leading-5 text-slate-600">{exceptionNote}</p>
        </details>
      ) : null}
    </section>
  );
}
