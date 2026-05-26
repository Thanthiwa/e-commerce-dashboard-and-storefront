"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const defaultData = [
  { month: "ม.ค.", revenue: 18500 },
  { month: "ก.พ.", revenue: 22300 },
  { month: "มี.ค.", revenue: 19800 },
  { month: "เม.ย.", revenue: 25600 },
  { month: "พ.ค.", revenue: 28900 },
  { month: "มิ.ย.", revenue: 31200 },
  { month: "ก.ค.", revenue: 29800 },
  { month: "ส.ค.", revenue: 35400 },
  { month: "ก.ย.", revenue: 38900 },
  { month: "ต.ค.", revenue: 42100 },
  { month: "พ.ย.", revenue: 45800 },
  { month: "ธ.ค.", revenue: 52300 },
];

export function RevenueChart({ data = defaultData }: { data?: Array<{ month: string; revenue: number }> }) {
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
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}พัน`} dx={-10} />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.16 0 0)",
            border: "1px solid oklch(0.26 0 0)",
            borderRadius: "8px",
            color: "oklch(0.985 0 0)",
          }}
          formatter={(value: number) => [`฿${value.toLocaleString("th-TH")}`, "รายได้"]}
          labelStyle={{ color: "oklch(0.65 0 0)" }}
        />
        <Area type="monotone" dataKey="revenue" stroke="oklch(0.696 0.17 162.48)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
