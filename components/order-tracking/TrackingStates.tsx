'use client';

import { useId, useState } from 'react';
import { CircleAlert, LoaderCircle, MessageCircle, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Loading, error and empty presentations for the tracking screen. They mirror
 * the real layout so the transition into loaded content feels stable.
 */
export function TrackingSkeleton({ caption }: { caption: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <p className="sr-only">Loading tracking updates</p>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-700">{caption}</p>
            <p className="mt-0.5 text-xs text-slate-500">Usually takes a couple of seconds.</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-7 w-40" />
        <Skeleton className="mt-2 h-3 w-52" />
      </Card>

      <Card className="p-4">
        <Skeleton className="h-3 w-32" />
        <div className="mt-3 space-y-4">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <Skeleton className="h-3 w-28" />
        <div className="mt-3 space-y-3">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-3">
              <Skeleton className="size-14 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export interface TrackingErrorStateProps {
  message: string;
  detail: string;
  isRetrying: boolean;
  onRetry: () => void;
  onContactSupport: () => void;
}

export function TrackingErrorState({
  message,
  detail,
  isRetrying,
  onRetry,
  onContactSupport,
}: TrackingErrorStateProps) {
  return (
    <Card className="p-5">
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <CircleAlert aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-3 text-lg leading-6 font-semibold tracking-tight text-slate-900">
        {message}
      </h1>
      <p className="mt-2 text-[13px] leading-5 text-slate-600">{detail}</p>

      <div className="mt-4 flex flex-col gap-2">
        <Button
          fullWidth
          onClick={onRetry}
          disabled={isRetrying}
          icon={
            isRetrying ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )
          }
        >
          {isRetrying ? 'Retrying…' : 'Try again'}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={onContactSupport}
          icon={<MessageCircle className="size-4" />}
        >
          Contact support
        </Button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-center text-xs leading-5 text-slate-500"
      >
        {isRetrying
          ? 'Contacting the tracking service…'
          : 'Your order and payment are unaffected by this error.'}
      </p>
    </Card>
  );
}

export interface OrderNotFoundStateProps {
  message: string;
  detail: string;
  samples: { label: string; value: string }[];
  errorMessage?: string | null;
  onSubmit: (orderNumber: string) => void;
}

/** Empty state: the order reference could not be resolved to anything. */
export function OrderNotFoundState({
  message,
  detail,
  samples,
  errorMessage,
  onSubmit,
}: OrderNotFoundStateProps) {
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState('');

  return (
    <Card className="p-5">
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
        <Search aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-3 text-lg leading-6 font-semibold tracking-tight text-slate-900">
        {message}
      </h1>
      <p className="mt-2 text-[13px] leading-5 text-slate-600">{detail}</p>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(value);
        }}
        noValidate
      >
        <label htmlFor={inputId} className="text-[13px] font-medium text-slate-700">
          Order number
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id={inputId}
            name="orderNumber"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="RVX-48213"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? errorId : undefined}
            className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-indigo-500"
          />
          <Button type="submit" icon={<Search className="size-4" />}>
            Track
          </Button>
        </div>
        {errorMessage ? (
          <p id={errorId} role="alert" className="mt-2 text-xs leading-5 font-medium text-rose-600">
            {errorMessage}
          </p>
        ) : null}
      </form>

      <div className="mt-4 border-t border-dashed border-slate-200 pt-3">
        <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          Sample orders
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {samples.map((sample) => (
            <button
              key={sample.value}
              type="button"
              title={sample.label}
              onClick={() => {
                setValue(sample.value);
                onSubmit(sample.value);
              }}
              className="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
            >
              {sample.value}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
