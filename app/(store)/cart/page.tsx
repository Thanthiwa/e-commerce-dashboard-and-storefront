"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

// ข้อมูลตะกร้าตัวอย่าง
const initialCartItems = [
  { id: "1", name: "หูฟังบลูทูธไร้สาย", slug: "wireless-bluetooth-headphones", price: 99.99, image: "/placeholder.svg?height=100&width=100", quantity: 1, variant: "สีดำ" },
  { id: "2", name: "สมาร์ทวอทช์ฟิตเนส", slug: "smart-fitness-watch", price: 199.99, image: "/placeholder.svg?height=100&width=100", quantity: 2, variant: "สีเงิน" },
  { id: "3", name: "เสื้อยืดคอตตอนพรีเมียม", slug: "premium-cotton-tshirt", price: 29.99, image: "/placeholder.svg?height=100&width=100", quantity: 1, variant: "สีขาว / M" },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState("");

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">ตะกร้าของคุณยังว่างอยู่</h2>
            <p className="text-muted-foreground mb-6">เพิ่มสินค้าลงในตะกร้าเพื่อเริ่มการสั่งซื้อ</p>
            <Button asChild>
              <Link href="/products">
                เลือกซื้อสินค้าต่อไป
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
      <h1 className="text-3xl font-bold mb-8">ตะกร้าสินค้า</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`} className="font-medium hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">{item.variant}</p>
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
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Continue Shopping */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/products">เลือกซื้อสินค้าต่อไป</Link>
            </Button>
            <Button variant="ghost" className="text-destructive" onClick={() => setCartItems([])}>
              ล้างตะกร้า
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promo Code */}
              <div className="flex gap-2">
                <Input placeholder="โค้ดส่วนลด" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                <Button variant="secondary">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ยอดรวมก่อนหักส่วนลด</span>
                  <span>{formatCurrency(subtotal)}</span>
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
                <div className="flex justify-between font-semibold text-lg">
                  <span>ยอดรวมทั้งหมด</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {shipping === 0 && <p className="text-xs text-emerald-500 text-center">คุณได้รับสิทธิ์จัดส่งฟรีแล้ว!</p>}
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">
                  ดำเนินการชำระเงิน
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
