import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  img: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "gv_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || user) return; // si hay usuario, persistimos en Supabase, no en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded, user]);

  // Cargar carrito desde Supabase + migrar localStorage cuando el usuario inicia sesión
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      syncingRef.current = true;
      try {
        // 1. Leer items locales pendientes
        let local: CartItem[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) local = JSON.parse(raw);
        } catch {}

        // 2. Migrar al servidor (upsert sumando cantidades)
        for (const it of local) {
          const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("user_id", user.id)
            .eq("product_id", it.id)
            .maybeSingle();
          if (existing) {
            await supabase.from("cart_items").update({ quantity: existing.quantity + it.quantity }).eq("id", existing.id);
          } else {
            await supabase.from("cart_items").insert({ user_id: user.id, product_id: it.id, quantity: it.quantity });
          }
        }
        if (local.length) localStorage.removeItem(STORAGE_KEY);

        // 3. Cargar carrito completo desde Supabase
        const { data } = await supabase
          .from("cart_items")
          .select("quantity, product:products(id, name, price, category, image_url)")
          .eq("user_id", user.id);
        if (cancelled) return;
        const next: CartItem[] = (data ?? []).flatMap((row: any) => {
          if (!row.product) return [];
          return [{
            id: row.product.id,
            name: row.product.name,
            price: Number(row.product.price) || 0,
            category: row.product.category ?? "",
            img: row.product.image_url ?? "",
            quantity: row.quantity,
          }];
        });
        setItems(next);
      } finally {
        syncingRef.current = false;
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Helpers para escribir en Supabase cuando hay usuario
  const writeServer = async (productId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
    } else {
      await supabase.from("cart_items").upsert(
        { user_id: user.id, product_id: productId, quantity },
        { onConflict: "user_id,product_id" },
      );
    }
  };

  const addItem: CartContextType["addItem"] = (item, qty = 1) => {
    let newQty = qty;
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        newQty = existing.quantity + qty;
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    void writeServer(item.id, newQty);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    void writeServer(id, 0);
  };

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: Math.max(0, qty) } : p))
        .filter((p) => p.quantity > 0)
    );
    void writeServer(id, Math.max(0, qty));
  };

  const clear = () => {
    setItems([]);
    if (user) void supabase.from("cart_items").delete().eq("user_id", user.id);
  };
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clear, count, subtotal, drawerOpen, setDrawerOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
