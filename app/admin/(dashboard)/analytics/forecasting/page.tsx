"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart } from "recharts";

// Demo inventory forecast data
const forecastData = [
  { month: "Jun", actual: 450, predicted: null, lowerBound: null, upperBound: null },
  { month: "Jul", actual: 520, predicted: null, lowerBound: null, upperBound: null },
  { month: "Aug", actual: 480, predicted: null, lowerBound: null, upperBound: null },
  { month: "Sep", actual: 610, predicted: null, lowerBound: null, upperBound: null },
  { month: "Oct", actual: 580, predicted: null, lowerBound: null, upperBound: null },
  { month: "Nov", actual: 720, predicted: 720, lowerBound: 680, upperBound: 760 },
  { month: "Dec", actual: null, predicted: 850, lowerBound: 780, upperBound: 920 },
  { month: "Jan", actual: null, predicted: 620, lowerBound: 550, upperBound: 690 },
  { month: "Feb", actual: null, predicted: 580, lowerBound: 510, upperBound: 650 },
  { month: "Mar", actual: null, predicted: 650, lowerBound: 580, upperBound: 720 },
];

const lowStockProducts = [
  { id: "1", name: "Mechanical Gaming Keyboard", sku: "MGK-005", currentStock: 15, reorderPoint: 25, dailySales: 2.4, daysRemaining: 6, status: "critical" },
  { id: "2", name: "LED Desk Lamp", sku: "LDL-010", currentStock: 5, reorderPoint: 15, dailySales: 1.2, daysRemaining: 4, status: "critical" },
  { id: "3", name: "Smart Fitness Watch", sku: "SFW-002", currentStock: 28, reorderPoint: 30, dailySales: 4.5, daysRemaining: 6, status: "warning" },
  { id: "4", name: "Running Sneakers Pro", sku: "RSP-007", currentStock: 45, reorderPoint: 40, dailySales: 3.2, daysRemaining: 14, status: "warning" },
];

const categoryForecast = [
  { category: "Electronics", currentDemand: 2500, forecastDemand: 2850, growth: 14, stockCoverage: 45 },
  { category: "Clothing", currentDemand: 1800, forecastDemand: 2100, growth: 16.7, stockCoverage: 38 },
  { category: "Home & Garden", currentDemand: 1200, forecastDemand: 1350, growth: 12.5, stockCoverage: 52 },
  { category: "Sports", currentDemand: 800, forecastDemand: 720, growth: -10, stockCoverage: 65 },
  { category: "Books", currentDemand: 600, forecastDemand: 650, growth: 8.3, stockCoverage: 42 },
];

const statusStyles: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  good: "bg-emerald-500/10 text-emerald-500",
};

export default function ForecastingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Forecasting</h1>
        <p className="text-muted-foreground">Demand prediction, stock optimization, and reorder alerts</p>
      </div>

      {/* Alerts */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Low Stock Alert</AlertTitle>
        <AlertDescription>4 products are below or approaching reorder point. Immediate action recommended for 2 critical items.</AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total SKUs</span>
            </div>
            <div className="text-2xl font-bold mt-2">234</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Low Stock</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-500">12</div>
            <p className="text-xs text-muted-foreground">Need reorder</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Forecast Accuracy</span>
            </div>
            <div className="text-2xl font-bold mt-2">94%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Overstock Items</span>
            </div>
            <div className="text-2xl font-bold mt-2">8</div>
            <p className="text-xs text-muted-foreground">Above optimal level</p>
          </CardContent>
        </Card>
      </div>

      {/* Demand Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
          <CardDescription>Historical sales and predicted demand with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0 0)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0 0)",
                  border: "1px solid oklch(0.26 0 0)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="upperBound" stackId="1" stroke="none" fill="oklch(0.488 0.243 264.376)" fillOpacity={0.1} name="Upper Bound" />
              <Area type="monotone" dataKey="lowerBound" stackId="2" stroke="none" fill="oklch(0.16 0 0)" fillOpacity={1} name="Lower Bound" />
              <Line type="monotone" dataKey="actual" stroke="oklch(0.696 0.17 162.48)" strokeWidth={2} dot={{ fill: "oklch(0.696 0.17 162.48)" }} name="Actual Sales" connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="oklch(0.488 0.243 264.376)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "oklch(0.488 0.243 264.376)" }} name="Predicted" connectNulls={true} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>Products requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Current Stock</TableHead>
                <TableHead className="text-center">Reorder Point</TableHead>
                <TableHead className="text-center">Daily Sales</TableHead>
                <TableHead className="text-center">Days Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{product.sku}</div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{product.currentStock}</TableCell>
                  <TableCell className="text-center">{product.reorderPoint}</TableCell>
                  <TableCell className="text-center">{product.dailySales}</TableCell>
                  <TableCell className="text-center">
                    <span className={product.daysRemaining <= 7 ? "text-red-500 font-medium" : ""}>{product.daysRemaining} days</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusStyles[product.status]}>
                      {product.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Category Demand Forecast</CardTitle>
          <CardDescription>Predicted demand changes by category for next month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categoryForecast.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cat.category}</span>
                    <span className={`text-sm flex items-center gap-1 ${cat.growth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {cat.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {cat.growth >= 0 ? "+" : ""}
                      {cat.growth}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {cat.currentDemand} → {cat.forecastDemand} units
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={cat.stockCoverage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-20">{cat.stockCoverage} days stock</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
