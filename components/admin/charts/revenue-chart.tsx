"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22300 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 25600 },
  { month: "May", revenue: 28900 },
  { month: "Jun", revenue: 31200 },
  { month: "Jul", revenue: 29800 },
  { month: "Aug", revenue: 35400 },
  { month: "Sep", revenue: 38900 },
  { month: "Oct", revenue: 42100 },
  { month: "Nov", revenue: 45800 },
  { month: "Dec", revenue: 52300 },
];

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0 0)" vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`} dx={-10} />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.16 0 0)",
            border: "1px solid oklch(0.26 0 0)",
            borderRadius: "8px",
            color: "oklch(0.985 0 0)",
          }}
          formatter={(value: number) => [`฿${value.toLocaleString()}`, "Revenue"]}
          labelStyle={{ color: "oklch(0.65 0 0)" }}
        />
        <Area type="monotone" dataKey="revenue" stroke="oklch(0.696 0.17 162.48)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
