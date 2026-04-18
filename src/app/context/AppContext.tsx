import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  authApi,
  cartApi,
  setTokens,
  clearTokens,
  getAccessToken,
  type ApiUser,
  type ApiCartItem,
} from '../services/api';

// ── Interfaces (kept identical so all existing components compile) ────────────

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  /** Internal: the cart-item row id from the backend (differs from product id) */
  cartItemId?: number;
}

interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface AppContextType {
  // Auth
  apiUser: ApiUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    password: string;
    password2: string;
  }) => Promise<void>;
  logout: () => Promise<void>;

  // Cart (backed by API when authenticated, local otherwise)
  cart: CartItem[];
  cartLoading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateCartQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;

  // Favorites (local — add backend persistence separately if needed)
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: number) => boolean;

  // User profile (mirrors ApiUser for the Profile page)
  user: User;
  updateUser: (userData: Partial<User>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => boolean;
  syncProfileWithApi: () => Promise<void>;
}

// ── Helper: map ApiCartItem → local CartItem ─────────────────────────────────

function toCartItem(item: ApiCartItem): CartItem {
  const p = item.product;
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image ?? '',
    category: p.category_name,
    quantity: item.quantity,
    cartItemId: item.id,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Auth state ─────────────────────────────────────────────────────────────
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ── Cart state ─────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Always-current ref so effects can read the latest cart without depending on it
  const cartRef = useRef<CartItem[]>([]);
  cartRef.current = cart;

  // ── Favorites (local) ──────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // ── Profile state (populated from apiUser) ─────────────────────────────────
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // ── Bootstrap: check for existing token on mount ──────────────────────────
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      authApi
        .getProfile()
        .then((profile) => {
          setApiUser(profile);
          setUser({
            name: profile.full_name || profile.username,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
          });
        })
        .catch(() => clearTokens())
        .finally(() => setIsAuthLoading(false));
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  // ── Load server cart when user logs in, merging any guest items ──────────
  useEffect(() => {
    if (!apiUser) return;

    // Snapshot guest cart at the moment login fires (before we overwrite it)
    const guestItems = cartRef.current;

    setCartLoading(true);
    cartApi
      .getCart()
      .then(async (res) => {
        const serverItems = res.items.map(toCartItem);
        const serverProductIds = new Set(serverItems.map((i) => i.id));

        // Push any guest items that aren't already on the server cart
        const toAdd = guestItems.filter((item) => !serverProductIds.has(item.id));
        if (toAdd.length > 0) {
          await Promise.allSettled(
            toAdd.map((item) => cartApi.addItem(item.id, item.quantity))
          );
          // Reload so we have correct cartItemIds for all items
          const refreshed = await cartApi.getCart();
          setCart(refreshed.items.map(toCartItem));
        } else {
          setCart(serverItems);
        }
      })
      .catch(() => {})
      .finally(() => setCartLoading(false));
  }, [apiUser]);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setTokens(res.access, res.refresh);
    setApiUser(res.user);
    setUser({
      name: res.user.full_name || res.user.username,
      email: res.user.email,
      phone: res.user.phone,
      address: res.user.address,
    });
  }, []);

  const register = useCallback(async (data: Parameters<typeof authApi.register>[0]) => {
    const res = await authApi.register(data);
    setTokens(res.access, res.refresh);
    setApiUser(res.user);
    setUser({
      name: res.user.full_name || res.user.username,
      email: res.user.email,
      phone: res.user.phone,
      address: res.user.address,
    });
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token') ?? '';
    try {
      await authApi.logout(refresh);
    } catch {}
    clearTokens();
    setApiUser(null);
    setCart([]);
    setUser({ name: '', email: '', phone: '', address: '' });
  }, []);

  // ── Cart actions ──────────────────────────────────────────────────────────

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      // Optimistic local update
      setCart((prev) => {
        const existing = prev.find((c) => c.id === item.id);
        if (existing) {
          return prev.map((c) =>
            c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
          );
        }
        return [...prev, { ...item, quantity }];
      });

      // Sync with backend if authenticated
      if (apiUser) {
        cartApi.addItem(item.id, quantity).then((res) => {
          // Update the cartItemId on the local item so future updates/removes work
          setCart((prev) =>
            prev.map((c) => (c.id === item.id ? { ...c, cartItemId: res.id } : c))
          );
        }).catch(() => {});
      }
    },
    [apiUser]
  );

  const removeFromCart = useCallback(
    (id: number) => {
      setCart((prev) => {
        const item = prev.find((c) => c.id === id);
        if (item?.cartItemId && apiUser) {
          cartApi.removeItem(item.cartItemId).catch(() => {});
        }
        return prev.filter((c) => c.id !== id);
      });
    },
    [apiUser]
  );

  const updateCartQuantity = useCallback(
    (id: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setCart((prev) => {
        const item = prev.find((c) => c.id === id);
        if (item?.cartItemId && apiUser) {
          cartApi.updateItem(item.cartItemId, quantity).catch(() => {});
        }
        return prev.map((c) => (c.id === id ? { ...c, quantity } : c));
      });
    },
    [apiUser, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    if (apiUser) {
      cartApi.clearCart().catch(() => {});
    }
  }, [apiUser]);

  // ── Favorites ─────────────────────────────────────────────────────────────

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === item.id);
      return exists ? prev.filter((f) => f.id !== item.id) : [...prev, item];
    });
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some((f) => f.id === id),
    [favorites]
  );

  // ── Profile ───────────────────────────────────────────────────────────────

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...userData }));
    if (apiUser) {
      const patch: Record<string, string> = {};
      if (userData.name) {
        const [first, ...rest] = userData.name.split(' ');
        patch.first_name = first;
        patch.last_name = rest.join(' ');
      }
      if (userData.phone !== undefined) patch.phone = userData.phone;
      if (userData.address !== undefined) patch.address = userData.address;
      authApi.updateProfile(patch).catch(() => {});
    }
  }, [apiUser]);

  const updatePassword = useCallback(
    (oldPassword: string, newPassword: string): boolean => {
      if (!oldPassword || !newPassword) return false;
      if (apiUser) {
        authApi
          .changePassword({ old_password: oldPassword, new_password: newPassword, new_password2: newPassword })
          .catch(() => {});
      }
      return true;
    },
    [apiUser]
  );

  const syncProfileWithApi = useCallback(async () => {
    if (!apiUser) return;
    const profile = await authApi.getProfile();
    setApiUser(profile);
    setUser({
      name: profile.full_name || profile.username,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
    });
  }, [apiUser]);

  return (
    <AppContext.Provider
      value={{
        apiUser,
        isAuthenticated: !!apiUser,
        isAuthLoading,
        login,
        register,
        logout,
        cart,
        cartLoading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        isFavorite,
        user,
        updateUser,
        updatePassword,
        syncProfileWithApi,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
