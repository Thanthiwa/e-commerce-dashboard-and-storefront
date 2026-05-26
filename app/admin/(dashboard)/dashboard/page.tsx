"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { RevenueChart } from "@/components/admin/charts/revenue-chart";
import { SalesByCategoryChart } from "@/components/admin/charts/sales-by-category-chart";
import { RecentOrdersTable } from "@/components/admin/tables/recent-orders-table";
import { TopProductsTable } from "@/components/admin/tables/top-products-table";

interface DashboardData {
  summary: {
    totalRevenue: number;
    revenueGrowth: number;
    ordersThisMonth: number;
    ordersGrowth: number;
    totalCustomers: number;
    customersGrowth: number;
    totalProducts: number;
    productsGrowth: number;
    averageOrderValue: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  salesByCategory: Array<{ name: string; value: number; revenue: number; orders: number; color?: string }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    email?: string;
    total: number;
    status: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sku?: string;
    sales: number;
    revenue: number;
    stock?: number;
  }>;
}

const emptyDashboard: DashboardData = {
  summary: {
    totalRevenue: 0,
    revenueGrowth: 0,
    ordersThisMonth: 0,
    ordersGrowth: 0,
    totalCustomers: 0,
    customersGrowth: 0,
    totalProducts: 0,
    productsGrowth: 0,
    averageOrderValue: 0,
  },
  monthlyRevenue: [],
  salesByCategory: [],
  recentOrders: [],
  topProducts: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function TrendValue({ value, icon = "arrow" }: { value: number; icon?: "arrow" | "trend" }) {
  const isPositive = value >= 0;
  const Icon = icon === "trend" ? (isPositive ? TrendingUp : TrendingDown) : isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <>
      <Icon className={`h-3 w-3 ${isPositive ? "text-emerald-500" : "text-red-500"}`} />
      <span className={isPositive ? "text-emerald-500" : "text-red-500"}>
        {isPositive ? "+" : ""}
        {value}%
      </span>
    </>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
        }

        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        กำลังโหลดข้อมูลแดชบอร์ด...
      </div>
    );
  }

  const summary = dashboard.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">แดชบอร์ด</h1>
        <p className="text-muted-foreground">ภาพรวมประสิทธิภาพร้านค้าจากฐานข้อมูลจริง</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendValue value={summary.revenueGrowth} />
              <span className="text-muted-foreground">จาก 30 วันก่อนหน้า</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">คำสั่งซื้อทั้งหมด</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.ordersThisMonth)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendValue value={summary.ordersGrowth} />
              <span className="text-muted-foreground">จาก 30 วันก่อนหน้า</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ลูกค้าทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalCustomers)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendValue value={summary.customersGrowth} />
              <span className="text-muted-foreground">ลูกค้าใหม่เทียบ 30 วันก่อนหน้า</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สินค้าที่เปิดขาย</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalProducts)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendValue value={summary.productsGrowth} icon="trend" />
              <span className="text-muted-foreground">สินค้าใหม่เทียบ 30 วันก่อนหน้า</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>ภาพรวมรายได้</CardTitle>
            <CardDescription>รายได้รายเดือนของปีนี้จากคำสั่งซื้อจริง</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={dashboard.monthlyRevenue} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>ยอดขายตามหมวดหมู่</CardTitle>
            <CardDescription>สัดส่วนยอดขาย 30 วันล่าสุดแยกตามหมวดหมู่</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesByCategoryChart data={dashboard.salesByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
            <CardDescription>รายการสั่งซื้อล่าสุดจากฐานข้อมูล</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={dashboard.recentOrders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สินค้าขายดี</CardTitle>
            <CardDescription>สินค้าที่ขายดีที่สุดใน 30 วันล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsTable products={dashboard.topProducts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
