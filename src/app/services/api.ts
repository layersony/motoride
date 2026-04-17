/**
 * Central API client for the MotoRide Django backend.
 * Base URL is read from VITE_API_URL (falls back to localhost:8000).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ── Token storage ────────────────────────────────────────────────────────────

export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ── Fetch wrapper ────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, false);
    clearTokens();
    window.location.href = '/';
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return true;
  } catch {
    return false;
  }
}

// ── Types (matching Django serializers) ──────────────────────────────────────

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  address: string;
  avatar_url: string | null;
  is_staff: boolean;
  date_joined: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  product_count: number;
  sort_order: number;
}

export interface ApiProductSpec {
  id: number;
  label: string;
  value: string;
  sort_order: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  category: number;
  category_name: string;
  category_slug: string;
  description?: string;
  price: string;
  original_price: string | null;
  image: string | null;
  images?: { id: number; url: string; alt_text: string }[];
  stock?: number;
  in_stock: boolean;
  is_new: boolean;
  is_featured: boolean;
  on_sale: boolean;
  discount: number;
  rating: string;
  review_count: number;
  specifications?: ApiProductSpec[];
  features?: { id: number; feature: string; sort_order: number }[];
  reviews?: ApiReview[];
}

export interface ApiReview {
  id: number;
  user: number;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
}

export interface ApiCartItem {
  id: number;
  product: ApiProduct;
  quantity: number;
  total_price: string;
  added_at: string;
}

export interface ApiCart {
  items: ApiCartItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
}

export interface ApiOrder {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  subtotal: string;
  shipping_cost: string;
  tax: string;
  total: string;
  items: ApiOrderItem[];
  created_at: string;
}

export interface ApiOrderItem {
  id: number;
  product: number;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface ApiTestimonial {
  id: number;
  name: string;
  location: string;
  avatar_image: string | null;
  rating: number;
  text: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    password: string;
    password2: string;
  }) => request<{ user: ApiUser; access: string; refresh: string }>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (email: string, password: string) =>
    request<{ user: ApiUser; access: string; refresh: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: (refresh: string) =>
    request<void>('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

  getProfile: () => request<ApiUser>('/auth/profile/'),

  updateProfile: (data: Partial<ApiUser>) =>
    request<ApiUser>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { old_password: string; new_password: string; new_password2: string }) =>
    request<{ detail: string }>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const productsApi = {
  getCategories: () => request<ApiCategory[]>('/products/categories/'),

  getProducts: (params?: {
    category?: string;
    filter?: 'new' | 'sale' | 'featured';
    min_price?: number;
    max_price?: number;
    search?: string;
    ordering?: string;
    page?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
    }
    return request<PaginatedResponse<ApiProduct>>(`/products/?${qs}`);
  },

  getProduct: (id: number | string) =>
    request<ApiProduct>(`/products/${id}/`),

  getFeatured: () => request<ApiProduct[]>('/products/featured/'),
  getNewArrivals: () => request<ApiProduct[]>('/products/new-arrivals/'),
  getSale: () => request<ApiProduct[]>('/products/sale/'),

  getRelated: (id: number) => request<ApiProduct[]>(`/products/${id}/related/`),

  getReviews: (id: number) => request<ApiReview[]>(`/products/${id}/reviews/`),

  submitReview: (id: number, data: { rating: number; title?: string; body: string }) =>
    request<ApiReview>(`/products/${id}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Cart ──────────────────────────────────────────────────────────────────────

export const cartApi = {
  getCart: () => request<ApiCart>('/orders/cart/'),

  addItem: (productId: number, quantity = 1) =>
    request<ApiCartItem>('/orders/cart/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateItem: (cartItemId: number, quantity: number) =>
    request<ApiCartItem>(`/orders/cart/${cartItemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (cartItemId: number) =>
    request<void>(`/orders/cart/${cartItemId}/`, { method: 'DELETE' }),

  clearCart: () =>
    request<void>('/orders/cart/clear/', { method: 'DELETE' }),
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
  getOrders: () => request<ApiOrder[]>('/orders/'),

  getOrder: (id: number) => request<ApiOrder>(`/orders/${id}/`),

  createOrder: (data: {
    shipping_name: string;
    shipping_email: string;
    shipping_phone?: string;
    shipping_address: string;
    notes?: string;
  }) => request<ApiOrder>('/orders/create/', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Core ──────────────────────────────────────────────────────────────────────

export const coreApi = {
  getTestimonials: () => request<ApiTestimonial[]>('/testimonials/'),

  subscribeNewsletter: (email: string) =>
    request<{ detail: string }>('/newsletter/subscribe/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getSiteSettings: () => request<Record<string, unknown>>('/settings/'),
};
