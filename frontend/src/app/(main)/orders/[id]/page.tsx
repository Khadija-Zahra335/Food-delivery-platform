'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, type Order } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import { Button, RowSkeleton, OrderStatusBadge, Spinner } from '@/components/ui';
import { OrderTimeline } from '@/components/ui-extras';

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : parseFloat(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------------- Star rating input ---------------- */

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          className="text-2xl leading-none transition disabled:opacity-60"
        >
          <span className={star <= value ? 'text-amber-400' : 'text-line'}>★</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Review form ---------------- */

function ReviewForm({
  orderId,
  targetType,
  label,
  onDone,
}: {
  orderId: number;
  targetType: 'RESTAURANT' | 'RIDER';
  label: string;
  onDone: () => void;
}) {
  const { token } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    if (rating < 1) {
      setError('Please pick a rating first');
      return;
    }

    setIsSaving(true);

    try {
      await api.createReview(
        {
          orderId,
          targetType,
          rating,
          comment: comment.trim() || undefined,
        },
        token
      );
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-brand-900">{label}</p>

      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} disabled={isSaving} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isSaving}
        rows={3}
        placeholder="Add a comment (optional)"
        className="mt-3 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60"
      />

      {error && <ErrorAlert message={error} />}

      <Button onClick={submit} disabled={isSaving} size="sm" className="mt-3">
        {isSaving && <Spinner />}
        {isSaving ? 'Saving…' : 'Submit review'}
      </Button>
    </div>
  );
}

/* ---------------- Page ---------------- */

function OrderDetailContent() {
  const { token } = useAuth();
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token || !orderId) return;

    api
      .getOrder(orderId, token)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token, orderId]);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <RowSkeleton count={4} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <ErrorAlert message={error} />
        <Link href="/orders" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Back to orders
          </Button>
        </Link>
      </main>
    );
  }

  if (!order) return null;

  const total = (order.orderitems ?? []).reduce(
    (sum, line) => sum + toNumber(line.priceAtOrder) * line.quantity,
    0
  );

  const reviews = order.reviews ?? [];
  const hasRestaurantReview = reviews.some((r) => r.targetType === 'RESTAURANT');
  const hasRiderReview = reviews.some((r) => r.targetType === 'RIDER');
  const canReview = order.status === 'DELIVERED';

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/orders"
        className="text-sm font-medium text-brand-600 underline-offset-4 hover:underline"
      >
        ← Back to orders
      </Link>

      {/* Header */}
      <div className="mt-5 rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
              {order.restaurant?.name ?? 'Restaurant'}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Order #{order.id} · {formatDate(order.createdAt)}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {order.deliveryStreet && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Delivered to
            </p>
            <p className="mt-1 text-sm text-brand-900">
              {order.deliveryStreet}, {order.deliveryCity}
            </p>
          </div>
        )}
        
        
        {order.rider && (
          <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">
            Delivered by <span className="font-medium text-brand-900">{order.rider.name}</span>
            {order.rider.phoneNo && ` · ${order.rider.phoneNo}`}
          </p>
        )}
      </div>

      <div className="mt-6">
        <OrderTimeline status={order.status} />
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-brand-900">
          Items
        </h2>

        <div className="mt-4 space-y-3">
          {(order.orderitems ?? []).map((line) => (
            <div key={line.id} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-900">
                  {line.menuItem?.name ?? `Item #${line.menuItemId}`}
                </p>
                <p className="text-xs text-ink-muted">
                  {line.quantity} × Rs. {toNumber(line.priceAtOrder).toFixed(0)}
                </p>
              </div>

              <p className="shrink-0 text-sm font-medium text-brand-900">
                Rs. {(toNumber(line.priceAtOrder) * line.quantity).toFixed(0)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="text-lg font-semibold text-brand-900">
            Rs. {total.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight text-brand-900">
          Reviews
        </h2>

        {!canReview && (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-white px-5 py-6 text-sm text-ink-muted">
            You can leave a review once this order has been delivered.
          </p>
        )}

        {canReview && (
          <div className="mt-3 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-line bg-white p-5"
              >
                <p className="text-sm font-semibold text-brand-900">
                  {review.targetType === 'RESTAURANT' ? 'Restaurant' : 'Rider'}
                </p>
                <p className="mt-2 text-amber-400">
                  {'★'.repeat(review.rating)}
                  <span className="text-line">{'★'.repeat(5 - review.rating)}</span>
                </p>
                {review.comment && (
                  <p className="mt-2 text-sm text-ink-muted">{review.comment}</p>
                )}
              </div>
            ))}

            {!hasRestaurantReview && (
              <ReviewForm
                orderId={order.id}
                targetType="RESTAURANT"
                label="Rate the restaurant"
                onDone={load}
              />
            )}

            {order.riderId && !hasRiderReview && (
              <ReviewForm
                orderId={order.id}
                targetType="RIDER"
                label="Rate the rider"
                onDone={load}
              />
            )}

            {hasRestaurantReview && (!order.riderId || hasRiderReview) && (
              <p className="text-sm text-ink-muted">
                Thanks — you've reviewed everything for this order.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}