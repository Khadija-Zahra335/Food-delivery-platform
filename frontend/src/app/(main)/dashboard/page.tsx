'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authFetch } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

type Restaurant = {
  id: number;
  name: string;
  description: string | null;
  cuisineType: string;
  isOpen: boolean;
  address: string;
};

// Placeholder imagery until an imageUrl field is added to the Restaurant model.
// Picks a stable image per restaurant so it doesn't change between renders.
const FALLBACK_IMAGES = [
  'images/rest_1.avif',
  'images/rest_2.avif',
  'images/rest_3.avif',
  'images/rest_4.avif',
  'images/rest_5.avif',
  'images/rest_6.avif',
];

function imageFor(id: number) {
  return FALLBACK_IMAGES[id % FALLBACK_IMAGES.length];
}

export default function DashboardPage() {
  const { token, logout } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    authFetch('/restaurants', token)
      .then((data) => setRestaurants(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col bg-canvas">
        <header className="border-b border-line bg-white">
          <div className="flex items-center justify-between px-10 py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400 text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M4 11h16M6 11a6 6 0 0 1 12 0M5 15h14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-xl font-semibold tracking-tight text-brand-900">
                Foodly
              </span>
            </div>

            <button
              onClick={logout}
              className="rounded-lg bg-brand-400 px-6 py-2.5 text-base font-semibold text-white transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-50"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-10 py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-brand-900">
                Restaurants
              </h1>
              <p className="mt-3 text-lg text-ink-muted">
                Browse every restaurant on the platform.
              </p>
            </div>

            {!isLoading && !error && restaurants.length > 0 && (
              <p className="hidden shrink-0 text-base text-ink-muted sm:block">
                {restaurants.length}{' '}
                {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
              </p>
            )}
          </div>

          {isLoading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="overflow-hidden rounded-2xl border border-line bg-white"
                >
                  <div className="h-44 animate-pulse bg-brand-50" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-brand-50" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-brand-50" />
                    <div className="h-4 w-full animate-pulse rounded bg-brand-50" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-10 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 text-base text-red-700"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM10 14a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && restaurants.length === 0 && (
            <p className="mt-10 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center text-lg text-ink-muted">
              No restaurants yet.
            </p>
          )}

          {!isLoading && !error && restaurants.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <article
                  key={restaurant.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={imageFor(restaurant.id)}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent" />

                    <span
                      className={
                        restaurant.isOpen
                          ? 'absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-brand-600 shadow-sm'
                          : 'absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-gray-500 shadow-sm'
                      }
                    >
                      {restaurant.isOpen ? 'Open now' : 'Closed'}
                    </span>

                    <span className="absolute bottom-4 left-5 rounded-full bg-brand-400 px-3 py-1 text-sm font-semibold text-white">
                      {restaurant.cuisineType}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-xl font-semibold tracking-tight text-brand-900">
                      {restaurant.name}
                    </h2>

                    {restaurant.description && (
                      <p className="mt-2.5 line-clamp-2 text-base leading-relaxed text-ink-muted">
                        {restaurant.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-start gap-2 pt-6 text-sm text-ink-muted">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-200"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a6 6 0 0 0-6 6c0 4.2 5.3 9.5 5.5 9.7a.7.7 0 0 0 1 0C10.7 17.5 16 12.2 16 8a6 6 0 0 0-6-6Zm0 8.2A2.2 2.2 0 1 1 10 5.8a2.2 2.2 0 0 1 0 4.4Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{restaurant.address}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
