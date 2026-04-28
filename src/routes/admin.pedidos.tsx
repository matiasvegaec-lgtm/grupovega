import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShoppingBag, ChevronDown, ChevronUp, MessageCircle, Search, Calendar, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type OrderItem = { id: string; name: string; price: number; quantity: number; img?: string };
type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_country: string;
  shipping_notes: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  created_at: string;
};

const STATUSES = ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export const Route = createFileRoute("/admin/pedidos")({
  component: AdminPedidos,
});

function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState(""); // formato YYYY-MM-DD

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setOrders((data ?? []) as unknown as Order[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Estado actualizado");
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const sendWhatsApp = (o: Order) => {
    const itemsList = o.items.map((i) => `• ${i.name} x${i.quantity}`).join("\n");
    const text = encodeURIComponent(
      `Hola ${o.customer_name}, tu pedido *${o.order_number}* está siendo procesado.\n\n${itemsList}\n\nTotal: $${o.total.toFixed(2)}`
    );
    const phone = o.customer_phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const filtered = useMemo(() => {
    const nameQuery = searchName.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (nameQuery) {
        const haystack = `${o.customer_name} ${o.order_number} ${o.customer_email}`.toLowerCase();
        if (!haystack.includes(nameQuery)) return false;
      }
      if (searchDate) {
        // Comparamos por fecha local YYYY-MM-DD
        const d = new Date(o.created_at);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const local = `${yyyy}-${mm}-${dd}`;
        if (local !== searchDate) return false;
      }
      return true;
    });
  }, [orders, filter, searchName, searchDate]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-start md:items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-navy-deep flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-ocean" /> Pedidos
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">{orders.length} pedido{orders.length !== 1 && "s"} en total</p>
        </div>
        <div className="flex gap-2 flex-wrap w-full md:w-auto overflow-x-auto -mx-1 px-1">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filter === "all" ? "gradient-wave text-white" : "bg-foam text-navy-deep"}`}>
            Todos ({orders.length})
          </button>
          {STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            if (count === 0) return null;
            return (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filter === s ? "gradient-wave text-white" : "bg-foam text-navy-deep"}`}>
                {STATUS_LABEL[s]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Buscadores */}
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Buscar por nombre, email o N° de pedido…"
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-card border border-border text-sm focus:border-ocean focus:outline-none"
          />
          {searchName && (
            <button type="button" onClick={() => setSearchName("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-navy-deep" aria-label="Limpiar búsqueda">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm focus:border-ocean focus:outline-none"
          />
        </div>
        {(searchName || searchDate) && (
          <button
            type="button"
            onClick={() => { setSearchName(""); setSearchDate(""); }}
            className="px-3 py-2 rounded-lg bg-foam text-navy-deep text-sm font-semibold hover:bg-foam/70"
          >
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ocean" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center text-muted-foreground">
          No hay pedidos {filter !== "all" && `con estado "${STATUS_LABEL[filter]}"`}.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const open = expanded === o.id;
            return (
              <div key={o.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
                <button onClick={() => setExpanded(open ? null : o.id)} className="w-full p-4 flex items-center gap-4 hover:bg-foam/50 transition text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-navy-deep">{o.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-800"}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {o.customer_name} · {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy-deep">${o.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{o.items.length} ítem{o.items.length !== 1 && "s"}</p>
                  </div>
                  {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>

                {open && (
                  <div className="border-t border-border p-4 bg-foam/30 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-bold text-navy-deep mb-1">Cliente</h4>
                        <p>{o.customer_name}</p>
                        <p className="text-muted-foreground">{o.customer_email}</p>
                        <p className="text-muted-foreground">{o.customer_phone}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-deep mb-1">Envío</h4>
                        <p>{o.shipping_address}</p>
                        <p className="text-muted-foreground">{o.shipping_city}, {o.shipping_province}, {o.shipping_country}</p>
                        {o.shipping_notes && <p className="text-muted-foreground italic mt-1">"{o.shipping_notes}"</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-navy-deep mb-2 text-sm">Productos</h4>
                      <div className="space-y-2">
                        {o.items.map((i, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-card rounded-lg p-2">
                            {i.img && <img src={i.img} alt={i.name} className="w-10 h-10 rounded object-cover" />}
                            <div className="flex-1 text-sm">
                              <p className="font-semibold text-navy-deep">{i.name}</p>
                              <p className="text-xs text-muted-foreground">${i.price.toFixed(2)} × {i.quantity}</p>
                            </div>
                            <span className="font-semibold text-sm">${(i.price * i.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                      <label className="text-sm font-semibold text-navy-deep">Estado:</label>
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm focus:border-ocean focus:outline-none">
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                      <button onClick={() => sendWhatsApp(o)} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:opacity-90">
                        <MessageCircle className="w-4 h-4" /> WhatsApp cliente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
