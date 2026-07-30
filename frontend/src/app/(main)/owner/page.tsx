'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  api,
  type Restaurant,
  type Order,
  type MenuItem,
  type Review,
} from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import { PageHeading, Button, Spinner, RowSkeleton } from '@/components/ui';
import { StatCard, ReviewList, RatingSummary } from '@/components/ui-extras';

const inputClasses =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60';

const labelClasses = 'mb-1.5 block text-sm font-medium text-brand-900';

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : parseFloat(value);
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function OwnerProfileContent() {
  const { token } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [address, setAddress] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fillForm = (r: Restaurant) => {
    setName(r.name);
    setDescription(r.description ?? '');
    setCuisineType(r.cuisineType);
    setAddress(r.address);
    setIsOpen(r.isOpen);
  };

  useEffect(() => {
    if (!token) return;

    api
      .getMyRestaurant(token)
      .then(async (r) => {
        setRestaurant(r);
        fillForm(r);

        const [ords, items, revs] = await Promise.all([
          api.getRestaurantOrders(token).catch(() => [] as Order[]),
          api.getMenuByRestaurant(r.id, token).catch(() => [] as MenuItem[]),
          api.getRestaurantReviews(r.id, token).catch(() => [] as Review[]),
        ]);

        setOrders(ords);
        setMenuItems(items);
        setReviews(revs);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : '';
        const notCreatedYet =
          message.toLowerCase().includes('not created') || message.includes('404');

        if (!notCreatedYet) {
          setLoadError(message || 'Could not load your restaurant');
        } else {
          setIsEditing(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const stats = useMemo(() => {
    const active = orders.filter(
      (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    ).length;

    const todaysRevenue = orders
      .filter((o) => o.status === 'DELIVERED' && isToday(o.createdAt))
      .reduce(
        (sum, o) =>
          sum +
          (o.orderitems ?? []).reduce(
            (s, line) => s + toNumber(line.priceAtOrder) * line.quantity,
            0
          ),
        0
      );

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—';

    return {
      active,
      todaysRevenue,
      menuCount: menuItems.length,
      averageRating,
    };
  }, [orders, menuItems, reviews]);

  const save = async () => {
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim() || !cuisineType.trim() || !address.trim()) {
      setFormError('Name, cuisine type and address are all required');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      cuisineType: cuisineType.trim(),
      address: address.trim(),
      isOpen,
    };

    try {
      const saved = restaurant
        ? await api.updateRestaurant(restaurant.id, payload, token)
        : await api.createRestaurant(payload, token);

      setRestaurant(saved);
      fillForm(saved);
      setIsEditing(false);
      setSuccessMessage(restaurant ? 'Changes saved.' : 'Your restaurant is live.');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save your restaurant'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleOpen = async () => {
    if (!restaurant) return;

    const next = !restaurant.isOpen;
    setIsSaving(true);
    setFormError(null);

    try {
      const saved = await api.updateRestaurant(
        restaurant.id,
        { isOpen: next },
        token
      );
      setRestaurant(saved);
      setIsOpen(saved.isOpen);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not update status');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <RowSkeleton count={3} />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <ErrorAlert message={loadError} />
      </main>
    );
  }

  const isNew = !restaurant;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeading
        title={isNew ? 'Create your restaurant' : restaurant.name}
        subtitle={
          isNew
            ? 'Set up your restaurant so customers can find and order from you.'
            : `${restaurant.cuisineType} · ${restaurant.address}`
        }
        action={
          !isNew && !isEditing ? (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit details
            </Button>
          ) : undefined
        }
      />

      {/* Stats */}
      {!isNew && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active orders" value={stats.active} />
          <StatCard
            label="Today's revenue"
            value={`Rs. ${stats.todaysRevenue.toFixed(0)}`}
            hint="Delivered orders only"
          />
          <StatCard label="Menu items" value={stats.menuCount} />
          <StatCard
            label="Average rating"
            value={stats.averageRating}
            hint={`${reviews.length} review${reviews.length === 1 ? '' : 's'}`}
          />
        </div>
      )}

      {/* Status bar */}
      {!isNew && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-5 py-4">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              restaurant.isOpen ? 'bg-brand-400' : 'bg-gray-300'
            }`}
          />
          <p className="text-sm text-ink-muted">
            Currently{' '}
            <span className="font-semibold text-brand-900">
              {restaurant.isOpen ? 'open for orders' : 'closed'}
            </span>
          </p>

          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleOpen}
              disabled={isSaving}
            >
              {isSaving && <Spinner />}
              {restaurant.isOpen ? 'Close for orders' : 'Open for orders'}
            </Button>
            <Link href="/owner/menu">
              <Button variant="secondary" size="sm">
                Manage menu
              </Button>
            </Link>
            <Link href="/owner/orders">
              <Button variant="secondary" size="sm">
                View orders
              </Button>
            </Link>
          </div>
        </div>
      )}

      {successMessage && (
        <p className="mt-5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {successMessage}
        </p>
      )}

      {/* Details form */}
      {(isNew || isEditing) && (
        <div className="mt-6 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-brand-900">
            {isNew ? 'Restaurant details' : 'Edit details'}
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className={labelClasses}>
                Restaurant name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                placeholder="Karachi Biryani House"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="cuisineType" className={labelClasses}>
                Cuisine type
              </label>
              <input
                id="cuisineType"
                type="text"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                disabled={isSaving}
                placeholder="Pakistani"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClasses}>
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                placeholder="What you're known for"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="address" className={labelClasses}>
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSaving}
                placeholder="Main Boulevard, Karachi"
                className={inputClasses}
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-brand-900">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-line accent-brand-400"
              />
              Accepting orders
            </label>
          </div>

          {formError && <ErrorAlert message={formError} />}

          <div className="mt-5 flex gap-3">
            <Button onClick={save} disabled={isSaving}>
              {isSaving && <Spinner />}
              {isSaving ? 'Saving…' : isNew ? 'Create restaurant' : 'Save changes'}
            </Button>

            {!isNew && (
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  fillForm(restaurant);
                  setFormError(null);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      {!isNew && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight text-brand-900">
            What customers say
          </h2>

          {reviews.length > 0 && (
            <div className="mt-4">
              <RatingSummary reviews={reviews} />
            </div>
          )}

          <div className="mt-4">
            <ReviewList
              reviews={reviews}
              emptyMessage="No reviews yet. They'll appear here once customers rate their delivered orders."
            />
          </div>
        </section>
      )}
    </main>
  );
}

export default function OwnerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER', 'ADMIN']}>
      <OwnerProfileContent />
    </ProtectedRoute>
  );
}