"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Eye, Truck, XCircle, CheckCircle, RefreshCcw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

const orders = [
  { id: "ORD-240521-0001", customer: "John Smith", email: "john@example.com", items: 3, total: 299.99, status: "delivered", payment: "paid", date: "2024-05-21" },
  { id: "ORD-240521-0002", customer: "Sarah Johnson", email: "sarah@example.com", items: 1, total: 149.5, status: "shipped", payment: "paid", date: "2024-05-21" },
  { id: "ORD-240520-0015", customer: "Michael Brown", email: "michael@example.com", items: 2, total: 89.99, status: "processing", payment: "paid", date: "2024-05-20" },
  { id: "ORD-240520-0014", customer: "Emily Davis", email: "emily@example.com", items: 5, total: 459.0, status: "pending", payment: "pending", date: "2024-05-20" },
  { id: "ORD-240519-0022", customer: "David Wilson", email: "david@example.com", items: 2, total: 199.99, status: "cancelled", payment: "refunded", date: "2024-05-19" },
  { id: "ORD-240519-0021", customer: "Lisa Anderson", email: "lisa@example.com", items: 1, total: 79.99, status: "delivered", payment: "paid", date: "2024-05-19" },
  { id: "ORD-240518-0018", customer: "James Taylor", email: "james@example.com", items: 4, total: 329.99, status: "delivered", payment: "paid", date: "2024-05-18" },
  { id: "ORD-240518-0017", customer: "Jennifer Martinez", email: "jennifer@example.com", items: 2, total: 159.99, status: "refunded", payment: "refunded", date: "2024-05-18" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-blue-500/10 text-blue-500",
  shipped: "bg-purple-500/10 text-purple-500",
  delivered: "bg-emerald-500/10 text-emerald-500",
  cancelled: "bg-red-500/10 text-red-500",
  refunded: "bg-gray-500/10 text-gray-500",
};

const paymentStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  paid: "bg-emerald-500/10 text-emerald-500",
  failed: "bg-red-500/10 text-red-500",
  refunded: "bg-gray-500/10 text-gray-500",
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

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.customer.toLowerCase().includes(searchQuery.toLowerCase()) || order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">คำสั่งซื้อ</h1>
        <p className="text-muted-foreground">จัดการและติดตามคำสั่งซื้อของลูกค้า</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">คำสั่งซื้อรอดำเนินการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "processing").length}</div>
            <p className="text-xs text-muted-foreground">กำลังเตรียม</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "shipped").length}</div>
            <p className="text-xs text-muted-foreground">จัดส่งแล้ว</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</div>
            <p className="text-xs text-muted-foreground">ส่งถึงแล้ว</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ค้นหาคำสั่งซื้อ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>คำสั่งซื้อทั้งหมด</CardTitle>
          <CardDescription>
            พบ {filteredOrders.length} คำสั่งซื้อ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>คำสั่งซื้อ</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead className="text-center">รายการ</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การชำระเงิน</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-xs text-muted-foreground">{order.email}</div>
                  </TableCell>
                  <TableCell className="text-center">{order.items}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(statusStyles[order.status])}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(paymentStyles[order.payment])}>
                      {paymentLabels[order.payment] || order.payment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
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
                        <DropdownMenuItem>
                          <Truck className="mr-2 h-4 w-4" />
                          ทำเครื่องหมายว่าจัดส่งแล้ว
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          ทำเครื่องหมายว่าส่งถึงแล้ว
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          ยกเลิกคำสั่งซื้อ
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  );
}
