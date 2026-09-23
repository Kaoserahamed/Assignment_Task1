import type { ReactNode } from 'react';
import { Clock, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/Card';
import type { Order } from '@/types/order';

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[13px] text-slate-500">{label}</dt>
      <dd className="max-w-[62%] text-right text-[13px] font-medium whitespace-pre-line text-slate-800">
        {children}
      </dd>
    </div>
  );
}

export interface TrackingDetailsProps {
  order: Order;
  headingId: string;
  onCopyTrackingNumber: () => void;
}

/**
 * Carrier/tracking information. When the carrier has not issued a tracking
 * number yet the card explains what is happening instead of rendering an empty
 * value (tracking-unavailable scenario).
 */
export function TrackingDetails({ order, headingId, onCopyTrackingNumber }: TrackingDetailsProps) {
  const { tracking, trackingNumberIssuedAtLabel, shipping } = order;
  const address = [shipping.name, shipping.line1, shipping.line2].join('\n');

  return (
    <SectionCard
      headingId={headingId}
      title="Tracking details"
      description={tracking ? `Carrier · ${tracking.carrier}` : 'No carrier tracking number yet'}
    >
      {tracking?.trackingNumber ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/70">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Tracking number
            </p>
            <p className="mt-0.5 truncate font-mono text-[13px] font-semibold text-slate-900">
              {tracking.trackingNumber}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCopyTrackingNumber}
            icon={<Copy className="size-3.5" />}
          >
            Copy
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
            <Clock aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
            Tracking number not issued yet
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {trackingNumberIssuedAtLabel
              ? `Issued ${trackingNumberIssuedAtLabel}.`
              : 'Northwind Express issues a tracking number after the first scan at the fulfilment centre, usually within 24 hours of ordering.'}
          </p>
        </div>
      )}

      <dl className="mt-3 space-y-2.5">
        <InfoRow label="Carrier">{tracking ? tracking.carrier : 'Assigned on dispatch'}</InfoRow>
        <InfoRow label="Last scan">{tracking?.lastScanLabel ?? 'No scans recorded yet'}</InfoRow>
        <InfoRow label="Delivery address">{address}</InfoRow>
      </dl>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Demo note: live carrier tracking is not connected, so this screen shows the most recent scan
        recorded in the sample data.
      </p>
    </SectionCard>
  );
}
