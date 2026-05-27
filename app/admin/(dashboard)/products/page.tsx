"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Filter, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

interface AdminProduct {
  _id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  category: string;
  status: string;
  slug: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500",
  draft: "bg-yellow-500/10 text-yellow-500",
  archived: "bg-gray-500/10 text-gray-500",
};

const statusLabels: Record<string, string> = {
  active: "เปิดขาย",
  draft: "ฉบับร่าง",
  archived: "เก็บถาวร",
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/products?limit=100");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "ไม่สามารถโหลดสินค้าได้");
        }

        setProducts(
          (data.products || []).map((product: any) => ({
            _id: product._id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: product.price,
            quantity: product.quantity ?? 0,
            lowStockThreshold: product.lowStockThreshold ?? 10,
            category:
              product.category && typeof product.category === "object"
                ? product.category.name || "ไม่ระบุหมวดหมู่"
                : product.category || "ไม่ระบุหมวดหมู่",
            status: product.status || "draft",
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "ไม่สามารถโหลดสินค้าได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) => product.lowStockThreshold > 0 && product.quantity < product.lowStockThreshold
    );
  }, [products]);

  const deleteProduct = async (productId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ไม่สามารถลบสินค้าได้");
      }
      setProducts((prev) => prev.filter((product) => product._id !== productId));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">สินค้า</h1>
          <p className="text-muted-foreground">จัดการสินค้าคงคลังของคุณ</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มสินค้า
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ค้นหาสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {!isLoading && !error && lowStockProducts.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>แจ้งเตือนสต็อกต่ำ</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <p>มีสินค้า {lowStockProducts.length} รายการที่จำนวนต่ำกว่าค่าที่ตั้งไว้</p>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 6).map((product) => (
                  <Link
                    key={product._id}
                    href={`/admin/products/${product._id}/edit`}
                    className="rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
                  >
                    {product.name}: เหลือ {product.quantity} / ตั้งไว้ {product.lowStockThreshold}
                  </Link>
                ))}
                {lowStockProducts.length > 6 && (
                  <span className="px-2.5 py-1 text-xs text-amber-800">
                    และอีก {lowStockProducts.length - 6} รายการ
                  </span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>สินค้าทั้งหมด</CardTitle>
          <CardDescription>
            พบ {filteredProducts.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">กำลังโหลดสินค้า...</div>
          ) : error ? (
            <div className="py-20 text-center text-destructive">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead className="text-right">ราคา</TableHead>
                  <TableHead className="text-right">สต็อก</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={cn(
                            product.quantity === 0
                              ? "text-red-500"
                              : product.quantity < product.lowStockThreshold
                                ? "text-yellow-500"
                                : ""
                          )}
                        >
                          {product.quantity}
                        </span>
                        {product.lowStockThreshold > 0 && product.quantity < product.lowStockThreshold && (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                            สต็อกต่ำ
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(statusStyles[product.status])}>
                        {statusLabels[product.status] || product.status}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              ดู
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product._id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              แก้ไข
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onSelect={() => deleteProduct(product._id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            ลบ
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
    </div>
  );
}
