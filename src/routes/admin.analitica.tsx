import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
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

// Paleta sobria alineada con la marca (marina / navy / turquesa)
type CardTone = "ocean" | "navy" | "turquoise" | "sky" | "slate";
const TONES: Record<CardTone, { accent: string; soft: string }> = {
  ocean:     { accent: "#1d6fa5", soft: "#eef4fa" },
  navy:      { accent: "#1e3a5f", soft: "#eef1f6" },
  turquoise: { accent: "#0ea5b7", soft: "#e8f5f6" },
  sky:       { accent: "#3b82c4", soft: "#eef4fa" },
  slate:     { accent: "#475569", soft: "#f1f3f6" },
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

function formatDuration(seconds: number) {
  if (!seconds || !isFinite(seconds)) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

const COUNTRY_NAMES: Record<string, string> = {
  EC: "Ecuador", US: "EE. UU. Estados Unidos", CO: "Colombia", IT: "Italia",
  MX: "México", ES: "España", AR: "Argentina", PE: "Perú", CL: "Chile",
  VE: "Venezuela", BR: "Brasil", CA: "Canadá", FR: "Francia", DE: "Alemania",
  GB: "Reino Unido",
};
function countryFlag(code: string) {
  if (!code || code.length !== 2) return "🌐";
  const A = 0x1f1e6;
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => A + c.charCodeAt(0) - 65));
}
function countryName(code: string) {
  return COUNTRY_NAMES[code?.toUpperCase()] ?? code ?? "Desconocido";
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

    // Duración promedio de sesión (segundos)
    const sessionTimes = new Map<string, { min: number; max: number }>();
    rows.forEach((r) => {
      const t = new Date(r.created_at).getTime();
      const cur = sessionTimes.get(r.session_id);
      if (!cur) sessionTimes.set(r.session_id, { min: t, max: t });
      else { cur.min = Math.min(cur.min, t); cur.max = Math.max(cur.max, t); }
    });
    let totalSec = 0, counted = 0;
    sessionTimes.forEach((v) => { totalSec += (v.max - v.min) / 1000; counted++; });
    const avgSessionSec = counted > 0 ? totalSec / counted : 0;

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
      pageviews, sessions, uniquePaths, pvPerSession, bounceRate, avgSessionSec,
      series, topPaths, topCountries, devices, browsers, referrers,
    };
  }, [rows, range]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-end gap-4 mb-5">
        <div className="flex items-center gap-2 text-sm text-navy-deep/80">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-medium">0 visitantes actuales</span>
        </div>
        <div className="relative">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-1.5 text-sm font-semibold text-navy-deep hover:bg-foam transition cursor-pointer"
          >
            {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
              <option key={r} value={r}>{RANGE_LABEL[r]}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-navy-deep/60" />
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
        <div className="space-y-5">
          {/* Tarjetas KPI estilo Lovable */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <KpiCard tone="ocean"     label="Visitantes"            value={stats.sessions.toLocaleString("es-EC")} />
            <KpiCard tone="navy"      label="Vistas de página"      value={stats.pageviews.toLocaleString("es-EC")} />
            <KpiCard tone="turquoise" label="Vistas por visita"     value={stats.pvPerSession.toFixed(2)} />
            <KpiCard tone="sky"       label="Duración de la visita" value={formatDuration(stats.avgSessionSec)} />
            <KpiCard tone="slate"     label="Tasa de rebote"        value={`${stats.bounceRate.toFixed(0)}%`} />
          </div>

          {/* Gráfico principal */}
          <div className="rounded-2xl p-4 md:p-6 bg-[#eef6fb] border border-[#dbe9f2]">
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "none", fontSize: 12, boxShadow: "0 6px 24px rgba(0,0,0,.12)" }}
                    labelStyle={{ fontWeight: 600, color: "#0f172a" }}
                    formatter={(v: number) => [v, "Visitantes"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitas"
                    stroke="#0ea5b7"
                    strokeWidth={2.5}
                    fill="url(#gradMain)"
                    dot={{ r: 3, fill: "#0ea5b7", stroke: "#fff", strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Listas estilo Lovable */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <ListCard tone="ocean"     title="Fuente"      keyLabel="Fuente"      items={stats.referrers} />
            <ListCard tone="navy"      title="Página"      keyLabel="Página"      items={stats.topPaths} />
            <ListCard tone="turquoise" title="País"        keyLabel="País"        items={stats.topCountries} mode="country" />
            <ListCard tone="sky"       title="Dispositivo" keyLabel="Dispositivo" items={stats.devices} mode="percent" />
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

function KpiCard({ tone, label, value }: { tone: CardTone; label: string; value: string }) {
  const t = TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border/70 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: t.accent }} />
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl md:text-[26px] font-bold tracking-tight text-navy-deep leading-tight">{value}</div>
    </div>
  );
}

function ListCard({
  tone, title, keyLabel, items, mode,
}: {
  tone: CardTone;
  title: string;
  keyLabel: string;
  items: { label: string; value: number }[];
  mode?: "country" | "percent";
}) {
  const t = TONES[tone];
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border/70 p-4 md:p-5 shadow-sm min-h-[260px]">
      <div className="text-base font-semibold text-navy-deep mb-3">{title}</div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-2 pb-2 border-b border-border">
        <span>{keyLabel}</span>
        <span>Visitantes</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos.</p>
      ) : (
        <ul className="space-y-2.5">
            {items.slice(0, 5).map((it) => {
              const display =
                mode === "country"
                  ? `${countryFlag(it.label)} ${countryName(it.label)}`
                  : mode === "percent"
                  ? it.label.charAt(0).toUpperCase() + it.label.slice(1).replace("desktop", "")
                  : it.label;
              const right =
                mode === "percent"
                  ? `${((it.value / total) * 100).toFixed(1)}%`
                  : it.value.toLocaleString("es-EC");
              const pct = (it.value / max) * 100;
              return (
                <li key={it.label}>
                  <div className="flex items-center justify-between text-sm text-navy-deep">
                    <span className="truncate font-medium">
                      {mode === "percent"
                        ? (it.label === "desktop" ? "Escritorio" : it.label === "mobile" ? "Móvil" : it.label === "tablet" ? "Tablet" : display)
                        : display}
                    </span>
                    <span className="tabular-nums font-semibold text-muted-foreground">{right}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.accent }} />
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}