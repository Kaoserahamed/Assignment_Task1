export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={['animate-shimmer rounded-lg bg-slate-200/80', className].join(' ')}
    />
  );
}
