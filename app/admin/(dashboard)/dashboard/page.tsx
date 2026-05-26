import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { RevenueChart } from "@/components/admin/charts/revenue-chart";
import { SalesByCategoryChart } from "@/components/admin/charts/sales-by-category-chart";
import { RecentOrdersTable } from "@/components/admin/tables/recent-orders-table";
import { TopProductsTable } from "@/components/admin/tables/top-products-table";

const kpiData = {
  revenue: {
    value: 124589.0,
    change: 12.5,
    trend: "up" as const,
  },
  orders: {
    value: 1248,
    change: 8.2,
    trend: "up" as const,
  },
  customers: {
    value: 856,
    change: 15.3,
    trend: "up" as const,
  },
  products: {
    value: 234,
    change: -2.4,
    trend: "down" as const,
  },
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">แดชบอร์ด</h1>
        <p className="text-muted-foreground">ภาพรวมประสิทธิภาพร้านค้าของคุณ</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.revenue.value)}</div>
            <div className="flex items-center gap-1 text-xs">
              {kpiData.revenue.trend === "up" ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">+{kpiData.revenue.change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{kpiData.revenue.change}%</span>
                </>
              )}
              <span className="text-muted-foreground">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">คำสั่งซื้อทั้งหมด</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpiData.orders.value)}</div>
            <div className="flex items-center gap-1 text-xs">
              {kpiData.orders.trend === "up" ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">+{kpiData.orders.change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{kpiData.orders.change}%</span>
                </>
              )}
              <span className="text-muted-foreground">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ลูกค้าใหม่</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpiData.customers.value)}</div>
            <div className="flex items-center gap-1 text-xs">
              {kpiData.customers.trend === "up" ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">+{kpiData.customers.change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{kpiData.customers.change}%</span>
                </>
              )}
              <span className="text-muted-foreground">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สินค้าที่เปิดขาย</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpiData.products.value)}</div>
            <div className="flex items-center gap-1 text-xs">
              {kpiData.products.trend === "up" ? (
                <>
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">+{kpiData.products.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{kpiData.products.change}%</span>
                </>
              )}
              <span className="text-muted-foreground">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>ภาพรวมรายได้</CardTitle>
            <CardDescription>รายได้รายเดือนของปีนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>ยอดขายตามหมวดหมู่</CardTitle>
            <CardDescription>สัดส่วนยอดขายแยกตามหมวดหมู่</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesByCategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
            <CardDescription>รายการสั่งซื้อล่าสุดจากร้านของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สินค้าขายดี</CardTitle>
            <CardDescription>สินค้าที่ขายดีที่สุดในเดือนนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
