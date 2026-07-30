'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, type Order } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import {
  PageHeading,
  RowSkeleton,
  EmptyState,
  OrderStatusBadge,
  Button,
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrdersContent() {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    api
      .getMyOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeading
        title="My orders"
        subtitle="Every order you've placed, newest first."
      />

      {error && <ErrorAlert message={error} />}

      <div className="mt-8">
        {isLoading && <RowSkeleton count={4} />}

        {!isLoading && !error && orders.length === 0 && (
          <EmptyState
            title="No orders yet"
            message="When you place an order, it will show up here."
            action={
              <Link href="/restaurants">
                <Button>Browse restaurants</Button>
              </Link>
            }
          />
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = (order.orderitems ?? []).reduce(
                (sum, line) => sum + line.quantity,
                0
              );

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-2xl border border-line bg-white p-5 transition hover:border-brand-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold tracking-tight text-brand-900">
                        {order.restaurant?.name ?? 'Restaurant'}
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        Order #{order.id} · {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-sm text-ink-muted">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      {order.rider && ` · Rider: ${order.rider.name}`}
                    </p>

                    <p className="text-base font-semibold text-brand-900">
                      Rs. {orderTotal(order).toFixed(0)}
                    </p>
                  </div>

                  {order.status === 'DELIVERED' &&
                    (order.reviews ?? []).length === 0 && (
                      <p className="mt-3 text-sm font-medium text-brand-600">
                        Leave a review →
                      </p>
                    )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <OrdersContent />
    </ProtectedRoute>
  );
}