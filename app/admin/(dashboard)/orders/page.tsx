"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
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
import { CheckCircle, Eye, Loader2, MoreHorizontal, RefreshCcw, Save, Search, Truck, XCircle } from "lucide-react";
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
  items: Array<{ name?: string; productName?: string; quantity: number; price?: number; total?: number }>;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentSlipUrl?: string;
  gatewayProvider?: string;
  gatewaySessionId?: string;
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

const paymentMethodLabels: Record<string, string> = {
  cod: "เก็บเงินปลายทาง",
  qr_code: "QR Code",
  stripe_promptpay: "Stripe PromptPay",
  credit_card: "บัตรเครดิต",
  paypal: "PayPal",
  stripe: "Stripe",
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
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [shippingOrder, setShippingOrder] = useState<ApiOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<ApiOrder | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});
  const [detailSlipFile, setDetailSlipFile] = useState<File | null>(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders?limit=100", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "โหลดคำสั่งซื้อไม่สำเร็จ");
      }

      const nextOrders = Array.isArray(data.orders) ? data.orders : [];
      setOrders(nextOrders);
      setTrackingDrafts(
        nextOrders.reduce((drafts: Record<string, string>, order: ApiOrder) => {
          drafts[order._id] = order.trackingNumber || "";
          return drafts;
        }, {})
      );
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
    setUpdateSuccess(null);

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

      const updatedOrder = {
        ...order,
        ...data.order,
        status,
        trackingNumber: data.order?.trackingNumber || nextTrackingNumber || order.trackingNumber,
      };

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) => (currentOrder._id === order._id ? updatedOrder : currentOrder))
      );
      if (statusFilter !== "all" && statusFilter !== status) {
        setStatusFilter(status);
      }
      setShippingOrder(null);
      setTrackingNumber("");
      setUpdateSuccess(nextTrackingNumber ? `บันทึกเลขพัสดุ ${nextTrackingNumber} แล้ว` : "อัปเดตสถานะแล้ว");
      await fetchOrders();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setIsUpdating(false);
    }
  };

  const saveTrackingNumber = async (order: ApiOrder) => {
    const nextTrackingNumber = (trackingDrafts[order._id] || "").trim();

    if (!nextTrackingNumber) {
      setUpdateError("กรุณากรอกเลขพัสดุ");
      setUpdateSuccess(null);
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order._id,
          status: order.status === "shipped" ? undefined : "shipped",
          trackingNumber: nextTrackingNumber,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "บันทึกเลขพัสดุไม่สำเร็จ");
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? { ...currentOrder, ...data.order, trackingNumber: nextTrackingNumber, status: data.order?.status || "shipped" }
            : currentOrder
        )
      );
      setUpdateSuccess(`บันทึกเลขพัสดุ ${nextTrackingNumber} แล้ว`);
      await fetchOrders();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "บันทึกเลขพัสดุไม่สำเร็จ");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDetailSlipFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setDetailSlipFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUpdateError("กรุณาอัปโหลดไฟล์รูปภาพสลิป");
      setUpdateSuccess(null);
      setDetailSlipFile(null);
      return;
    }

    setUpdateError(null);
    setUpdateSuccess(null);
    setDetailSlipFile(file);
  };

  const savePaymentSlip = async (order: ApiOrder) => {
    if (!detailSlipFile) {
      setUpdateError("กรุณาเลือกไฟล์สลิปก่อนบันทึก");
      setUpdateSuccess(null);
      return;
    }

    setIsUploadingSlip(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", detailSlipFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || "อัปโหลดสลิปไม่สำเร็จ");
      }

      const updateResponse = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order._id,
          paymentSlipUrl: uploadResult.url,
        }),
      });
      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateResult.error || "บันทึกรูปสลิปไม่สำเร็จ");
      }

      const updatedOrder = { ...order, ...updateResult.order, paymentSlipUrl: uploadResult.url };

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) => (currentOrder._id === order._id ? updatedOrder : currentOrder))
      );
      setDetailOrder(updatedOrder);
      setDetailSlipFile(null);
      setUpdateSuccess("บันทึกรูปสลิปแล้ว");
      await fetchOrders();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "บันทึกรูปสลิปไม่สำเร็จ");
    } finally {
      setIsUploadingSlip(false);
    }
  };

  const openShippingDialog = (order: ApiOrder) => {
    setUpdateError(null);
    setUpdateSuccess(null);
    setShippingOrder(order);
    setTrackingNumber(order.trackingNumber || "");
  };

  const handleShippingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shippingOrder) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const nextTrackingNumber = String(formData.get("trackingNumber") || "").trim();

    if (!nextTrackingNumber) {
      setUpdateError("กรุณากรอกเลขพัสดุ");
      return;
    }

    setTrackingNumber(nextTrackingNumber);
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
          {updateSuccess && (
            <div className="mb-4 rounded-md bg-emerald-500/10 p-4 text-sm text-emerald-700">{updateSuccess}</div>
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
                      <div className="space-y-1">
                        <Badge variant="secondary" className={cn(paymentStyles[order.paymentStatus])}>
                          {paymentLabels[order.paymentStatus] || order.paymentStatus}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {paymentMethodLabels[order.paymentMethod || ""] || order.paymentMethod || "-"}
                        </div>
                        {order.paymentReference && (
                          <div className="font-mono text-xs text-muted-foreground">{order.paymentReference}</div>
                        )}
                        {order.paymentSlipUrl && (
                          <a
                            href={order.paymentSlipUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs font-medium text-primary hover:underline"
                          >
                            ดูสลิป
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-[190px] items-center gap-2">
                        <Input
                          value={trackingDrafts[order._id] ?? order.trackingNumber ?? ""}
                          onChange={(event) =>
                            setTrackingDrafts((drafts) => ({ ...drafts, [order._id]: event.target.value }))
                          }
                          placeholder="เลขพัสดุ"
                          className="h-8 font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => saveTrackingNumber(order)}
                          disabled={isUpdating || !(trackingDrafts[order._id] || "").trim()}
                          title="บันทึกเลขพัสดุ"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
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
                          <DropdownMenuItem onClick={() => setDetailOrder(order)}>
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

      <Dialog
        open={Boolean(detailOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailOrder(null);
            setDetailSlipFile(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          {detailOrder && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle>รายละเอียดคำสั่งซื้อ {detailOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  ตรวจสอบข้อมูลลูกค้า การชำระเงิน สลิป และรายการสินค้า
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border p-4">
                  <h3 className="mb-3 font-medium">ลูกค้า</h3>
                  <div className="space-y-1 text-sm">
                    <p>{getCustomerName(detailOrder)}</p>
                    <p className="text-muted-foreground">{detailOrder.customer?.email || "-"}</p>
                    <p className="text-muted-foreground">{formatDate(detailOrder.createdAt)}</p>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h3 className="mb-3 font-medium">การชำระเงิน</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn(paymentStyles[detailOrder.paymentStatus])}>
                        {paymentLabels[detailOrder.paymentStatus] || detailOrder.paymentStatus}
                      </Badge>
                      <span className="text-muted-foreground">
                        {paymentMethodLabels[detailOrder.paymentMethod || ""] || detailOrder.paymentMethod || "-"}
                      </span>
                    </div>
                    {detailOrder.paymentReference && (
                      <p className="font-mono text-xs text-muted-foreground">{detailOrder.paymentReference}</p>
                    )}
                    <p className="font-semibold">{formatCurrency(detailOrder.total)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-3 font-medium">สลิปชำระเงิน</h3>
                {detailOrder.paymentSlipUrl ? (
                  <div className="space-y-3">
                    <a
                      href={detailOrder.paymentSlipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block overflow-hidden rounded-md border bg-muted"
                    >
                      <img
                        src={detailOrder.paymentSlipUrl}
                        alt={`Payment slip for ${detailOrder.orderNumber}`}
                        className="max-h-[420px] w-full object-contain"
                      />
                    </a>
                    <a
                      href={detailOrder.paymentSlipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      เปิดรูปสลิปเต็ม
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">ไม่มีรูปสลิปสำหรับคำสั่งซื้อนี้</p>
                )}
                <div className="mt-4 space-y-2">
                  <Label htmlFor="adminPaymentSlip">
                    {detailOrder.paymentSlipUrl ? "อัปโหลดสลิปใหม่" : "แนบรูปสลิป"}
                  </Label>
                  <Input
                    id="adminPaymentSlip"
                    type="file"
                    accept="image/*"
                    onChange={handleDetailSlipFileChange}
                    disabled={isUploadingSlip}
                  />
                  {detailSlipFile && (
                    <p className="text-sm text-muted-foreground">เลือกไฟล์แล้ว: {detailSlipFile.name}</p>
                  )}
                  {isUploadingSlip && (
                    <p className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังอัปโหลดสลิป...
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => savePaymentSlip(detailOrder)}
                    disabled={isUploadingSlip || !detailSlipFile}
                  >
                    {isUploadingSlip && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    บันทึกสลิป
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-3 font-medium">รายการสินค้า</h3>
                <div className="space-y-2">
                  {detailOrder.items.map((item, index) => (
                    <div key={`${detailOrder._id}-${index}`} className="flex justify-between gap-4 text-sm">
                      <span className="min-w-0 truncate">
                        {item.name || item.productName || `สินค้า ${index + 1}`}
                        <span className="text-muted-foreground"> x {item.quantity}</span>
                      </span>
                      <span className="font-medium">
                        {typeof item.total === "number"
                          ? formatCurrency(item.total)
                          : typeof item.price === "number"
                            ? formatCurrency(item.price * item.quantity)
                            : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(shippingOrder)} onOpenChange={(open) => !open && setShippingOrder(null)}>
        <DialogContent>
          <form onSubmit={handleShippingSubmit} className="space-y-4">
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
                name="trackingNumber"
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="เช่น TH123456789"
                required
                autoComplete="off"
              />
            </div>
            {updateError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{updateError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShippingOrder(null)} disabled={isUpdating}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isUpdating || trackingNumber.trim().length === 0}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึกสถานะจัดส่ง
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
