const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/** Shape of every model the frontend reads from the backend. */
export type Restaurant = {
  id: number;
  name: string;
  description: string | null;
  cuisineType: string;
  isOpen: boolean;
  address: string;
  ownerId: number | null;
};

export type Category = {
  id: number;
  name: string;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  isAvailable: boolean;
  restaurantId: number;
  categoryId: number;
  category?: Category;
};

export type OrderStatus =
  | 'PLACED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItem = {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  priceAtOrder: string | number;
  menuItem?: MenuItem;
};

export type Review = {
  id: number;
  orderId: number;
  customerId: number;
  targetType: 'RESTAURANT' | 'RIDER';
  rating: number;
  comment: string | null;
};

export type Order = {
  id: number;
  customerId: number;
  restaurantId: number;
  riderId: number | null;
  status: OrderStatus;
  createdAt: string;
  restaurant?: Restaurant;
  customer?: { id: number; name: string; email: string };
  rider?: { id: number; name: string; phoneNo: string } | null;
  orderitems?: OrderItem[];
  reviews?: Review[];
  deliveryStreet: string | null;
  deliveryCity: string | null;
};

export type Address = {
  id: number;
  street: string;
  city: string;
  customerId: number;
};


export type Rider = {
  id: number;
  name: string;
  phoneNo: string;
  isAvailable: boolean;
};

/**
 * Wraps fetch so every call sends JSON, attaches the JWT when present,
 * and turns a non-2xx response into a thrown Error carrying the
 * backend's own message.
 */
export async function authFetch<T = unknown>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      (data as { message?: string })?.message || `Request failed (${res.status})`
    );
  }

  return data as T;
}

export const api = {

// login
login: (body: { email: string; password: string }) =>
    authFetch<{ token: string }>('/auth/login', null, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  register: (body: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) =>
    authFetch<unknown>('/auth/register', null, {
      method: 'POST',
      body: JSON.stringify(body),
    }),







  // --- restaurants ---
  getRestaurants: (token: string | null) =>
    authFetch<Restaurant[]>('/restaurants', token),

  getRestaurant: (id: number, token: string | null) =>
    authFetch<Restaurant>(`/restaurants/${id}`, token),

  getMyRestaurant: (token: string | null) =>
    authFetch<Restaurant>('/restaurants/my-restaurant', token),

  createRestaurant: (body: Partial<Restaurant>, token: string | null) =>
    authFetch<Restaurant>('/restaurants', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateRestaurant: (id: number, body: Partial<Restaurant>, token: string | null) =>
    authFetch<Restaurant>(`/restaurants/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // --- menu ---
  getMenuByRestaurant: (restaurantId: number, token: string | null) =>
    authFetch<MenuItem[]>(`/menu-items/restaurant/${restaurantId}`, token),

  createMenuItem: (body: Partial<MenuItem>, token: string | null) =>
    authFetch<MenuItem>('/menu-items', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateMenuItem: (id: number, body: Partial<MenuItem>, token: string | null) =>
    authFetch<MenuItem>(`/menu-items/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteMenuItem: (id: number, token: string | null) =>
    authFetch<void>(`/menu-items/${id}`, token, { method: 'DELETE' }),

  // --- categories ---
  getCategories: (token: string | null) =>
    authFetch<Category[]>('/categories', token),

  createCategory: (name: string, token: string | null) =>
    authFetch<Category>('/categories', token, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  updateCategory: (id: number, name: string, token: string | null) =>
    authFetch<Category>(`/categories/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  deleteCategory: (id: number, token: string | null) =>
    authFetch<void>(`/categories/${id}`, token, { method: 'DELETE' }),

  // --- orders ---
  getMyOrders: (token: string | null) =>
    authFetch<Order[]>('/orders/my-orders', token),

  getRestaurantOrders: (token: string | null) =>
    authFetch<Order[]>('/orders/restaurant-orders', token),

  getOrder: (id: number, token: string | null) =>
    authFetch<Order>(`/orders/${id}`, token),

  placeOrder: (
  body: {
    restaurantId: number;
    deliveryStreet: string;
    deliveryCity: string;
    items: { menuItemId: number; quantity: number; priceAtOrder: number }[];
  },
  token: string | null
) =>
  authFetch<{ order: Order }>('/orders', token, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  updateOrderStatus: (id: number, status: OrderStatus, token: string | null) =>
    authFetch<Order>(`/orders/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // --- addresses ---
  getMyAddresses: (token: string | null) =>
    authFetch<Address[]>('/addresses', token),

  createAddress: (body: { street: string; city: string }, token: string | null) =>
    authFetch<Address>('/addresses', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateAddress: (
    id: number,
    body: { street?: string; city?: string },
    token: string | null
  ) =>
    authFetch<Address>(`/addresses/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteAddress: (id: number, token: string | null) =>
    authFetch<void>(`/addresses/${id}`, token, { method: 'DELETE' }),

  // --- reviews ---
  getRestaurantReviews: (restaurantId: number, token: string | null) =>
    authFetch<Review[]>(`/reviews/restaurant/${restaurantId}`, token),

  createReview: (
    body: {
      orderId: number;
      targetType: 'RESTAURANT' | 'RIDER';
      rating: number;
      comment?: string;
    },
    token: string | null
  ) =>
    authFetch<Review>('/reviews', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

    // rider-related API calls
    getAvailableRiders: (token: string | null) =>
    authFetch<Rider[]>('/riders/available', token),

  assignRider: (orderId: number, riderId: number, token: string | null) =>
    authFetch<Order>(`/orders/${orderId}`, token, {
      method: 'PUT',
      body: JSON.stringify({ riderId }),
    }),
};