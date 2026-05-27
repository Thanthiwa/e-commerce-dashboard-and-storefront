"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const defaultData = [
  { label: "ม.ค.", revenue: 18500 },
  { label: "ก.พ.", revenue: 22300 },
  { label: "มี.ค.", revenue: 19800 },
  { label: "เม.ย.", revenue: 25600 },
  { label: "พ.ค.", revenue: 28900 },
  { label: "มิ.ย.", revenue: 31200 },
  { label: "ก.ค.", revenue: 29800 },
  { label: "ส.ค.", revenue: 35400 },
  { label: "ก.ย.", revenue: 38900 },
  { label: "ต.ค.", revenue: 42100 },
  { label: "พ.ย.", revenue: 45800 },
  { label: "ธ.ค.", revenue: 52300 },
];

export type RevenueChartPoint = {
  label: string;
  revenue: number;
};

export function RevenueChart({ data = defaultData }: { data?: RevenueChartPoint[] }) {
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
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} dy={10} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
          tickFormatter={(value) => `฿${(Number(value) / 1000).toFixed(0)}พัน`}
          dx={-10}
        />
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
