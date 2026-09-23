import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { formatCurrency } from '@/lib/format';
import type { Order } from '@/types/order';

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{children}</h3>
  );
}

export interface OrderDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

/** Full order breakdown shown in a bottom sheet from the summary card. */
export function OrderDetailsSheet({ open, onClose, order }: OrderDetailsSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Order details"
      description={`${order.orderNumber} · placed ${order.placedLabel}`}
      footer={
        <Button variant="secondary" fullWidth onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        <section>
          <SectionTitle>{`Items (${order.itemCount})`}</SectionTitle>
          <ul className="mt-1 divide-y divide-slate-100">
            {order.products.map((product) => (
              <li key={product.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] leading-5 font-semibold text-slate-900">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {product.variant} · Qty {product.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] font-semibold text-slate-900">
                  {formatCurrency(product.unitPrice * product.quantity, order.currency)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionTitle>Payment summary</SectionTitle>
          <dl className="mt-2 space-y-2">
            {order.totals.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3">
                <dt
                  className={
                    row.isTotal
                      ? 'text-sm font-semibold text-slate-900'
                      : 'text-[13px] text-slate-600'
                  }
                >
                  {row.label}
                </dt>
                <dd
                  className={
                    row.isTotal
                      ? 'text-sm font-semibold text-slate-900'
                      : 'text-[13px] text-slate-700'
                  }
                >
                  {row.display ??
                    `${row.isDiscount ? '−' : ''}${formatCurrency(row.amount, order.currency)}`}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-slate-500">
            Paid with {order.payment.method} ending {order.payment.last4}. The invoice PDF becomes
            available once the order is delivered.
          </p>
        </section>

        <section>
          <SectionTitle>Delivery address</SectionTitle>
          <address className="mt-2 text-[13px] leading-5 text-slate-700 not-italic">
            {order.shipping.name}
            <br />
            {order.shipping.line1}
            <br />
            {order.shipping.line2}
          </address>
        </section>

        <section>
          <SectionTitle>Tracking</SectionTitle>
          <dl className="mt-2 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-slate-600">Carrier</dt>
              <dd className="text-[13px] font-medium text-slate-800">
                {order.tracking?.carrier ?? 'Assigned on dispatch'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-slate-600">Tracking number</dt>
              <dd className="font-mono text-[13px] font-medium text-slate-800">
                {order.tracking?.trackingNumber ?? 'Not issued yet'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-slate-600">Last update</dt>
              <dd className="text-right text-[13px] font-medium text-slate-800">
                {order.tracking?.lastScanLabel ?? 'No scans recorded'}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </BottomSheet>
  );
}
