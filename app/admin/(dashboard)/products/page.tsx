"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Demo data
const products = [
  { id: "1", name: "Wireless Bluetooth Headphones", sku: "WBH-001", price: 99.99, stock: 42, category: "Electronics", status: "active" },
  { id: "2", name: "Smart Fitness Watch", sku: "SFW-002", price: 199.99, stock: 28, category: "Electronics", status: "active" },
  { id: "3", name: "Portable Power Bank 20000mAh", sku: "PPB-003", price: 49.99, stock: 65, category: "Electronics", status: "active" },
  { id: "4", name: "USB-C Hub Multiport Adapter", sku: "UCH-004", price: 59.99, stock: 120, category: "Electronics", status: "active" },
  { id: "5", name: "Mechanical Gaming Keyboard", sku: "MGK-005", price: 109.99, stock: 15, category: "Electronics", status: "active" },
  { id: "6", name: "Premium Cotton T-Shirt", sku: "PCT-006", price: 29.99, stock: 200, category: "Clothing", status: "active" },
  { id: "7", name: "Running Sneakers Pro", sku: "RSP-007", price: 129.99, stock: 45, category: "Sports", status: "active" },
  { id: "8", name: "Organic Coffee Beans 1kg", sku: "OCB-008", price: 24.99, stock: 0, category: "Food", status: "draft" },
  { id: "9", name: "Yoga Mat Premium", sku: "YMP-009", price: 39.99, stock: 80, category: "Sports", status: "active" },
  { id: "10", name: "LED Desk Lamp", sku: "LDL-010", price: 44.99, stock: 5, category: "Home & Garden", status: "archived" },
];

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500",
  draft: "bg-yellow-500/10 text-yellow-500",
  archived: "bg-gray-500/10 text-gray-500",
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(product.stock === 0 ? "text-red-500" : product.stock <= 10 ? "text-yellow-500" : "")}>{product.stock}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("capitalize", statusStyles[product.status])}>
                      {product.status}
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
                          <Link href={`/admin/products/${product.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
