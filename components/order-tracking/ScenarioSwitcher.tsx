'use client';

import { useState } from 'react';
import { ChevronDown, Settings2 } from 'lucide-react';
import { SCENARIO_KEYS, UI_STATE_KEYS, VIEW_META } from '@/data/mock-orders';
import type { ViewKey } from '@/types/order';

function ChipRow({
  label,
  keys,
  active,
  onChange,
}: {
  label: string;
  keys: ViewKey[];
  active: ViewKey;
  onChange: (key: ViewKey) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {keys.map((key) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={isActive}
              title={VIEW_META[key].blurb}
              className={
                isActive
                  ? 'inline-flex min-h-9 items-center rounded-full bg-indigo-600 px-3 text-[11px] font-semibold text-white'
                  : 'inline-flex min-h-9 items-center rounded-full bg-white px-3 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors ring-inset hover:bg-slate-50'
              }
            >
              {VIEW_META[key].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface ScenarioSwitcherProps {
  active: ViewKey;
  onChange: (key: ViewKey) => void;
}

/**
 * Demo control bar. Real products would receive this data from the backend;
 * here it makes every order state reviewable in one deployed URL and keeps the
 * choice shareable through the `?scenario=` query parameter.
 */
export function ScenarioSwitcher({ active, onChange }: ScenarioSwitcherProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <Settings2 aria-hidden="true" className="size-3.5" />
            Demo states
          </p>
          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
            aria-controls="demo-state-chips"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            {expanded ? 'Hide' : 'Show'}
            <ChevronDown
              aria-hidden="true"
              className={
                expanded
                  ? 'size-3.5 rotate-180 transition-transform'
                  : 'size-3.5 transition-transform'
              }
            />
          </button>
        </div>

        {expanded ? (
          <div id="demo-state-chips" className="mt-2 space-y-2">
            <ChipRow
              label="Order states"
              keys={SCENARIO_KEYS}
              active={active}
              onChange={onChange}
            />
            <ChipRow label="UI states" keys={UI_STATE_KEYS} active={active} onChange={onChange} />
          </div>
        ) : null}

        <p className="mt-2 text-[11px] leading-4 text-slate-400">
          <span className="font-semibold text-slate-600">{VIEW_META[active].label}</span> ·{' '}
          {VIEW_META[active].blurb}
        </p>
      </div>
    </div>
  );
}
