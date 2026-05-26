"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Eye, Loader2, MoreHorizontal, RefreshCcw, Search, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

interface ApiOrder {
  _id: string;
  orderNumber: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  items: Array<{ quantity: number }>;
  total: number;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  createdAt: string;
  shippingAddress?: {
    fullName?: string;
  };
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-red-500/10 text-red-600",
  refunded: "bg-gray-500/10 text-gray-600",
};

const paymentStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  paid: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-gray-500/10 text-gray-600",
};

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังเตรียม",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งถึงแล้ว",
  cancelled: "ยกเลิกแล้ว",
  refunded: "คืนเงินแล้ว",
};

const paymentLabels: Record<string, string> = {
  pending: "รอชำระเงิน",
  paid: "ชำระแล้ว",
  failed: "ชำระไม่สำเร็จ",
  refunded: "คืนเงินแล้ว",
};

function getCustomerName(order: ApiOrder) {
  const name = `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim();
  return name || order.shippingAddress?.fullName || "ไม่ระบุลูกค้า";
}

function getItemCount(order: ApiOrder) {
  return order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [shippingOrder, setShippingOrder] = useState<ApiOrder | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders?limit=100", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "โหลดคำสั่งซื้อไม่สำเร็จ");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (order: ApiOrder, status: string, nextTrackingNumber?: string) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order._id,
          status,
          trackingNumber: nextTrackingNumber,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "อัปเดตสถานะไม่สำเร็จ");
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) => (currentOrder._id === order._id ? data.order : currentOrder))
      );
      setShippingOrder(null);
      setTrackingNumber("");
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setIsUpdating(false);
    }
  };

  const openShippingDialog = (order: ApiOrder) => {
    setUpdateError(null);
    setShippingOrder(order);
    setTrackingNumber(order.trackingNumber || "");
  };

  const handleShippingSubmit = () => {
    if (!shippingOrder) {
      return;
    }

    const nextTrackingNumber = trackingNumber.trim();
    if (!nextTrackingNumber) {
      setUpdateError("กรุณากรอกเลขพัสดุ");
      return;
    }

    updateOrderStatus(shippingOrder, "shipped", nextTrackingNumber);
  };

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = getCustomerName(order).toLowerCase();
      const email = (order.customer?.email || "").toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.orderNumber.toLowerCase().includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        email.includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(
    () => ({
      pending: orders.filter((order) => order.status === "pending").length,
      processing: orders.filter((order) => order.status === "processing").length,
      shipped: orders.filter((order) => order.status === "shipped").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
    }),
    [orders]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">คำสั่งซื้อ</h1>
          <p className="text-muted-foreground">จัดการและติดตามคำสั่งซื้อจากฐานข้อมูลจริง</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          รีเฟรช
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">คำสั่งซื้อรอดำเนินการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">กำลังเตรียม</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.shipped}</div>
            <p className="text-xs text-muted-foreground">จัดส่งแล้ว</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">ส่งถึงแล้ว</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาคำสั่งซื้อ ลูกค้า หรืออีเมล..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="กรองตามสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="processing">กำลังเตรียม</SelectItem>
                <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                <SelectItem value="delivered">ส่งถึงแล้ว</SelectItem>
                <SelectItem value="cancelled">ยกเลิกแล้ว</SelectItem>
                <SelectItem value="refunded">คืนเงินแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>คำสั่งซื้อทั้งหมด</CardTitle>
          <CardDescription>พบ {filteredOrders.length} คำสั่งซื้อ</CardDescription>
        </CardHeader>
        <CardContent>
          {updateError && !shippingOrder && (
            <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">{updateError}</div>
          )}
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังโหลดคำสั่งซื้อ...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>คำสั่งซื้อ</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead className="text-center">รายการ</TableHead>
                  <TableHead className="text-right">ยอดรวม</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การชำระเงิน</TableHead>
                  <TableHead>เลขพัสดุ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{getCustomerName(order)}</div>
                      <div className="text-xs text-muted-foreground">{order.customer?.email || "-"}</div>
                    </TableCell>
                    <TableCell className="text-center">{getItemCount(order)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(statusStyles[order.status])}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(paymentStyles[order.paymentStatus])}>
                        {paymentLabels[order.paymentStatus] || order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.trackingNumber || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            ดูรายละเอียด
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateOrderStatus(order, "processing")}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            ทำเครื่องหมายว่ากำลังเตรียม
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openShippingDialog(order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            ทำเครื่องหมายว่าจัดส่งแล้ว
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order, "delivered")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            ทำเครื่องหมายว่าส่งถึงแล้ว
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => updateOrderStatus(order, "cancelled")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            ยกเลิกคำสั่งซื้อ
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order, "refunded")}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            ดำเนินการคืนเงิน
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(shippingOrder)} onOpenChange={(open) => !open && setShippingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ใส่เลขพัสดุ</DialogTitle>
            <DialogDescription>
              ต้องกรอกเลขพัสดุก่อนเปลี่ยนคำสั่งซื้อเป็นสถานะจัดส่งแล้ว
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">เลขพัสดุ</Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="เช่น TH123456789"
            />
          </div>
          {updateError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{updateError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOrder(null)} disabled={isUpdating}>
              ยกเลิก
            </Button>
            <Button onClick={handleShippingSubmit} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึกสถานะจัดส่ง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
