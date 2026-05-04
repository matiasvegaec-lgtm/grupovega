import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

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
  const { user } = useAuth();
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
    if (user) return; // con usuario, persistimos en Supabase
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, user]);

  // Sincronización con Supabase + migración de favoritos locales al iniciar sesión
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      let local: FavoriteItem[] = [];
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) local = JSON.parse(raw);
      } catch {}
      for (const it of local) {
        await supabase
          .from("favorites")
          .upsert({ user_id: user.id, product_id: it.id }, { onConflict: "user_id,product_id" });
      }
      if (local.length) window.localStorage.removeItem(STORAGE_KEY);

      const { data } = await supabase
        .from("favorites")
        .select("product:products(id, name, price, category, image_url, slug)")
        .eq("user_id", user.id);
      if (cancelled) return;
      const next: FavoriteItem[] = (data ?? []).flatMap((row: any) => {
        if (!row.product) return [];
        return [{
          id: row.product.id,
          name: row.product.name,
          price: Number(row.product.price) || 0,
          category: row.product.category ?? "",
          img: row.product.image_url ?? "",
          slug: row.product.slug ?? null,
        }];
      });
      setItems(next);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toggle = (item: FavoriteItem) => {
    const isFav = items.some((p) => p.id === item.id);
    setItems((prev) =>
      prev.some((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item],
    );
    if (user) {
      if (isFav) {
        void supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", item.id);
      } else {
        void supabase.from("favorites").upsert({ user_id: user.id, product_id: item.id }, { onConflict: "user_id,product_id" });
      }
    }
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (user) void supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", id);
  };
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