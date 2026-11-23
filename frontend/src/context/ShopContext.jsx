
import {
  createContext, useContext, useEffect, useState
} from "react";
import { api } from "../api";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) setAuthLoading(false);
        return;
      }

      try {
        const result = await api("/auth/me");
        if (active) setUser(result.user);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const login = data => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setCart([]);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
    setCart([]);
  };

  const addToCart = product => {
    if (!user || user.role !== "customer" || product.stock < 1) {
      return false;
    }

    setCart(prev => {
      const existing = prev.find(x => x.id === product.id);

      if (existing) {
        return prev.map(x =>
          x.id === product.id
            ? {
                ...x,
                quantity: Math.min(x.quantity + 1, product.stock)
              }
            : x
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    return true;
  };

  const updateQuantity = (id, quantity) => {
    setCart(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            quantity: Math.max(
              1, Math.min(quantity, item.stock)
            )
          }
        : item
    ));
  };

  const removeFromCart = id => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity, 0
  );

  return (
    <ShopContext.Provider value={{
      user, authLoading, login, logout,
      cart, cartCount, cartTotal,
      addToCart, updateQuantity, removeFromCart, clearCart
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("ShopProvider missing.");
  return context;
}
