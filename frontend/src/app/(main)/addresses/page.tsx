'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, type Address } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import {
  PageHeading,
  RowSkeleton,
  EmptyState,
  Button,
  Spinner,
} from '@/components/ui';

const inputClasses =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60';

function AddressesContent() {
  const { token } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state — used for both adding and editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;

    api
      .getMyAddresses(token)
      .then(setAddresses)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token]);

  const openAdd = () => {
    setEditingId(null);
    setStreet('');
    setCity('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setStreet(address.street);
    setCity(address.city);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const save = async () => {
    setFormError(null);

    if (!street.trim() || !city.trim()) {
      setFormError('Street and city are both required');
      return;
    }

    setIsSaving(true);

    try {
      if (editingId) {
        await api.updateAddress(
          editingId,
          { street: street.trim(), city: city.trim() },
          token
        );
      } else {
        await api.createAddress(
          { street: street.trim(), city: city.trim() },
          token
        );
      }

      closeForm();
      setIsLoading(true);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save address');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id: number) => {
    setDeletingId(id);
    setError(null);

    try {
      await api.deleteAddress(id, token);
      setAddresses((current) => current.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete address');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <PageHeading
        title="Delivery addresses"
        subtitle="Save the places you order to most often."
        action={
          !isFormOpen ? <Button onClick={openAdd}>Add address</Button> : undefined
        }
      />

      {error && <ErrorAlert message={error} />}

      {isFormOpen && (
        <div className="mt-6 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-brand-900">
            {editingId ? 'Edit address' : 'New address'}
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="street"
                className="mb-1.5 block text-sm font-medium text-brand-900"
              >
                Street
              </label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={isSaving}
                placeholder="House 12, Street 5, DHA Phase 6"
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-1.5 block text-sm font-medium text-brand-900"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isSaving}
                placeholder="Lahore"
                className={inputClasses}
              />
            </div>
          </div>

          {formError && <ErrorAlert message={formError} />}

          <div className="mt-5 flex gap-3">
            <Button onClick={save} disabled={isSaving}>
              {isSaving && <Spinner />}
              {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Add address'}
            </Button>
            <Button variant="secondary" onClick={closeForm} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8">
        {isLoading && <RowSkeleton count={2} />}

        {!isLoading && !error && addresses.length === 0 && !isFormOpen && (
          <EmptyState
            title="No saved addresses"
            message="Add an address so it's ready the next time you order."
            action={<Button onClick={openAdd}>Add your first address</Button>}
          />
        )}

        {!isLoading && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-white p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-200"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a6 6 0 0 0-6 6c0 4.2 5.3 9.5 5.5 9.7a.7.7 0 0 0 1 0C10.7 17.5 16 12.2 16 8a6 6 0 0 0-6-6Zm0 8.2A2.2 2.2 0 1 1 10 5.8a2.2 2.2 0 0 1 0 4.4Z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-900">
                      {address.street}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">{address.city}</p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(address)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => remove(address.id)}
                    disabled={deletingId === address.id}
                  >
                    {deletingId === address.id ? 'Removing…' : 'Remove'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <AddressesContent />
    </ProtectedRoute>
  );
}