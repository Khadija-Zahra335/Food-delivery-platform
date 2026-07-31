'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ReviewList, RatingSummary } from '@/components/ui-extras';
import {
  api,
  type Restaurant,
  type MenuItem,
  type Review,
  type Address,
} from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import { Button, EmptyState, RowSkeleton, Spinner } from '@/components/ui';
import { imageFor } from '../page';

type CartLine = { item: MenuItem; quantity: number };

function toNumber(price: string | number) {
  return typeof price === 'number' ? price : parseFloat(price);
}

function RestaurantDetailContent() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const restaurantId = Number(params.id);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !restaurantId) return;

    Promise.all([
      api.getRestaurant(restaurantId, token),
      api.getMenuByRestaurant(restaurantId, token),
      api.getRestaurantReviews(restaurantId, token).catch(() => [] as Review[]),
      api.getMyAddresses(token).catch(() => [] as Address[]),
    ])
      .then(([r, items, revs, addrs]) => {
        setRestaurant(r);
        setMenuItems(items);
        setReviews(revs);
        setAddresses(addrs);
        // preselect the first saved address so ordering is one click fewer
        if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token, restaurantId]);

  /** Group menu items by their category name for display. */
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const key = item.category?.name ?? 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [menuItems]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const cartTotal = cart.reduce(
    (sum, line) => sum + toNumber(line.item.price) * line.quantity,
    0
  );

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (existing) {
        return current.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...current, { item, quantity: 1 }];
    });
  };

  const changeQuantity = (itemId: number, delta: number) => {
    setCart((current) =>
      current
        .map((line) =>
          line.item.id === itemId
            ? { ...line, quantity: line.quantity + delta }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const placeOrder = async () => {
    setOrderError(null);

    const address = addresses.find((a) => a.id === selectedAddressId);

    if (!address) {
      setOrderError('Please choose a delivery address');
      return;
    }

    setIsPlacing(true);

    try {
      await api.placeOrder(
        {
          restaurantId,
          deliveryStreet: address.street,
          deliveryCity: address.city,
          items: cart.map((line) => ({
            menuItemId: line.item.id,
            quantity: line.quantity,
            priceAtOrder: toNumber(line.item.price),
          })),
        },
        token
      );

      setCart([]);
      router.push('/orders');
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Could not place order');
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-brand-50" />
        <div className="mt-8">
          <RowSkeleton count={4} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <ErrorAlert message={error} />
      </main>
    );
  }

  if (!restaurant) return null;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Restaurant header */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="relative h-48">
          <img
            src={imageFor(restaurant.id)}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-900/50" />
          <div className="absolute bottom-5 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {restaurant.name}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  restaurant.isOpen
                    ? 'bg-white text-brand-600'
                    : 'bg-white/90 text-gray-500'
                }`}
              >
                {restaurant.isOpen ? 'Open now' : 'Closed'}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-white/85">
              {restaurant.cuisineType} · {restaurant.address}
              {averageRating && ` · ★ ${averageRating} (${reviews.length})`}
            </p>
          </div>
        </div>

        {restaurant.description && (
          <p className="px-6 py-5 text-sm leading-relaxed text-ink-muted">
            {restaurant.description}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Menu */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight text-brand-900">
            Menu
          </h2>

          {menuItems.length === 0 && (
            <div className="mt-5">
              <EmptyState
                title="No menu items yet"
                message="This restaurant hasn't added anything to its menu."
              />
            </div>
          )}

          {grouped.map(([categoryName, items]) => (
            <div key={categoryName} className="mt-7">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                {categoryName}
              </h3>

              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-line bg-white p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-brand-900">
                        {item.name}
                        {!item.isAvailable && (
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                            Unavailable
                          </span>
                        )}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-sm text-ink-muted">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-semibold text-brand-600">
                        Rs. {toNumber(item.price).toFixed(0)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      disabled={!item.isAvailable || !restaurant.isOpen}
                      onClick={() => addToCart(item)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

          



        {/* Cart */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-semibold tracking-tight text-brand-900">
              Your order
            </h2>

            {cart.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">
                Nothing added yet. Pick something from the menu.
              </p>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  {cart.map((line) => (
                    <div
                      key={line.item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand-900">
                          {line.item.name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Rs. {toNumber(line.item.price).toFixed(0)} each
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => changeQuantity(line.item.id, -1)}
                          aria-label={`Remove one ${line.item.name}`}
                          className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink-muted transition hover:bg-brand-50"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-medium">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(line.item.id, 1)}
                          aria-label={`Add one ${line.item.name}`}
                          className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink-muted transition hover:bg-brand-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery address */}
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-sm font-medium text-brand-900">
                    Deliver to
                  </p>

                  {addresses.length === 0 ? (
                    <div className="mt-2 rounded-lg border border-dashed border-line px-3 py-4 text-center">
                      <p className="text-sm text-ink-muted">
                        You have no saved addresses.
                      </p>
                      <Link href="/addresses" className="mt-3 inline-block">
                        <Button variant="secondary" size="sm">
                          Add an address
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={selectedAddressId ?? ''}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      disabled={isPlacing}
                      aria-label="Delivery address"
                      className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60"
                    >
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.street}, {address.city}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-sm text-ink-muted">Total</span>
                  <span className="text-lg font-semibold text-brand-900">
                    Rs. {cartTotal.toFixed(0)}
                  </span>
                </div>

                {orderError && <ErrorAlert message={orderError} />}

                <Button
                  onClick={placeOrder}
                  disabled={isPlacing || addresses.length === 0}
                  className="mt-4 w-full"
                >
                  {isPlacing && <Spinner />}
                  {isPlacing ? 'Placing order…' : 'Place order'}
                </Button>
              </>
            )}
          </div>

           {/* Reviews */}

          <section className="mt-10 border-t border-line pt-8">
            <h2 className="text-xl font-semibold tracking-tight text-brand-900">
              Reviews
            </h2>

            {reviews.length > 0 && (
              <div className="mt-4">
                <RatingSummary reviews={reviews} />
              </div>
            )}

            <div className="mt-4">
              <ReviewList
                reviews={reviews}
                emptyMessage="No reviews yet for this restaurant."
              />
            </div>
          </section>


        </aside>
      </div>

           

    </main>
  );
}

export default function RestaurantDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <RestaurantDetailContent />
    </ProtectedRoute>
  );
}