"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { useCart } from "@/lib/store/cart-context";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  badge?: string;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
  const badgeLabel = product.badge === "Sale" || product.badge === "ลดราคา" ? "ลดราคา" : product.badge === "New" || product.badge === "ใหม่" ? "ใหม่" : product.badge;

  return (
    <Card className="group overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" />
          {product.badge && (
            <Badge className="absolute top-3 left-3" variant={badgeLabel === "ลดราคา" ? "destructive" : "default"}>
              {badgeLabel}
            </Badge>
          )}
          {discount > 0 && <Badge className="absolute top-3 right-3 bg-red-500 text-white">-{discount}%</Badge>}
        </div>
      </Link>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>}
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() =>
              addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
              })
            }
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">เพิ่มลงตะกร้า</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
