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
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminStats>("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => setStats({ totalOrders: 0, pendingOrders: 0, totalProducts: 0, revenueThisMonth: 0, revenueAllTime: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Orders",          value: loading ? "—" : String(stats?.totalOrders ?? 0)            },
    { label: "Pending Orders",        value: loading ? "—" : String(stats?.pendingOrders ?? 0)          },
    { label: "Products Listed",       value: loading ? "—" : String(stats?.totalProducts ?? 0)          },
    { label: "Revenue This Month",    value: loading ? "—" : formatNaira(stats?.revenueThisMonth ?? 0)  },
    { label: "All-Time Revenue",      value: loading ? "—" : formatNaira(stats?.revenueAllTime ?? 0)    },
  ];

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.35em] text-ftm-muted mb-2">Overview</p>
      <h1 className="font-display font-light text-[clamp(26px,3.5vw,44px)] mb-10">Dashboard</h1>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ftm-line mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="bg-ftm-deep p-6">
            <p className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted mb-3">{s.label}</p>
            <p className="font-display font-light text-[30px] text-ftm-white leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* revenue chart placeholder */}
      <div className="border border-ftm-line p-7 mb-8">
        <p className="text-[9px] uppercase tracking-[0.25em] text-ftm-muted mb-6">Revenue — Last 7 Months</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={placeholderRevenue}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f2f0ed" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#f2f0ed" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: "rgba(220,217,212,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(220,217,212,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "#161616", border: "1px solid #2e2e2e", fontSize: 11 }} formatter={(v: number) => [formatNaira(v), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#f2f0ed" strokeWidth={1.5} fill="url(#rev)" />
          </AreaChart>
        </ResponsiveContainer>
        
      </div>
    </div>
  );
}
