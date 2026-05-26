"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line, LineChart, ComposedChart } from "recharts";

// Demo data
const monthlyData = [
  { month: "Jan", revenue: 45000, orders: 520, profit: 12500, lastYear: 38000 },
  { month: "Feb", revenue: 52000, orders: 580, profit: 15200, lastYear: 42000 },
  { month: "Mar", revenue: 48000, orders: 540, profit: 13800, lastYear: 45000 },
  { month: "Apr", revenue: 61000, orders: 680, profit: 18500, lastYear: 48000 },
  { month: "May", revenue: 55000, orders: 620, profit: 16200, lastYear: 51000 },
  { month: "Jun", revenue: 67000, orders: 740, profit: 21000, lastYear: 55000 },
  { month: "Jul", revenue: 72000, orders: 810, profit: 23500, lastYear: 58000 },
  { month: "Aug", revenue: 69000, orders: 780, profit: 22000, lastYear: 62000 },
  { month: "Sep", revenue: 78000, orders: 850, profit: 26000, lastYear: 65000 },
  { month: "Oct", revenue: 85000, orders: 920, profit: 29500, lastYear: 70000 },
  { month: "Nov", revenue: 95000, orders: 1050, profit: 34000, lastYear: 78000 },
  { month: "Dec", revenue: 110000, orders: 1200, profit: 42000, lastYear: 85000 },
];

const categoryData = [
  { name: "Electronics", revenue: 285000, growth: 15.2 },
  { name: "Clothing", revenue: 195000, growth: 8.5 },
  { name: "Home & Garden", revenue: 145000, growth: 12.3 },
  { name: "Sports", revenue: 98000, growth: -2.4 },
  { name: "Books", revenue: 67000, growth: 5.8 },
];

const weekdayData = [
  { day: "Mon", sales: 12500 },
  { day: "Tue", sales: 14200 },
  { day: "Wed", sales: 13800 },
  { day: "Thu", sales: 15600 },
  { day: "Fri", sales: 18900 },
  { day: "Sat", sales: 22400 },
  { day: "Sun", sales: 19800 },
];

export default function SalesAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12m");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">Revenue trends, growth metrics, and performance analysis</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$837,000</div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+18.2%</span>
              <span className="text-muted-foreground">vs last year</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,290</div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+15.8%</span>
              <span className="text-muted-foreground">vs last year</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$90.10</div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+2.1%</span>
              <span className="text-muted-foreground">vs last year</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.4%</div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+1.8%</span>
              <span className="text-muted-foreground">vs last year</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Last Year</CardTitle>
          <CardDescription>Monthly revenue comparison with year-over-year growth</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0 0)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0 0)",
                  border: "1px solid oklch(0.26 0 0)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Legend />
              <Bar dataKey="revenue" name="This Year" fill="oklch(0.696 0.17 162.48)" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="lastYear" name="Last Year" stroke="oklch(0.65 0 0)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Performance breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0 0)" horizontal={true} vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0 0)",
                    border: "1px solid oklch(0.26 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.985 0 0)",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="oklch(0.488 0.243 264.376)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Day of Week</CardTitle>
            <CardDescription>Average daily sales patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weekdayData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.769 0.188 70.08)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.769 0.188 70.08)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0 0)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0 0)",
                    border: "1px solid oklch(0.26 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.985 0 0)",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Sales"]}
                />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.769 0.188 70.08)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
