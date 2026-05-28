"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store/cart-context";
import { formatCurrency } from "@/lib/utils/format";

export default function CartPage() {
  const { items, removeItem, updateItemStock, updateQuantity, clearCart, totalPrice } =
    useCart();
  const [quantityErrors, setQuantityErrors] = useState<Record<string, string>>({});
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const stockSyncItems = useMemo(
    () => items.map((item) => ({ id: item.id, slug: item.slug })),
    [items]
  );
  const shipping = totalPrice > 50 || totalPrice === 0 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch("/api/storefront/auth/me");
        const data = await res.json();
        setIsAuthenticated(Boolean(data.user));
      } catch (err) {
        console.error("Failed to check checkout auth status", err);
        setIsAuthenticated(false);
      }
    };

    fetchAuthStatus();
  }, []);

  useEffect(() => {
    if (stockSyncItems.length === 0) {
      return;
    }

    const controller = new AbortController();

    stockSyncItems.forEach(async (item) => {
      try {
        const res = await fetch(`/api/products/${item.slug}`, { signal: controller.signal });
        if (!res.ok) {
          return;
        }

        const product = await res.json();
        updateItemStock(item.id, Number(product.quantity ?? 0));
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to sync cart stock", err);
        }
      }
    });

    return () => controller.abort();
  }, [stockSyncItems, updateItemStock]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-2 text-xl font-semibold">ตะกร้าของคุณยังว่างอยู่</h1>
            <p className="mb-6 text-muted-foreground">เพิ่มสินค้าลงในตะกร้าเพื่อเริ่มสั่งซื้อ</p>
            <Button asChild>
              <Link href="/products">
                เลือกซื้อสินค้าต่อ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">ตะกร้าสินค้า</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${item.slug}`} className="font-medium transition-colors hover:text-primary">
                      {item.name}
                    </Link>
                    {item.variant && <p className="mt-1 text-sm text-muted-foreground">{item.variant}</p>}
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <p className="font-semibold">{formatCurrency(item.price)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">ลบสินค้า</span>
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-16 text-center text-sm font-medium p-0"
                          value={quantityInputs[item.id] ?? String(item.quantity)}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // allow empty string while typing
                            if (raw === "") {
                              setQuantityInputs((s) => ({ ...s, [item.id]: "" }));
                              setQuantityErrors((s) => {
                                const copy = { ...s };
                                delete copy[item.id];
                                return copy;
                              });
                              return;
                            }

                            // accept only digits during typing
                            if (!/^[0-9]*$/.test(raw)) return;

                            setQuantityInputs((s) => ({ ...s, [item.id]: raw }));

                            const v = parseInt(raw || "0", 10);
                            if (item.stock !== undefined && !Number.isNaN(v) && v > item.stock) {
                              setQuantityErrors((s) => ({ ...s, [item.id]: `มากกว่าจำนวนในสต็อก (${item.stock})` }));
                            } else {
                              setQuantityErrors((s) => {
                                const copy = { ...s };
                                delete copy[item.id];
                                return copy;
                              });
                            }
                          }}
                          onBlur={(e) => {
                            const raw = e.target.value;
                            let v = parseInt(raw, 10);
                            if (Number.isNaN(v) || v < 1) v = 1;
                            if (item.stock !== undefined && v > item.stock) v = item.stock;
                            updateQuantity(item.id, v);
                            setQuantityInputs((s) => ({ ...s, [item.id]: String(v) }));
                            setQuantityErrors((s) => {
                              const copy = { ...s };
                              delete copy[item.id];
                              return copy;
                            });
                          }}
                          onKeyDown={(e) => {
                            // allow control keys and digits only
                            if (
                              e.key === "Backspace" ||
                              e.key === "Delete" ||
                              e.key === "ArrowLeft" ||
                              e.key === "ArrowRight" ||
                              e.key === "Tab"
                            ) {
                              return;
                            }
                            if (!/^[0-9]$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                        {quantityErrors[item.id] && (
                          <p className="mt-1 text-xs text-destructive">{quantityErrors[item.id]}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      {item.stock !== undefined && (
                        <span className="text-xs text-muted-foreground">{item.stock} รายการในสต็อก</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <Button variant="outline" asChild>
              <Link href="/products">เลือกซื้อสินค้าต่อ</Link>
            </Button>
            <Button variant="ghost" className="text-destructive" onClick={clearCart}>
              ล้างตะกร้า
            </Button>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="โค้ดส่วนลด" disabled />
                <Button variant="secondary" disabled>
                  <Tag className="h-4 w-4" />
                  <span className="sr-only">ใช้โค้ดส่วนลด</span>
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ค่าจัดส่ง</span>
                  <span>{shipping === 0 ? <span className="text-emerald-500">จัดส่งฟรี</span> : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ภาษี</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>ยอดรวมทั้งหมด</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {shipping === 0 && <p className="text-center text-xs text-emerald-500">คุณได้รับสิทธิ์จัดส่งฟรีแล้ว</p>}
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" asChild>
                <Link href={isAuthenticated ? "/checkout" : "/login?redirect=/checkout"}>
                  {isAuthenticated ? "ดำเนินการสั่งซื้อ" : "เข้าสู่ระบบเพื่อชำระเงิน"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
