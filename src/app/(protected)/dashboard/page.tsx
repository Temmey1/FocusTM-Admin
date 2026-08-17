"use client";
import { useEffect, useState } from "react";
import { api, formatNaira } from "@/lib/api";
import { AdminStats } from "@/types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const placeholderRevenue = [
  { month: "Jan", revenue: 0 }, { month: "Feb", revenue: 0 }, { month: "Mar", revenue: 0 },
  { month: "Apr", revenue: 0 }, { month: "May", revenue: 0 }, { month: "Jun", revenue: 0 },
  { month: "Jul", revenue: 0 },
];

export default function DashboardPage() {
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [pendingCustom, setPendingCustom] = useState<number | null>(null);
  const [locationsCount, setLocationsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AdminStats>("/admin/stats").catch(() => null),
      api.get("/custom-orders").catch(() => null),
      api.get("/locations/all").catch(() => null),
    ]).then(([s, c, l]) => {
      setStats(s?.data || { totalOrders: 0, pendingOrders: 0, totalProducts: 0, revenueThisMonth: 0, revenueAllTime: 0 });
      setPendingCustom(c ? (c.data as any[]).filter((r) => r.status === "new").length : 0);
      setLocationsCount(l ? (l.data as any[]).length : 0);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: "Total Orders",       value: loading ? null : String(stats?.totalOrders ?? 0)          },
    { label: "Pending Orders",     value: loading ? null : String(stats?.pendingOrders ?? 0)         },
    { label: "Products Listed",    value: loading ? null : String(stats?.totalProducts ?? 0)         },
    { label: "New Custom Requests",value: loading ? null : String(pendingCustom ?? 0)                },
    { label: "Revenue This Month", value: loading ? null : formatNaira(stats?.revenueThisMonth ?? 0) },
    { label: "All-Time Revenue",   value: loading ? null : formatNaira(stats?.revenueAllTime ?? 0)   },
  ];

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.35em] text-ftm-muted mb-2">Overview</p>
      <h1 className="font-display font-light text-[clamp(26px,3.5vw,44px)] mb-10">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-ftm-line mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="bg-ftm-deep p-6">
            <p className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted mb-3">{s.label}</p>
            {s.value === null ? <div className="h-8 w-20 ftm-skeleton" /> : (
              <p className="font-display font-light text-[30px] text-ftm-white leading-none">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border border-ftm-line p-7 mb-8">
        <p className="text-[9px] uppercase tracking-[0.25em] text-ftm-muted mb-6">Revenue — Last 7 Months</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={placeholderRevenue}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} className="text-ftm-white"/>
                <stop offset="95%" stopColor="currentColor" stopOpacity={0} className="text-ftm-white"/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: "rgb(var(--ftm-white) / 0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgb(var(--ftm-white) / 0.4)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "rgb(var(--ftm-charcoal))", border: "1px solid rgb(var(--ftm-line))", fontSize: 11 }} formatter={(v: number) => [formatNaira(v), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="rgb(var(--ftm-white))" strokeWidth={1.5} fill="url(#rev)" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-ftm-dim mt-4">
          Chart populates from <code className="bg-ftm-charcoal px-1.5 py-0.5 text-ftm-offwhite">GET /admin/stats</code> once real order data exists.
          {locationsCount === 0 && <> You also have no delivery locations configured yet — <a href="/locations" className="text-ftm-offwhite underline-slide">add some here</a>.</>}
        </p>
      </div>
    </div>
  );
}
