import Image from 'next/image';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/format';
import type { Order } from '@/types/order';

export interface OrderSummaryProps {
  order: Order;
  headingId: string;
  onViewDetails: () => void;
}

/**
 * Order summary: products, quantities, unit prices and the payment breakdown.
 * Keeps the scannable part of the order in one card before the support block.
 */
export function OrderSummary({ order, headingId, onViewDetails }: OrderSummaryProps) {
  const description = `${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'} · Placed ${order.placedLabel}`;

  return (
    <SectionCard
      headingId={headingId}
      title="Order summary"
      description={description}
      action={
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
          {order.orderNumber}
        </span>
      }
    >
      <ul className="space-y-3">
        {order.products.map((product) => (
          <li key={product.id} className="flex items-start gap-3">
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={56}
              height={56}
              unoptimized
              className="size-14 shrink-0 rounded-xl bg-slate-100 ring-1 ring-slate-200/70"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-5 font-semibold text-slate-900">{product.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{product.variant}</p>
              <p className="mt-1 text-xs text-slate-500">
                Qty {product.quantity} · {formatCurrency(product.unitPrice, order.currency)} each
              </p>
            </div>
            <p className="shrink-0 text-[13px] font-semibold text-slate-900">
              {formatCurrency(product.unitPrice * product.quantity, order.currency)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-3">
        {order.totals.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt
              className={
                row.isTotal ? 'text-sm font-semibold text-slate-900' : 'text-[13px] text-slate-600'
              }
            >
              {row.label}
            </dt>
            <dd
              className={[
                row.isTotal ? 'text-sm font-semibold text-slate-900' : 'text-[13px] text-slate-700',
                row.isDiscount ? 'text-emerald-700' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {row.display ??
                `${row.isDiscount ? '−' : ''}${formatCurrency(row.amount, order.currency)}`}
            </dd>
          </div>
        ))}
      </dl>

      <Button
        variant="secondary"
        fullWidth
        className="mt-4"
        onClick={onViewDetails}
        icon={<Receipt className="size-4" />}
      >
        View order details
      </Button>
    </SectionCard>
  );
}
