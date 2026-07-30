'use client';

import type { OrderStatus, Review } from '@/lib/api';

/* ---------------- Stat card ---------------- */

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white px-5 py-4">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-brand-900">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/* ---------------- Order status timeline ---------------- */

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PLACED', label: 'Placed' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'OUT_FOR_DELIVERY', label: 'On the way' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="rounded-xl border border-line bg-white px-5 py-6 text-center">
        <p className="text-sm font-medium text-brand-900">This order was cancelled</p>
        <p className="mt-1 text-sm text-ink-muted">
          Nothing further will happen with it.
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="rounded-xl border border-line bg-white px-5 py-6">
      <div className="flex items-start">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step.status} className="flex flex-1 flex-col items-center">
              {/* connector + dot row */}
              <div className="flex w-full items-center">
                <div
                  className={`h-0.5 flex-1 ${
                    index === 0
                      ? 'bg-transparent'
                      : isDone || isCurrent
                      ? 'bg-brand-400'
                      : 'bg-line'
                  }`}
                />

                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm ${
                    isDone
                      ? 'bg-brand-400 text-white'
                      : isCurrent
                      ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-400'
                      : 'bg-canvas text-ink-muted ring-1 ring-line'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </div>

                <div
                  className={`h-0.5 flex-1 ${
                    index === STEPS.length - 1
                      ? 'bg-transparent'
                      : isDone
                      ? 'bg-brand-400'
                      : 'bg-line'
                  }`}
                />
              </div>

              <p
                className={`mt-2 text-center text-xs ${
                  isFuture
                    ? 'text-ink-muted'
                    : 'font-medium text-brand-900'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Star display ---------------- */

export function Stars({ rating }: { rating: number }) {
  return (
    <p className="text-amber-400" aria-label={`${rating} out of 5`}>
      {'★'.repeat(rating)}
      <span className="text-line">{'★'.repeat(5 - rating)}</span>
    </p>
  );
}

/* ---------------- Review list ---------------- */

type ReviewWithCustomer = Review & {
  customer?: { id: number; name: string };
};

export function ReviewList({
  reviews,
  emptyMessage = 'No reviews yet.',
}: {
  reviews: ReviewWithCustomer[];
  emptyMessage?: string;
}) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white px-5 py-8 text-center text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-brand-900">
              {review.customer?.name ?? 'A customer'}
            </p>
            <Stars rating={review.rating} />
          </div>

          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Rating summary ---------------- */

export function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-brand-900">
            {average.toFixed(1)}
          </p>
          <Stars rating={Math.round(average)} />
          <p className="mt-1 text-xs text-ink-muted">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="min-w-[180px] flex-1 space-y-1.5">
          {counts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2.5">
              <span className="w-3 text-xs text-ink-muted">{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-50">
                <div
                  className="h-full rounded-full bg-brand-400"
                  style={{
                    width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-6 text-right text-xs text-ink-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}