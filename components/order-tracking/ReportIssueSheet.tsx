'use client';

import { useId, useState } from 'react';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types/order';

const REASONS = [
  { id: 'not_at_address', label: 'The parcel is not at my address' },
  { id: 'wrong_location', label: 'The delivery photo shows a different place' },
  { id: 'neighbours', label: 'Neighbours say they did not take it in' },
  { id: 'damaged', label: 'The parcel arrived damaged' },
  { id: 'other', label: 'Something else' },
] as const;

export interface ReportIssuePayload {
  reasonLabel: string;
  note: string;
}

export interface ReportIssueSheetProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onSubmitted: (payload: ReportIssuePayload) => void;
}

/**
 * Delivery issue report. Validates locally, never claims a resolution and
 * reuses the open report when one already exists.
 */
export function ReportIssueSheet({ open, onClose, order, onSubmitted }: ReportIssueSheetProps) {
  const reasonGroupId = useId();
  const noteId = useId();
  const counterId = useId();
  const checkboxId = useId();

  const [reason, setReason] = useState<string | null>(null);
  const [checkedArea, setCheckedArea] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  /* Validation feedback is cleared when the sheet is dismissed. */
  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!reason) {
      setError('Choose what happened so we can route your report correctly.');
      return;
    }
    if (!checkedArea) {
      setError('Confirm you checked around the property and with neighbours first.');
      return;
    }

    const selected = REASONS.find((item) => item.id === reason);
    setError(null);
    onSubmitted({ reasonLabel: selected?.label ?? 'Delivery issue', note: note.trim() });
    setReason(null);
    setCheckedArea(false);
    setNote('');
  };

  const { deliveryIssue } = order;

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={deliveryIssue ? 'Add to your report' : 'Report a delivery issue'}
      description={`${order.orderNumber} · ${order.status.eyebrow}`}
      footer={
        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={handleSubmit}>
            {deliveryIssue ? 'Add details to report' : 'Submit report'}
          </Button>
          <Button variant="secondary" fullWidth onClick={handleClose}>
            Cancel
          </Button>
        </div>
      }
    >
      {deliveryIssue ? (
        <div className="mb-4 rounded-2xl bg-amber-50 px-3 py-3 ring-1 ring-amber-100">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
            <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
            Report {deliveryIssue.reference} is open
          </p>
          <p className="mt-1.5 text-xs leading-5 text-amber-800">{deliveryIssue.summary}</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Reported {deliveryIssue.reportedLabel} · {deliveryIssue.statusLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-700">{deliveryIssue.nextStepNote}</p>
        </div>
      ) : null}

      <fieldset>
        <legend className="text-[13px] font-medium text-slate-700">What happened?</legend>
        <div className="mt-2 space-y-2">
          {REASONS.map((item) => (
            <label
              key={item.id}
              htmlFor={`${reasonGroupId}-${item.id}`}
              className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 has-[:checked]:bg-indigo-50 has-[:checked]:ring-indigo-400"
            >
              <input
                id={`${reasonGroupId}-${item.id}`}
                type="radio"
                name={reasonGroupId}
                value={item.id}
                checked={reason === item.id}
                onChange={() => setReason(item.id)}
                className="mt-0.5 size-4 shrink-0 accent-indigo-600"
              />
              <span className="text-[13px] leading-5 font-medium text-slate-800">{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <label
          htmlFor={checkboxId}
          className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 has-[:checked]:bg-emerald-50 has-[:checked]:ring-emerald-300"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={checkedArea}
            onChange={(event) => setCheckedArea(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-emerald-600"
          />
          <span className="text-[13px] leading-5 text-slate-700">
            I checked the safe place, the building entrance and with neighbours.
          </span>
        </label>
      </div>

      <div className="mt-4">
        <label htmlFor={noteId} className="text-[13px] font-medium text-slate-700">
          Extra details <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id={noteId}
          rows={3}
          maxLength={400}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          aria-describedby={counterId}
          placeholder="Gate code, where couriers normally leave parcels, anything that helps the trace."
          className="mt-1.5 w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-indigo-500"
        />
        <p id={counterId} className="mt-1 text-right text-[11px] text-slate-400">
          {note.length}/400
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs leading-5 font-medium text-rose-700 ring-1 ring-rose-100"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Submitting adds this information to your report. It does not close the issue — support
        reviews it with the carrier and contacts you by email.
      </p>
    </BottomSheet>
  );
}
