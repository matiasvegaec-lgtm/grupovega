import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, MailX, Search, Users as UsersIcon, ShoppingBag, Copy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Customer = {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_subscribed: boolean;
  orders_count: number;
  total_spent: number;
};

type Filter = "all" | "subscribed" | "not_subscribed" | "buyers";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({ meta: [{ title: "Admin · Clientes — Grupo Vega" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminClientes,
});

function AdminClientes() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_customers");
    if (error) toast.error(error.message);
    else setRows((data ?? []) as Customer[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "subscribed" && !r.is_subscribed) return false;
      if (filter === "not_subscribed" && r.is_subscribed) return false;
      if (filter === "buyers" && Number(r.orders_count) === 0) return false;
      if (!term) return true;
      return (
        r.email.toLowerCase().includes(term) ||
        (r.full_name ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, q, filter]);

  const stats = useMemo(() => {
    const total = rows.length;
    const subs = rows.filter((r) => r.is_subscribed).length;
    const buyers = rows.filter((r) => Number(r.orders_count) > 0).length;
    return { total, subs, buyers };
  }, [rows]);

  const subscribedEmails = useMemo(
    () => filtered.filter((r) => r.is_subscribed).map((r) => r.email),
    [filtered]
  );

  const toggleSubscription = async (c: Customer) => {
    setBusy(c.user_id);
    try {
      const fn = c.is_subscribed ? "admin_unsubscribe_customer" : "admin_subscribe_customer";
      const { error } = await supabase.rpc(fn, { _email: c.email });
      if (error) throw error;
      setRows((prev) => prev.map((r) => r.user_id === c.user_id ? { ...r, is_subscribed: !c.is_subscribed } : r));
      toast.success(c.is_subscribed ? "Cliente removido de promociones" : "Cliente añadido a promociones");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const copyEmails = async () => {
    if (subscribedEmails.length === 0) {
      toast.info("No hay correos suscritos en la lista filtrada");
      return;
    }
    try {
      await navigator.clipboard.writeText(subscribedEmails.join(", "));
      setCopied(true);
      toast.success(`${subscribedEmails.length} correos copiados al portapapeles`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const openMailto = () => {
    if (subscribedEmails.length === 0) {
      toast.info("No hay correos suscritos en la lista filtrada");
      return;
    }
    const bcc = subscribedEmails.join(",");
    window.location.href = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent("Promociones Grupo Vega")}`;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-navy-deep">Clientes</h1>
        <p className="text-xs md:text-sm text-muted-foreground">Cuentas registradas y suscriptores a promociones por correo.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard icon={UsersIcon} label="Clientes registrados" value={stats.total} color="text-ocean" />
        <StatCard icon={Mail} label="Suscritos a promos" value={stats.subs} color="text-emerald-600" />
        <StatCard icon={ShoppingBag} label="Han comprado" value={stats.buyers} color="text-amber-600" />
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border focus:border-ocean focus:outline-none text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="px-3 py-2 rounded-lg bg-background border border-border text-sm"
        >
          <option value="all">Todos</option>
          <option value="subscribed">Suscritos a promos</option>
          <option value="not_subscribed">No suscritos</option>
          <option value="buyers">Han comprado</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={copyEmails}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-semibold text-navy-deep hover:bg-foam inline-flex items-center gap-2"
            title="Copiar correos suscritos de la lista filtrada"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            Copiar correos
          </button>
          <button
            onClick={openMailto}
            className="px-3 py-2 rounded-lg gradient-wave text-white text-sm font-semibold inline-flex items-center gap-2"
            title="Abrir tu app de correo con los suscritos en BCC"
          >
            <Mail className="w-4 h-4" /> Enviar promo
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ocean" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No hay clientes que coincidan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-foam">
                <tr>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Registrado</th>
                  <th className="text-center p-3">Pedidos</th>
                  <th className="text-right p-3">Total gastado</th>
                  <th className="text-center p-3">Promos</th>
                  <th className="text-right p-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.user_id} className="border-t border-border hover:bg-foam/40">
                    <td className="p-3">
                      <div className="font-semibold text-navy-deep">{c.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center font-semibold">{Number(c.orders_count)}</td>
                    <td className="p-3 text-right font-semibold text-navy-deep">
                      ${Number(c.total_spent).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      {c.is_subscribed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          <Mail className="w-3 h-3" /> Suscrito
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                          <MailX className="w-3 h-3" /> No
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        disabled={busy === c.user_id}
                        onClick={() => toggleSubscription(c)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 ${
                          c.is_subscribed
                            ? "text-destructive hover:bg-destructive/10"
                            : "text-ocean hover:bg-ocean/10"
                        }`}
                      >
                        {busy === c.user_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : c.is_subscribed ? (
                          <><MailX className="w-3.5 h-3.5" /> Quitar</>
                        ) : (
                          <><Mail className="w-3.5 h-3.5" /> Suscribir</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-foam flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold text-navy-deep">{value}</div>
      </div>
    </div>
  );
}
