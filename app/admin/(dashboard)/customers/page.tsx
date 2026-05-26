"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Loader2, Mail, MoreHorizontal, RefreshCcw, Search, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

interface ApiCustomer {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | null;
  segment?: string | null;
}

const segmentStyles: Record<string, string> = {
  Champions: "bg-emerald-500/10 text-emerald-600",
  Loyal: "bg-blue-500/10 text-blue-600",
  Potential: "bg-purple-500/10 text-purple-600",
  New: "bg-cyan-500/10 text-cyan-600",
  "At-Risk": "bg-yellow-500/10 text-yellow-600",
  Lost: "bg-red-500/10 text-red-600",
};

const segmentLabels: Record<string, string> = {
  Champions: "ลูกค้าชั้นเยี่ยม",
  Loyal: "ลูกค้าประจำ",
  Potential: "มีแนวโน้มซื้อซ้ำ",
  New: "ลูกค้าใหม่",
  "At-Risk": "เสี่ยงหาย",
  Lost: "ไม่ได้ซื้อแล้ว",
};

function getCustomerName(customer: ApiCustomer) {
  const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
  return name || customer.email;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/customers?limit=100", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "โหลดข้อมูลลูกค้าไม่สำเร็จ");
      }

      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลลูกค้าไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const name = getCustomerName(customer).toLowerCase();
      const email = customer.email.toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 || name.includes(normalizedSearch) || email.includes(normalizedSearch);
      const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [customers, searchQuery, segmentFilter]);

  const stats = useMemo(() => {
    const totalSpent = customers.reduce((sum, customer) => sum + Number(customer.totalSpent || 0), 0);

    return {
      total: customers.length,
      vip: customers.filter((customer) => customer.segment === "Champions" || customer.segment === "Loyal").length,
      atRisk: customers.filter((customer) => customer.segment === "At-Risk" || customer.segment === "Lost").length,
      averageLifetimeValue: customers.length > 0 ? totalSpent / customers.length : 0,
    };
  }, [customers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ลูกค้า</h1>
          <p className="text-muted-foreground">ดูแลและจัดการฐานลูกค้าจากฐานข้อมูลจริง</p>
        </div>
        <Button variant="outline" onClick={fetchCustomers} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          รีเฟรช
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">ลูกค้าทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.vip}</div>
            <p className="text-xs text-muted-foreground">ลูกค้า VIP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground">กลุ่มเสี่ยงหาย</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(stats.averageLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">มูลค่าเฉลี่ยตลอดอายุลูกค้า</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาลูกค้าหรืออีเมล..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="กรองตามกลุ่มลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกกลุ่ม</SelectItem>
                <SelectItem value="Champions">ลูกค้าชั้นเยี่ยม</SelectItem>
                <SelectItem value="Loyal">ลูกค้าประจำ</SelectItem>
                <SelectItem value="Potential">มีแนวโน้มซื้อซ้ำ</SelectItem>
                <SelectItem value="New">ลูกค้าใหม่</SelectItem>
                <SelectItem value="At-Risk">เสี่ยงหาย</SelectItem>
                <SelectItem value="Lost">ไม่ได้ซื้อแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ลูกค้าทั้งหมด</CardTitle>
          <CardDescription>พบ {filteredCustomers.length} คน</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังโหลดข้อมูลลูกค้า...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">ไม่พบลูกค้าที่ตรงกับตัวกรอง</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead className="text-center">คำสั่งซื้อ</TableHead>
                  <TableHead className="text-right">ยอดใช้จ่ายรวม</TableHead>
                  <TableHead>คำสั่งซื้อล่าสุด</TableHead>
                  <TableHead>กลุ่มลูกค้า</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const name = getCustomerName(customer);
                  const segment = customer.segment || "New";

                  return (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-sm text-primary">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{customer.totalOrders || 0}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.totalSpent || 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(customer.lastOrderDate)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(segmentStyles[segment])}>
                          {segmentLabels[segment] || segment}
                        </Badge>
                      </TableCell>
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
                              ดูโปรไฟล์
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              ส่งอีเมล
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="mr-2 h-4 w-4" />
                              เพิ่มแท็ก
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
