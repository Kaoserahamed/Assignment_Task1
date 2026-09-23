import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
  secondary:
    'bg-white text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
};

/* `min-h-11` keeps every control at or above the 44px touch-target minimum. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 text-sm',
  sm: 'min-h-9 px-3 text-[13px]',
};

/**
 * Shared class builder so that links and buttons can look identical without
 * duplicating the design tokens (see `SupportActions` for link usage).
 */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false
): string {
  return [BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth ? 'w-full' : '']
    .filter(Boolean)
    .join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Rendered before the label; decorative by default. */
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[buttonClasses(variant, size, fullWidth), className ?? ''].join(' ')}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
