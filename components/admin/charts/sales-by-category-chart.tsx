"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Electronics", value: 35, color: "oklch(0.696 0.17 162.48)" },
  { name: "Clothing", value: 25, color: "oklch(0.488 0.243 264.376)" },
  { name: "Home & Garden", value: 20, color: "oklch(0.769 0.188 70.08)" },
  { name: "Sports", value: 12, color: "oklch(0.627 0.265 303.9)" },
  { name: "Books", value: 8, color: "oklch(0.645 0.246 16.439)" },
];

export function SalesByCategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.16 0 0)",
            border: "1px solid oklch(0.26 0 0)",
            borderRadius: "8px",
            color: "oklch(0.985 0 0)",
          }}
          formatter={(value: number) => [`${value}%`, "Share"]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: "oklch(0.65 0 0)", fontSize: "12px" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
