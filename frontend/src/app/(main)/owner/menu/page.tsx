'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  api,
  type Restaurant,
  type MenuItem,
  type Category,
} from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorAlert from '@/components/ErrorAlert';
import {
  PageHeading,
  Button,
  Spinner,
  EmptyState,
  RowSkeleton,
} from '@/components/ui';

const inputClasses =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60';

const labelClasses = 'mb-1.5 block text-sm font-medium text-brand-900';

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : parseFloat(value);
}

type Tab = 'items' | 'categories';

function OwnerMenuContent() {
  const { token } = useAuth();

  const [tab, setTab] = useState<Tab>('items');

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- item form ---------- */
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState<number | null>(null);
  const [itemAvailable, setItemAvailable] = useState(true);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [itemFormError, setItemFormError] = useState<string | null>(null);

  /* ---------- category form ---------- */
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  /* ---------- busy flags for row actions ---------- */
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [busyCategoryId, setBusyCategoryId] = useState<number | null>(null);

  /* ---------- loading ---------- */

  const loadMenu = async (restaurantId: number) => {
    const [items, cats] = await Promise.all([
      api.getMenuByRestaurant(restaurantId, token),
      api.getCategories(token),
    ]);
    setMenuItems(items);
    setCategories(cats);
    if (cats.length > 0 && itemCategoryId === null) {
      setItemCategoryId(cats[0].id);
    }
  };

  useEffect(() => {
    if (!token) return;

    api
      .getMyRestaurant(token)
      .then(async (r) => {
        setRestaurant(r);
        await loadMenu(r.id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Load failed'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const key = item.category?.name ?? 'Uncategorised';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [menuItems]);

  /* ---------- item actions ---------- */

  const openAddItem = () => {
    setEditingItemId(null);
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemCategoryId(categories[0]?.id ?? null);
    setItemAvailable(true);
    setItemFormError(null);
    setItemFormOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemDescription(item.description ?? '');
    setItemPrice(String(toNumber(item.price)));
    setItemCategoryId(item.categoryId);
    setItemAvailable(item.isAvailable);
    setItemFormError(null);
    setItemFormOpen(true);
  };

  const closeItemForm = () => {
    setItemFormOpen(false);
    setEditingItemId(null);
    setItemFormError(null);
  };

  const saveItem = async () => {
    setItemFormError(null);

    const price = parseFloat(itemPrice);

    if (!itemName.trim()) {
      setItemFormError('Item name is required');
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      setItemFormError('Price must be a number greater than zero');
      return;
    }
    if (!itemCategoryId) {
      setItemFormError('Pick a category, or create one first');
      return;
    }
    if (!restaurant) return;

    setIsSavingItem(true);

    const payload = {
      name: itemName.trim(),
      description: itemDescription.trim() || undefined,
      price,
      isAvailable: itemAvailable,
      categoryId: itemCategoryId,
    };

    try {
      if (editingItemId) {
        await api.updateMenuItem(editingItemId, payload, token);
      } else {
        await api.createMenuItem(
          { ...payload, restaurantId: restaurant.id },
          token
        );
      }

      closeItemForm();
      await loadMenu(restaurant.id);
    } catch (err) {
      setItemFormError(
        err instanceof Error ? err.message : 'Could not save menu item'
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    if (!restaurant) return;

    setBusyItemId(item.id);
    setError(null);

    try {
      await api.updateMenuItem(
        item.id,
        { isAvailable: !item.isAvailable },
        token
      );
      setMenuItems((current) =>
        current.map((i) =>
          i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update item');
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async (item: MenuItem) => {
    setBusyItemId(item.id);
    setError(null);

    try {
      await api.deleteMenuItem(item.id, token);
      setMenuItems((current) => current.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete item');
    } finally {
      setBusyItemId(null);
    }
  };

  /* ---------- category actions ---------- */

  const saveCategory = async () => {
    setCategoryError(null);

    if (!categoryName.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    setIsSavingCategory(true);

    try {
      if (editingCategoryId) {
        const updated = await api.updateCategory(
          editingCategoryId,
          categoryName.trim(),
          token
        );
        setCategories((current) =>
          current.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const created = await api.createCategory(categoryName.trim(), token);
        setCategories((current) => [...current, created]);
      }

      setCategoryName('');
      setEditingCategoryId(null);
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : 'Could not save category'
      );
    } finally {
      setIsSavingCategory(false);
    }
  };

  const removeCategory = async (category: Category) => {
    setBusyCategoryId(category.id);
    setCategoryError(null);

    try {
      await api.deleteCategory(category.id, token);
      setCategories((current) => current.filter((c) => c.id !== category.id));
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : 'Could not delete category'
      );
    } finally {
      setBusyCategoryId(null);
    }
  };

  /* ---------- render ---------- */

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <RowSkeleton count={4} />
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <EmptyState
          title="No restaurant yet"
          message="Create your restaurant before adding a menu."
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
        title="Menu"
        subtitle={`Manage what ${restaurant.name} offers.`}
      />

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-line bg-white p-1">
        {(['items', 'categories'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-brand-50 text-brand-800'
                : 'text-ink-muted hover:text-brand-800'
            }`}
          >
            {t === 'items' ? `Items (${menuItems.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {error && <ErrorAlert message={error} />}

      {/* ---------------- ITEMS ---------------- */}
      {tab === 'items' && (
        <>
          <div className="mt-6 flex justify-end">
            {!itemFormOpen && (
              <Button onClick={openAddItem} disabled={categories.length === 0}>
                Add item
              </Button>
            )}
          </div>

          {categories.length === 0 && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Create a category first — every menu item needs one.
            </p>
          )}

          {itemFormOpen && (
            <div className="mt-4 rounded-2xl border border-line bg-white p-6">
              <h2 className="text-lg font-semibold tracking-tight text-brand-900">
                {editingItemId ? 'Edit item' : 'New item'}
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="itemName" className={labelClasses}>
                    Name
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    disabled={isSavingItem}
                    placeholder="Chicken Biryani"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="itemDescription" className={labelClasses}>
                    Description
                  </label>
                  <textarea
                    id="itemDescription"
                    rows={2}
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    disabled={isSavingItem}
                    placeholder="Spicy rice dish with tender chicken"
                    className={inputClasses}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="itemPrice" className={labelClasses}>
                      Price (Rs.)
                    </label>
                    <input
                      id="itemPrice"
                      type="number"
                      min="1"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      disabled={isSavingItem}
                      placeholder="450"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="itemCategory" className={labelClasses}>
                      Category
                    </label>
                    <select
                      id="itemCategory"
                      value={itemCategoryId ?? ''}
                      onChange={(e) => setItemCategoryId(Number(e.target.value))}
                      disabled={isSavingItem}
                      className={inputClasses}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-sm text-brand-900">
                  <input
                    type="checkbox"
                    checked={itemAvailable}
                    onChange={(e) => setItemAvailable(e.target.checked)}
                    disabled={isSavingItem}
                    className="h-4 w-4 rounded border-line accent-brand-400"
                  />
                  Available to order
                </label>
              </div>

              {itemFormError && <ErrorAlert message={itemFormError} />}

              <div className="mt-5 flex gap-3">
                <Button onClick={saveItem} disabled={isSavingItem}>
                  {isSavingItem && <Spinner />}
                  {isSavingItem
                    ? 'Saving…'
                    : editingItemId
                    ? 'Save changes'
                    : 'Add item'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={closeItemForm}
                  disabled={isSavingItem}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            {menuItems.length === 0 && !itemFormOpen && (
              <EmptyState
                title="No menu items yet"
                message="Add your first dish so customers can order it."
                action={
                  categories.length > 0 ? (
                    <Button onClick={openAddItem}>Add item</Button>
                  ) : undefined
                }
              />
            )}

            {grouped.map(([categoryLabel, items]) => (
              <div key={categoryLabel} className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {categoryLabel}
                </h3>

                <div className="mt-3 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-white p-4"
                    >
                      <div className="min-w-0 flex-1">
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

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleAvailability(item)}
                          disabled={busyItemId === item.id}
                        >
                          {item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeItem(item)}
                          disabled={busyItemId === item.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------------- CATEGORIES ---------------- */}
      {tab === 'categories' && (
        <>
          <div className="mt-6 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight text-brand-900">
              {editingCategoryId ? 'Rename category' : 'New category'}
            </h2>

            <p className="mt-1.5 text-sm text-ink-muted">
              Categories are shared across the platform — appetisers, mains,
              beverages and so on.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={isSavingCategory}
                placeholder="Main Course"
                className={`${inputClasses} sm:max-w-xs`}
              />

              <Button onClick={saveCategory} disabled={isSavingCategory}>
                {isSavingCategory && <Spinner />}
                {isSavingCategory
                  ? 'Saving…'
                  : editingCategoryId
                  ? 'Save'
                  : 'Add category'}
              </Button>

              {editingCategoryId && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryName('');
                  }}
                  disabled={isSavingCategory}
                >
                  Cancel
                </Button>
              )}
            </div>

            {categoryError && <ErrorAlert message={categoryError} />}
          </div>

          <div className="mt-6">
            {categories.length === 0 ? (
              <EmptyState
                title="No categories yet"
                message="Add one above so you can start building your menu."
              />
            ) : (
              <div className="space-y-3">
                {categories.map((category) => {
                  const itemCount = menuItems.filter(
                    (i) => i.categoryId === category.id
                  ).length;

                  return (
                    <div
                      key={category.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white p-4"
                    >
                      <div>
                        <p className="font-medium text-brand-900">
                          {category.name}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {itemCount} of your{' '}
                          {itemCount === 1 ? 'item' : 'items'} in this category
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setCategoryName(category.name);
                            setCategoryError(null);
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeCategory(category)}
                          disabled={busyCategoryId === category.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default function OwnerMenuPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER', 'ADMIN']}>
      <OwnerMenuContent />
    </ProtectedRoute>
  );
}