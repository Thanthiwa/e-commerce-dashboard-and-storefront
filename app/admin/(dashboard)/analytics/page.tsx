"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Package, DollarSign, BarChart3, PieChart, LineChart, Activity } from "lucide-react";
import Link from "next/link";

const analyticsModules = [
  {
    title: "Sales Analytics",
    description: "Revenue trends, growth metrics, and sales performance analysis",
    icon: TrendingUp,
    href: "/analytics/sales",
    stats: [
      { label: "Revenue Growth", value: "+12.5%" },
      { label: "Avg. Order Value", value: "$89.50" },
    ],
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Customer Segmentation",
    description: "RFM analysis, customer clusters, and behavioral insights",
    icon: Users,
    href: "/analytics/segmentation",
    stats: [
      { label: "VIP Customers", value: "156" },
      { label: "At-Risk", value: "42" },
    ],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Product Recommendations",
    description: "Association rules, frequently bought together, and similar products",
    icon: Package,
    href: "/analytics/recommendations",
    stats: [
      { label: "Product Pairs", value: "234" },
      { label: "Avg. Confidence", value: "78%" },
    ],
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Inventory Forecasting",
    description: "Demand prediction, stock optimization, and reorder alerts",
    icon: Activity,
    href: "/analytics/forecasting",
    stats: [
      { label: "Low Stock Items", value: "12" },
      { label: "Forecast Accuracy", value: "94%" },
    ],
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Data Mining & Analytics</h1>
        <p className="text-muted-foreground">Advanced insights and predictive analytics for your store</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground">Transactions analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patterns Found</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">Product associations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Segments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Customer groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Predictions</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Model accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {analyticsModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${module.bgColor}`}>
                    <module.icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  {module.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
