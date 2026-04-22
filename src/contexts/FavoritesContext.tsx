import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type FavoriteItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  img: string;
  slug?: string | null;
};

type FavoritesContextType = {
  items: FavoriteItem[];
  toggle: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  isFavorite: (id: string) => boolean;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);
const STORAGE_KEY = "gv_favorites_v1";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const toggle = (item: FavoriteItem) => {
    setItems((prev) =>
      prev.some((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item],
    );
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const isFavorite = (id: string) => items.some((p) => p.id === id);

  return (
    <FavoritesContext.Provider value={{ items, toggle, remove, isFavorite, count: items.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}