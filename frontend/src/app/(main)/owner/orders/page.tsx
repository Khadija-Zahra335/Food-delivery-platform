'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, type Order, type OrderStatus, type Rider } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import {
  PageHeading,
  Button,
  Spinner,
  EmptyState,
  RowSkeleton,
  OrderStatusBadge,
} from '@/components/ui';

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : parseFloat(value);
}

function orderTotal(order: Order) {
  return (order.orderitems ?? []).reduce(
    (sum, line) => sum + toNumber(line.priceAtOrder) * line.quantity,
    0
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * The next step in an order's lifecycle. Delivered and cancelled are
 * end states, so they have nowhere further to go.
 */
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PLACED: 'PREPARING',
  PREPARING: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PLACED: 'Start preparing',
  PREPARING: 'Send out for delivery',
  OUT_FOR_DELIVERY: 'Mark delivered',
};

type Filter = 'active' | 'all' | OrderStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'all', label: 'All' },
];

function OwnerOrdersContent() {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [filter, setFilter] = useState<Filter>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRestaurant, setHasRestaurant] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);

  /** Which rider is selected in each order's dropdown, before assigning. */
  const [riderChoice, setRiderChoice] = useState<Record<number, number>>({});

  const loadRiders = () => {
    if (!token) return;
    api
      .getAvailableRiders(token)
      .then(setRiders)
      .catch(() => setRiders([]));
  };

  const load = () => {
    if (!token) return;

    api
      .getRestaurantOrders(token)
      .then(setOrders)
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Load failed';
        if (message.toLowerCase().includes('no restaurant')) {
          setHasRestaurant(false);
        } else {
          setError(message);
        }
      })
      .finally(() => setIsLoading(false));

    loadRiders();
  };

  useEffect(load, [token]);

  const visible = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'active') {
      return orders.filter(
        (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
      );
    }
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const activeCount = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setBusyOrderId(order.id);
    setError(null);

    try {
      await api.updateOrderStatus(order.id, status, token);
      setOrders((current) =>
        current.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
      // a delivered or cancelled order frees its rider up again
      if (status === 'DELIVERED' || status === 'CANCELLED') loadRiders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update order');
    } finally {
      setBusyOrderId(null);
    }
  };

  const assignRider = async (order: Order) => {
    const riderId = riderChoice[order.id];

    if (!riderId) {
      setError('Pick a rider first');
      return;
    }

    setBusyOrderId(order.id);
    setError(null);

    try {
      const updated = await api.assignRider(order.id, riderId, token);
      const rider = riders.find((r) => r.id === riderId);

      setOrders((current) =>
        current.map((o) =>
          o.id === order.id
            ? {
                ...o,
                riderId: updated.riderId,
                rider: rider
                  ? { id: rider.id, name: rider.name, phoneNo: rider.phoneNo }
                  : o.rider,
              }
            : o
        )
      );

      // that rider is now busy, so refresh the available list
      loadRiders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not assign rider');
    } finally {
      setBusyOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <RowSkeleton count={4} />
      </main>
    );
  }

  if (!hasRestaurant) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <EmptyState
          title="No restaurant yet"
          message="Create your restaurant before you can receive orders."
          action={
            <Link href="/owner">
              <Button>Set up restaurant</Button>
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeading
        title="Incoming orders"
        subtitle={
          activeCount > 0
            ? `${activeCount} order${activeCount === 1 ? '' : 's'} need attention.`
            : 'Nothing waiting on you right now.'
        }
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              load();
            }}
          >
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'bg-brand-400 text-white'
                : 'border border-line bg-white text-ink-muted hover:bg-brand-50 hover:text-brand-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="mt-6">
        {visible.length === 0 && (
          <EmptyState
            title={orders.length === 0 ? 'No orders yet' : 'Nothing matches this filter'}
            message={
              orders.length === 0
                ? 'Orders placed with your restaurant will appear here.'
                : 'Try a different filter to see other orders.'
            }
          />
        )}

        <div className="space-y-4">
          {visible.map((order) => {
            const next = NEXT_STATUS[order.status];
            const nextLabel = NEXT_LABEL[order.status];
            const isBusy = busyOrderId === order.id;
            const isFinished =
              order.status === 'DELIVERED' || order.status === 'CANCELLED';

            // A rider is needed before an order can go out for delivery.
            const needsRider = !order.riderId && !isFinished;
            const blockedFromDispatch =
              order.status === 'PREPARING' && !order.riderId;

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-brand-900">
                      Order #{order.id}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {order.customer?.name ?? 'Customer'} ·{' '}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Items */}
                <div className="mt-4 space-y-1.5 border-t border-line pt-4">
                  {(order.orderitems ?? []).map((line) => (
                    <div
                      key={line.id}
                      className="flex items-baseline justify-between gap-4 text-sm"
                    >
                      <span className="text-brand-900">
                        <span className="font-medium">{line.quantity}×</span>{' '}
                        {line.menuItem?.name ?? `Item #${line.menuItemId}`}
                      </span>
                      <span className="shrink-0 text-ink-muted">
                        Rs.{' '}
                        {(toNumber(line.priceAtOrder) * line.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery address */}
                {order.deliveryStreet && (
                  <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">
                    <span className="font-medium text-brand-900">Deliver to:</span>{' '}
                    {order.deliveryStreet}, {order.deliveryCity}
                  </p>
                )}

                {/* Rider */}
                <div className="mt-4 border-t border-line pt-4">
                  {order.rider ? (
                    <p className="text-sm text-ink-muted">
                      <span className="font-medium text-brand-900">Rider:</span>{' '}
                      {order.rider.name}
                      {order.rider.phoneNo && ` · ${order.rider.phoneNo}`}
                    </p>
                  ) : isFinished ? (
                    <p className="text-sm text-ink-muted">No rider was assigned</p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <label
                        htmlFor={`rider-${order.id}`}
                        className="text-sm font-medium text-brand-900"
                      >
                        Assign rider
                      </label>

                      {riders.length === 0 ? (
                        <p className="text-sm text-ink-muted">
                          No riders are free right now.
                        </p>
                      ) : (
                        <>
                          <select
                            id={`rider-${order.id}`}
                            value={riderChoice[order.id] ?? ''}
                            onChange={(e) =>
                              setRiderChoice((current) => ({
                                ...current,
                                [order.id]: Number(e.target.value),
                              }))
                            }
                            disabled={isBusy}
                            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60"
                          >
                            <option value="">Choose a rider…</option>
                            {riders.map((rider) => (
                              <option key={rider.id} value={rider.id}>
                                {rider.name}
                              </option>
                            ))}
                          </select>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => assignRider(order)}
                            disabled={isBusy || !riderChoice[order.id]}
                          >
                            {isBusy && <Spinner />}
                            Assign
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: total + actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-base font-semibold text-brand-900">
                    Rs. {orderTotal(order).toFixed(0)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {blockedFromDispatch && (
                      <p className="text-xs text-amber-700">
                        Assign a rider to send this out
                      </p>
                    )}

                    {next && nextLabel && (
                      <Button
                        size="sm"
                        onClick={() => changeStatus(order, next)}
                        disabled={isBusy || blockedFromDispatch}
                      >
                        {isBusy && <Spinner />}
                        {nextLabel}
                      </Button>
                    )}

                    {!isFinished && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => changeStatus(order, 'CANCELLED')}
                        disabled={isBusy}
                      >
                        Cancel
                      </Button>
                    )}

                    {isFinished && (
                      <p className="text-sm text-ink-muted">No further action</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function OwnerOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER', 'ADMIN']}>
      <OwnerOrdersContent />
    </ProtectedRoute>
  );
}