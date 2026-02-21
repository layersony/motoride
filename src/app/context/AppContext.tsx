import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
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
  cart: CartItem[];
  favorites: FavoriteItem[];
  user: User;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateCartQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: number) => boolean;
  updateUser: (userData: Partial<User>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [user, setUser] = useState<User>({
    name: 'John Rider',
    email: 'john.rider@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, New York, NY 10001',
  });

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prevFavorites) => {
      const exists = prevFavorites.find((fav) => fav.id === item.id);
      if (exists) {
        return prevFavorites.filter((fav) => fav.id !== item.id);
      }
      return [...prevFavorites, item];
    });
  };

  const isFavorite = (id: number) => {
    return favorites.some((fav) => fav.id === id);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
  };

  const updatePassword = (oldPassword: string, newPassword: string) => {
    // In a real app, this would make an API call
    // For demo purposes, we'll just return true
    if (oldPassword && newPassword) {
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        favorites,
        user,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleFavorite,
        isFavorite,
        updateUser,
        updatePassword,
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
