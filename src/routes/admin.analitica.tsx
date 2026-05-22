import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, TrendingUp, Eye, Users, Clock, Globe, Smartphone, Monitor, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/admin/analitica")({
  head: () => ({ meta: [{ title: "Analítica — Grupo Vega" }, { name: "robots", content: "noindex" }] }),
  component: AnaliticaPage,
});

type Range = "7d" | "30d" | "90d";

type Row = {
  path: string;
  session_id: string;
  device: string | null;
  browser: string | null;
  country: string | null;
  referrer: string | null;
  created_at: string;
};

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };
const RANGE_LABEL: Record<Range, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

function AnaliticaPage() {
  const [range, setRange] = useState<Range>("7d");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const since = new Date();
    since.setDate(since.getDate() - RANGE_DAYS[range]);
    supabase
      .from("page_views")
      .select("path,session_id,device,browser,country,referrer,created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(10000)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const days = RANGE_DAYS[range];
    const pageviews = rows.length;
    const sessions = new Set(rows.map((r) => r.session_id)).size;
    const uniquePaths = new Set(rows.map((r) => r.path)).size;
    const pvPerSession = sessions > 0 ? pageviews / sessions : 0;

    // Bounce rate = % sesiones con 1 pageview
    const bySession = new Map<string, number>();
    rows.forEach((r) => bySession.set(r.session_id, (bySession.get(r.session_id) || 0) + 1));
    let bounced = 0;
    bySession.forEach((c) => { if (c === 1) bounced++; });
    const bounceRate = sessions > 0 ? (bounced / sessions) * 100 : 0;

    // Serie temporal por día
    const today = startOfDay(new Date());
    const seriesMap = new Map<string, { date: Date; visitas: number; sesiones: Set<string> }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      seriesMap.set(d.toISOString().slice(0, 10), { date: d, visitas: 0, sesiones: new Set() });
    }
    rows.forEach((r) => {
      const key = r.created_at.slice(0, 10);
      const entry = seriesMap.get(key);
      if (entry) {
        entry.visitas++;
        entry.sesiones.add(r.session_id);
      }
    });
    const series = Array.from(seriesMap.values()).map((e) => ({
      label: formatDayLabel(e.date),
      visitas: e.visitas,
      sesiones: e.sesiones.size,
    }));

    // Helpers para top-N
    const topN = (key: keyof Row, n = 8, fallback = "Desconocido") => {
      const counts = new Map<string, number>();
      rows.forEach((r) => {
        const v = (r[key] as string | null) || fallback;
        counts.set(v, (counts.get(v) || 0) + 1);
      });
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([label, value]) => ({ label, value }));
    };

    const topPaths = topN("path");
    const topCountries = topN("country", 8, "Desconocido");
    const devices = topN("device", 5, "desconocido");
    const browsers = topN("browser", 5, "Otro");
    const referrers = (() => {
      const counts = new Map<string, number>();
      rows.forEach((r) => {
        const ref = r.referrer;
        let label = "Directo";
        if (ref) {
          try { label = new URL(ref).hostname; } catch { label = "Directo"; }
        }
        counts.set(label, (counts.get(label) || 0) + 1);
      });
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, value]) => ({ label, value }));
    })();

    return {
      pageviews, sessions, uniquePaths, pvPerSession, bounceRate,
      series, topPaths, topCountries, devices, browsers, referrers,
    };
  }, [rows, range]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-deep">Analítica</h1>
          <p className="text-sm text-muted-foreground mt-1">Métricas de visitas de tu sitio público.</p>
        </div>
        <div className="inline-flex rounded-full bg-card border border-border p-1 self-start">
          {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${
                range === r ? "gradient-wave text-white" : "text-navy-deep hover:bg-foam"
              }`}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-ocean" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
          Error al cargar analítica: {error}
        </div>
      )}

      {stats && !loading && (
        <div className="space-y-6">
          {/* Tarjetas KPI */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <KpiCard icon={Eye} label="Páginas vistas" value={stats.pageviews.toLocaleString("es-EC")} />
            <KpiCard icon={Users} label="Visitantes únicos" value={stats.sessions.toLocaleString("es-EC")} />
            <KpiCard icon={TrendingUp} label="Páginas / visita" value={stats.pvPerSession.toFixed(2)} />
            <KpiCard icon={Clock} label="Tasa de rebote" value={`${stats.bounceRate.toFixed(0)}%`} />
            <KpiCard icon={FileText} label="Páginas únicas" value={stats.uniquePaths.toLocaleString("es-EC")} />
          </div>

          {/* Gráfico */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <h2 className="font-bold text-navy-deep mb-4">Tendencia de visitas</h2>
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--ocean, 200 80% 45%))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--ocean, 200 80% 45%))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                    labelStyle={{ fontWeight: 600 }}
                    formatter={(v: number, name: string) => [v, name === "visitas" ? "Páginas vistas" : "Visitantes"]}
                  />
                  <Area type="monotone" dataKey="visitas" stroke="hsl(var(--ocean, 200 80% 45%))" fill="url(#gradVisitas)" strokeWidth={2} name="visitas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Listas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListCard icon={FileText} title="Páginas más visitadas" items={stats.topPaths} />
            <ListCard icon={Globe} title="Países" items={stats.topCountries} />
            <ListCard icon={Smartphone} title="Dispositivos" items={stats.devices} />
            <ListCard icon={Monitor} title="Navegadores" items={stats.browsers} />
            <ListCard icon={TrendingUp} title="Fuentes de tráfico" items={stats.referrers} className="md:col-span-2" />
          </div>

          {stats.pageviews === 0 && (
            <div className="bg-foam/40 border border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
              Aún no hay visitas registradas en este período. Las visitas al panel administrativo no se contabilizan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-navy-deep">{value}</div>
    </div>
  );
}

function ListCard({
  icon: Icon, title, items, className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: { label: string; value: number }[];
  className?: string;
}) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;
  return (
    <div className={`bg-card border border-border rounded-xl p-4 md:p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-ocean" />
        <h3 className="font-bold text-navy-deep">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.label} className="relative">
              <div className="flex items-center justify-between gap-2 text-sm relative z-10 px-2 py-1.5">
                <span className="truncate text-navy-deep font-medium">{it.label}</span>
                <span className="text-muted-foreground tabular-nums font-semibold">{it.value.toLocaleString("es-EC")}</span>
              </div>
              <div
                className="absolute inset-y-0 left-0 bg-foam rounded-md"
                style={{ width: `${(it.value / max) * 100}%` }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}