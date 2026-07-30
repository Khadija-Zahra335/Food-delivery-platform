'use client';

import { ReactNode } from 'react';
import type { OrderStatus } from '../lib/api';

/* ---------------- Status badge ---------------- */

const STATUS_STYLES: Record<OrderStatus, string> = {
  PLACED: 'bg-brand-50 text-brand-800',
  PREPARING: 'bg-amber-50 text-amber-700',
  OUT_FOR_DELIVERY: 'bg-blue-50 text-blue-700',
  DELIVERED: 'bg-brand-400 text-white',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="text-base font-medium text-brand-900">{title}</p>
      {message && <p className="mt-1.5 text-sm text-ink-muted">{message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/* ---------------- Loading skeleton ---------------- */

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-line bg-white"
        >
          <div className="h-36 animate-pulse bg-brand-50" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-brand-50" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-brand-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-line bg-white"
        />
      ))}
    </div>
  );
}

/* ---------------- Page heading ---------------- */

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-base text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Buttons ---------------- */

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
};

export function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-4 focus:ring-brand-50 disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-brand-400 text-white hover:bg-brand-600',
    secondary:
      'border border-line bg-white text-brand-900 hover:border-brand-200 hover:bg-brand-50',
    danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------- Spinner ---------------- */

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}