import type { HTMLAttributes, ReactNode } from 'react';

const CARD_CLASSES = 'rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[CARD_CLASSES, className ?? ''].join(' ')} {...rest}>
      {children}
    </div>
  );
}

export interface SectionCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Id applied to the heading so sections can be referenced with aria-labelledby. */
  headingId: string;
  title: string;
  description?: string;
  /** Compact control rendered at the top-right of the header row. */
  action?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Card with a consistent header (title + optional description and action).
 * Used for every content block on the tracking screen so spacing stays uniform.
 */
export function SectionCard({
  headingId,
  title,
  description,
  action,
  bodyClassName = 'px-4 pb-4 pt-3',
  className,
  children,
  ...rest
}: SectionCardProps) {
  return (
    <Card className={className} {...rest}>
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}
