'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, type Restaurant } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import { PageHeading, CardSkeleton, EmptyState } from '@/components/ui';

/** Stable placeholder imagery until the Restaurant model carries an image URL. */
const IMAGES = [
  '/images/rest_1.jpg',
  '/images/rest_2.jpg',
  '/images/rest_3.jpg',
  '/images/rest_4.jpg',
  '/images/rest_5.jpg',
  '/images/rest_6.jpg',
];

export function imageFor(id: number) {
  return IMAGES[id % IMAGES.length];
}

function RestaurantsContent() {
  const { token } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    api
      .getRestaurants(token)
      .then(setRestaurants)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  const visible = restaurants.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.cuisineType.toLowerCase().includes(q)
    );
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeading
        title="Restaurants"
        subtitle="Browse every restaurant on the platform."
      />

      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or cuisine…"
          className="w-full max-w-md rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
        />
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="mt-8">
        {isLoading && <CardSkeleton count={6} />}

        {!isLoading && !error && restaurants.length === 0 && (
          <EmptyState
            title="No restaurants yet"
            message="Once restaurants join the platform, they'll appear here."
          />
        )}

        {!isLoading && !error && restaurants.length > 0 && visible.length === 0 && (
          <EmptyState
            title="No matches"
            message={`Nothing matched "${search}". Try a different search.`}
          />
        )}

        {!isLoading && visible.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={imageFor(restaurant.id)}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent" />

                  <span
                    className={`absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold shadow-sm ${
                      restaurant.isOpen ? 'text-brand-600' : 'text-gray-500'
                    }`}
                  >
                    {restaurant.isOpen ? 'Open now' : 'Closed'}
                  </span>

                  <span className="absolute bottom-3 left-4 rounded-full bg-brand-400 px-3 py-1 text-xs font-semibold text-white">
                    {restaurant.cuisineType}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-brand-900">
                    {restaurant.name}
                  </h2>

                  {restaurant.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                      {restaurant.description}
                    </p>
                  )}

                  <p className="mt-auto pt-4 text-xs text-ink-muted">
                    {restaurant.address}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function RestaurantsPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <RestaurantsContent />
    </ProtectedRoute>
  );
}