"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/store/cart-context";
import { formatCurrency } from "@/lib/utils/format";

interface OrderResult {
  orderNumber: string;
  total: number;
}

interface SavedAddress {
  _id?: string;
  type?: string;
  isDefault?: boolean;
  fullName: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyShippingAddress = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "TH",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [shippingAddress, setShippingAddress] = useState(emptyShippingAddress);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const totals = useMemo(() => {
    const shipping = totalPrice > 50 || totalPrice === 0 ? 0 : 9.99;
    const tax = totalPrice * 0.08;
    return {
      shipping,
      tax,
      total: totalPrice + shipping + tax,
    };
  }, [totalPrice]);

  const applySavedAddress = (address: SavedAddress) => {
    setShippingAddress({
      fullName: address.fullName || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "TH",
    });
  };

  useEffect(() => {
    const fetchCheckoutProfile = async () => {
      let hasAuthenticatedSession = false;

      try {
        const authResponse = await fetch("/api/storefront/auth/me");
        const authData = await authResponse.json();

        if (!authData.user) {
          router.replace("/login?redirect=/checkout");
          return;
        }

        hasAuthenticatedSession = true;
        setIsAuthenticated(true);

        const response = await fetch("/api/storefront/profile");

        if (response.status === 401) {
          router.replace("/login?redirect=/checkout");
          return;
        }

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const addresses: SavedAddress[] = Array.isArray(data.user?.addresses) ? data.user.addresses : [];
        const shippingAddresses = addresses.filter((address) => !address.type || address.type === "shipping");
        const availableAddresses = shippingAddresses.length > 0 ? shippingAddresses : addresses;
        const preferredAddress =
          availableAddresses.find((address) => address.isDefault) || availableAddresses[0];

        setSavedAddresses(availableAddresses);

        if (preferredAddress) {
          setSelectedAddressId(preferredAddress._id || preferredAddress.address);
          applySavedAddress(preferredAddress);
        } else if (data.user) {
          setShippingAddress((current) => ({
            ...current,
            fullName: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
            phone: data.user.phone || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load saved checkout address", err);
        if (!hasAuthenticatedSession) {
          router.replace("/login?redirect=/checkout");
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    fetchCheckoutProfile();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setIsSubmitting(true);

    const fullName = shippingAddress.fullName.trim();
    const phone = shippingAddress.phone.trim();
    const address = shippingAddress.address.trim();
    const city = shippingAddress.city.trim();
    const state = shippingAddress.state.trim();
    const postalCode = shippingAddress.postalCode.trim();
    const country = shippingAddress.country.trim();
    const formData = new FormData(event.currentTarget);
    const paymentMethod = String(formData.get("paymentMethod") || "cod");
    const notes = String(formData.get("notes") || "").trim();

    if (!fullName || !phone || !address || !city || !state || !postalCode || !country) {
      setError("กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            variant: item.variant,
          })),
          paymentMethod,
          notes,
          shippingAddress: {
            fullName,
            phone,
            address,
            city,
            state,
            postalCode,
            country,
          },
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "สั่งซื้อไม่สำเร็จ");
      }

      clearCart();
      setOrderResult({
        orderNumber: data.order.orderNumber,
        total: data.order.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "สั่งซื้อไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-xl">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
            <h1 className="text-2xl font-bold">สั่งซื้อสำเร็จ</h1>
            <p className="mt-2 text-muted-foreground">หมายเลขคำสั่งซื้อ {orderResult.orderNumber}</p>
            <p className="mt-1 font-semibold">{formatCurrency(orderResult.total)}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/products">เลือกซื้อสินค้าต่อ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">ดูบัญชีของฉัน</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-2 text-xl font-semibold">ไม่มีสินค้าในตะกร้า</h1>
            <p className="mb-6 text-muted-foreground">เพิ่มสินค้าก่อนดำเนินการสั่งซื้อ</p>
            <Button asChild>
              <Link href="/products">เลือกซื้อสินค้า</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปตะกร้า
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">ชำระเงินและสั่งซื้อ</h1>
        <p className="mt-2 text-muted-foreground">กรอกข้อมูลจัดส่งเพื่อสร้างคำสั่งซื้อ</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                ที่อยู่จัดส่ง
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {savedAddresses.length > 0 && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="savedAddress">ที่อยู่ที่บันทึกไว้</Label>
                  <select
                    id="savedAddress"
                    value={selectedAddressId}
                    onChange={(event) => {
                      const address = savedAddresses.find(
                        (item) => (item._id || item.address) === event.target.value
                      );
                      setSelectedAddressId(event.target.value);
                      if (address) applySavedAddress(address);
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {savedAddresses.map((address) => (
                      <option key={address._id || address.address} value={address._id || address.address}>
                        {address.fullName} - {address.address}, {address.state}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">ชื่อผู้รับ</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, fullName: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, phone: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, address: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">อำเภอ/เขต</Label>
                <Input
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, city: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">จังหวัด</Label>
                <Input
                  id="state"
                  name="state"
                  value={shippingAddress.state}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, state: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, postalCode: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">ประเทศ</Label>
                <Input
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, country: event.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                วิธีชำระเงิน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-4">
                <input type="radio" name="paymentMethod" value="cod" defaultChecked />
                <span>
                  <span className="block font-medium">เก็บเงินปลายทาง</span>
                  <span className="text-sm text-muted-foreground">ชำระเงินเมื่อได้รับสินค้า</span>
                </span>
              </label>
              <div className="space-y-2">
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea id="notes" name="notes" placeholder="รายละเอียดเพิ่มเติมสำหรับร้านค้า" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">จำนวน {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ค่าจัดส่ง</span>
                  <span>{totals.shipping === 0 ? "ฟรี" : formatCurrency(totals.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ภาษี</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>ยอดรวมทั้งหมด</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ยืนยันคำสั่งซื้อ
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
