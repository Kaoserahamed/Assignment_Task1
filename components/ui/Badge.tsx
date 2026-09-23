import type { ReactNode } from 'react';

export type BadgeTone = 'info' | 'success' | 'warning' | 'critical' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  info: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200/70',
  critical: 'bg-rose-50 text-rose-700 ring-rose-100',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  /** Rendered before the label; decorative by default. */
  icon?: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ring-1 ring-inset',
        TONE_CLASSES[tone],
        className ?? '',
      ].join(' ')}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
