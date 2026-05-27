"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, BarChart3, Boxes, Loader2, PackageSearch, ShoppingCart, Sparkles, Users } from "lucide-react";

interface SalesAnalytics {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    period: number;
  };
  salesTrend: Array<{ date: string; revenue: number; orders: number; units: number }>;
  topProducts: Array<{ id: string; name: string; units: number; revenue: number }>;
  salesByCategory: Array<{ name: string; revenue: number; orders: number }>;
}

interface SegmentationAnalytics {
  summary: {
    totalCustomers: number;
    avgLifetimeValue: number;
    avgFrequency: number;
    segments: number;
  };
  segments: Array<{ name: string; count: number; totalRevenue: number; avgOrderValue: number; percentage: number }>;
  customers: Array<{
    customerId: string;
    customerName: string;
    email: string;
    segment: string;
    totalOrders: number;
    totalSpent: number;
    recency: number;
  }>;
}

interface RecommendationsAnalytics {
  summary: {
    totalTransactions: number;
    totalRules: number;
    uniqueProducts: number;
  };
  frequentlyBoughtTogether: Array<{
    products: Array<{ name?: string; price?: number }>;
    frequency: number;
    support: number;
  }>;
}

const emptySales: SalesAnalytics = {
  summary: {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    period: 30,
  },
  salesTrend: [],
  topProducts: [],
  salesByCategory: [],
};

const emptySegments: SegmentationAnalytics = {
  summary: {
    totalCustomers: 0,
    avgLifetimeValue: 0,
    avgFrequency: 0,
    segments: 0,
  },
  segments: [],
  customers: [],
};

const emptyRecommendations: RecommendationsAnalytics = {
  summary: {
    totalTransactions: 0,
    totalRules: 0,
    uniqueProducts: 0,
  },
  frequentlyBoughtTogether: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);
}

function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof BarChart3;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DataMiningPage() {
  const [sales, setSales] = useState<SalesAnalytics>(emptySales);
  const [segments, setSegments] = useState<SegmentationAnalytics>(emptySegments);
  const [recommendations, setRecommendations] = useState<RecommendationsAnalytics>(emptyRecommendations);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [salesResponse, segmentResponse, recommendationResponse] = await Promise.all([
          fetch("/api/analytics/sales?period=90", { cache: "no-store" }),
          fetch("/api/analytics/segmentation", { cache: "no-store" }),
          fetch("/api/analytics/recommendations?minSupport=0.01&minConfidence=0.1", { cache: "no-store" }),
        ]);

        const [salesData, segmentData, recommendationData] = await Promise.all([
          salesResponse.json(),
          segmentResponse.json(),
          recommendationResponse.json(),
        ]);

        if (!salesResponse.ok) throw new Error(salesData.error || "โหลดข้อมูลยอดซื้อไม่สำเร็จ");
        if (!segmentResponse.ok) throw new Error(segmentData.error || "โหลดข้อมูลกลุ่มลูกค้าไม่สำเร็จ");
        if (!recommendationResponse.ok) throw new Error(recommendationData.error || "โหลดข้อมูลสินค้าที่ซื้อคู่กันไม่สำเร็จ");

        setSales(salesData);
        setSegments(segmentData);
        setRecommendations(recommendationData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "โหลดข้อมูล Data Mining ไม่สำเร็จ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const totalUnits = useMemo(
    () => sales.salesTrend.reduce((sum, day) => sum + Number(day.units || 0), 0),
    [sales.salesTrend]
  );

  const topCategoryRevenue = sales.salesByCategory[0]?.revenue || 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        กำลังโหลดข้อมูล Data Mining...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Mining การซื้อ</h1>
          <p className="text-muted-foreground">รวมข้อมูลการซื้อ สินค้าขายดี ลูกค้าสำคัญ และแพตเทิร์นซื้อคู่ไว้ในหน้าเดียว</p>
        </div>
        <Badge variant="secondary" className="gap-2 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          90 วันล่าสุด
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="ยอดขายจากคำสั่งซื้อ"
          value={formatCurrency(sales.summary.totalRevenue)}
          description={`${formatNumber(sales.summary.totalOrders)} คำสั่งซื้อในช่วงที่เลือก`}
          icon={ShoppingCart}
        />
        <StatCard
          title="มูลค่าเฉลี่ยต่อบิล"
          value={formatCurrency(sales.summary.averageOrderValue)}
          description={`เติบโต ${formatPercent(sales.summary.revenueGrowth)} เทียบช่วงก่อนหน้า`}
          icon={BarChart3}
        />
        <StatCard
          title="จำนวนสินค้าที่ขาย"
          value={formatNumber(totalUnits)}
          description={`${formatNumber(sales.topProducts.length)} รายการติดอันดับขายดี`}
          icon={Boxes}
        />
        <StatCard
          title="ลูกค้าที่มีประวัติซื้อ"
          value={formatNumber(segments.summary.totalCustomers)}
          description={`LTV เฉลี่ย ${formatCurrency(segments.summary.avgLifetimeValue)}`}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>สินค้าขายดี</CardTitle>
            <CardDescription>จัดอันดับจากรายได้รวมของคำสั่งซื้อ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead className="text-right">รายได้</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.topProducts.slice(0, 8).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="max-w-[360px] truncate font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{formatNumber(product.units)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.revenue)}</TableCell>
                  </TableRow>
                ))}
                {sales.topProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      ยังไม่มีข้อมูลสินค้าขายดี
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ยอดซื้อแยกตามหมวดหมู่</CardTitle>
            <CardDescription>ดูหมวดที่สร้างรายได้สูงสุด</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sales.salesByCategory.slice(0, 6).map((category) => {
              const progress = topCategoryRevenue > 0 ? (category.revenue / topCategoryRevenue) * 100 : 0;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{category.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(category.revenue)}</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} />
                </div>
              );
            })}
            {sales.salesByCategory.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลหมวดหมู่</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>สินค้าที่มักซื้อคู่กัน</CardTitle>
            <CardDescription>ใช้ช่วยจัดโปรโมชันหรือแนะนำสินค้าเพิ่มในร้าน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.frequentlyBoughtTogether.slice(0, 10).map((pair, index) => {
              const productNames = pair.products.map((product) => product.name || "Unknown").join(" + ");
              return (
                <div key={`${productNames}-${index}`} className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <PackageSearch className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{productNames}</p>
                      <p className="text-xs text-muted-foreground">Support {formatPercent(pair.support * 100)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{formatNumber(pair.frequency)} ครั้ง</Badge>
                </div>
              );
            })}
            {recommendations.frequentlyBoughtTogether.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีแพตเทิร์นซื้อคู่กัน</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ลูกค้าซื้อสูงสุด</CardTitle>
          <CardDescription>จัดอันดับจากยอดใช้จ่ายสะสมและจำนวนคำสั่งซื้อ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>กลุ่ม</TableHead>
                <TableHead className="text-right">คำสั่งซื้อ</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead className="text-right">ซื้อล่าสุด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.customers.slice(0, 10).map((customer) => (
                <TableRow key={customer.customerId}>
                  <TableCell>
                    <div className="font-medium">{customer.customerName}</div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.segment}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(customer.totalOrders)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatNumber(customer.recency)} วันก่อน</TableCell>
                </TableRow>
              ))}
              {segments.customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    ยังไม่มีข้อมูลลูกค้าที่ซื้อสินค้า
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
