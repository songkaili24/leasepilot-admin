'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';
export type ButtonSize = 'xs' | 'sm' | 'md';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-700 text-white shadow-sm hover:bg-teal-800 focus-visible:outline-teal-700 active:bg-teal-900',
  secondary:
    'bg-navy-800 text-white shadow-sm hover:bg-navy-900 focus-visible:outline-navy-800 active:bg-navy-900',
  outline:
    'border border-slate-300 bg-white text-navy-800 shadow-sm hover:bg-slate-50 focus-visible:outline-navy-800 active:bg-slate-100',
  destructive:
    'bg-red-700 text-white shadow-sm hover:bg-red-800 focus-visible:outline-red-700 active:bg-red-900',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1.5 rounded px-2.5 text-xs',
  sm: 'h-8 gap-1.5 rounded-md px-3 text-sm',
  md: 'h-9 gap-2 rounded-md px-4 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction while pending. */
  loading?: boolean;
  /** Trailing icon slot — rendered after children, unaffected by loading state. */
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    trailingIcon,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
      {children}
      {trailingIcon}
    </button>
  );
});
