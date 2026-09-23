'use client';

import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Mail, MessageCircle, Phone } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button, buttonClasses } from '@/components/ui/Button';
import type { Order } from '@/types/order';

type ChatState = 'idle' | 'connecting' | 'queued';

export interface SupportSheetProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

/**
 * Mock support drawer. Chat is simulated locally, phone and email open the
 * device apps — no request reaches a real support team (documented in README).
 */
export function SupportSheet({ open, onClose, order }: SupportSheetProps) {
  const [chatState, setChatState] = useState<ChatState>('idle');
  const timerRef = useRef<number | null>(null);

  /* Resetting on close (rather than in an effect) keeps the sheet ready for a
     fresh chat request the next time it is opened. */
  const handleClose = () => {
    setChatState('idle');
    onClose();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const startChat = () => {
    setChatState('connecting');
    timerRef.current = window.setTimeout(() => setChatState('queued'), 1400);
  };

  const { support } = order;

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title="Contact support"
      description={`${order.orderNumber} · ${order.status.eyebrow}`}
      footer={
        <Button variant="secondary" fullWidth onClick={handleClose}>
          Back to my order
        </Button>
      }
    >
      <ul className="space-y-3">
        <li className="rounded-2xl bg-white p-3 ring-1 ring-slate-200/80">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <MessageCircle aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-900">Live chat</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{support.chatWaitLabel}</p>
              <Button
                className="mt-2"
                size="sm"
                onClick={startChat}
                disabled={chatState !== 'idle'}
                icon={
                  chatState === 'connecting' ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : undefined
                }
              >
                {chatState === 'idle' ? 'Start chat' : 'Chat requested'}
              </Button>
              <p role="status" aria-live="polite" className="mt-2 text-xs leading-5 text-slate-600">
                {chatState === 'connecting'
                  ? 'Connecting you to the next available specialist…'
                  : chatState === 'queued'
                    ? 'You are number 2 in the queue. A specialist will join this chat shortly — this demo does not open a real chat.'
                    : ''}
              </p>
            </div>
          </div>
        </li>

        <li className="rounded-2xl bg-white p-3 ring-1 ring-slate-200/80">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Phone aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-900">Call support</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{support.hoursLabel}</p>
              <a href={support.phoneHref} className={`${buttonClasses('secondary', 'sm')} mt-2`}>
                <Phone aria-hidden="true" className="size-3.5" />
                {support.phoneLabel}
              </a>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Demo number reserved for examples — opens your phone app.
              </p>
            </div>
          </div>
        </li>

        <li className="rounded-2xl bg-white p-3 ring-1 ring-slate-200/80">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Mail aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-900">Email support</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{support.responseLabel}</p>
              <a href={support.emailHref} className={`${buttonClasses('secondary', 'sm')} mt-2`}>
                <Mail aria-hidden="true" className="size-3.5" />
                {support.emailLabel}
              </a>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Opens your mail app with a draft. The address uses the reserved .example domain, so
                nothing is delivered in this demo.
              </p>
            </div>
          </div>
        </li>
      </ul>

      {order.deliveryIssue ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800 ring-1 ring-amber-100">
          Reference {order.deliveryIssue.reference} · {order.deliveryIssue.statusLabel}.{' '}
          {order.deliveryIssue.nextStepNote}
        </p>
      ) : null}
    </BottomSheet>
  );
}
