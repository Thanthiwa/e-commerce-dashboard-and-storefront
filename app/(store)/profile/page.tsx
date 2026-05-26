"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, CheckCircle2, Clock, Loader2, MapPin, Package, Plus, Truck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface StorefrontOrder {
  _id: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number; variant?: string }>;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentSlipUrl?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreNotification {
  id: string;
  orderNumber: string;
  status: string;
  title: string;
  message: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังเตรียมสินค้า",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งถึงแล้ว",
  cancelled: "ยกเลิกแล้ว",
  refunded: "คืนเงินแล้ว",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700",
  processing: "bg-blue-500/10 text-blue-700",
  shipped: "bg-purple-500/10 text-purple-700",
  delivered: "bg-emerald-500/10 text-emerald-700",
  cancelled: "bg-red-500/10 text-red-700",
  refunded: "bg-gray-500/10 text-gray-700",
};

const paymentMethodLabels: Record<string, string> = {
  cod: "เก็บเงินปลายทาง",
  qr_code: "QR Code",
  stripe_promptpay: "Stripe PromptPay",
  credit_card: "บัตรเครดิต",
  paypal: "PayPal",
  stripe: "Stripe",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(value);
}

function getStatusIcon(status: string) {
  if (status === "shipped") return <Truck className="h-4 w-4" />;
  if (status === "delivered") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "processing") return <Package className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState("");
  const [orders, setOrders] = useState<StorefrontOrder[]>([]);
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Dialog State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
  });

  const [addressData, setAddressData] = useState({
    type: "shipping",
    isDefault: false,
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "TH",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/storefront/profile");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setFormData({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        phone: data.user.phone || "",
        avatar: data.user.avatar || "",
      });
      fetchOrders();
    } catch (err) {
      setError("โหลดโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);

    try {
      const res = await fetch("/api/storefront/orders/me", { cache: "no-store" });
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (err) {
      console.error("โหลดคำสั่งซื้อไม่สำเร็จ", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/storefront/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "อัปเดตโปรไฟล์ไม่สำเร็จ");
        return;
      }
      
      setUser(data.user);
      setSuccess("อัปเดตโปรไฟล์เรียบร้อยแล้ว");
    } catch (err) {
      setError("เกิดข้อผิดพลาดระหว่างอัปเดตโปรไฟล์");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUploadError("");
    setAvatarUploadSuccess("");

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarUploadError("กรุณาอัปโหลดไฟล์ภาพที่ถูกต้อง");
      return;
    }

    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAvatarUploadError(data.error || "อัปโหลดรูปไม่สำเร็จ");
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: data.url }));
      setAvatarUploadSuccess("อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว");
    } catch (err) {
      setAvatarUploadError("อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    setAddressSaving(true);

    try {
      const res = await fetch("/api/storefront/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddressError(data.error || "ไม่สามารถเพิ่มที่อยู่ได้");
        return;
      }

      setUser({ ...user, addresses: data.addresses });
      setIsAddressModalOpen(false);
      setAddressData({
        type: "shipping",
        isDefault: false,
        fullName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "TH",
        phone: "",
      });
    } catch (err) {
      setAddressError("เกิดข้อผิดพลาดระหว่างบันทึกที่อยู่");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบที่อยู่นี้?")) return;
    
    try {
      const res = await fetch(`/api/storefront/profile/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, addresses: data.addresses });
      }
    } catch (error) {
      console.error("ไม่สามารถลบที่อยู่ได้", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8 flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar || ""} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[560px]">
          <TabsTrigger value="general">ข้อมูลทั่วไป</TabsTrigger>
          <TabsTrigger value="addresses">ที่อยู่</TabsTrigger>
          <TabsTrigger value="orders">คำสั่งซื้อ</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>แก้ไขข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert className="bg-emerald-50 text-emerald-600 border-emerald-200"><AlertDescription>{success}</AlertDescription></Alert>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">ชื่อ</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">นามสกุล</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล (ไม่สามารถแก้ไขได้)</Label>
                  <Input id="email" value={user.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="081-234-5678" />
                </div>

                

                <div className="space-y-2">
                  <Label htmlFor="avatarFile">อัปโหลดรูปโปรไฟล์</Label>
                  <Input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                  />
                  {avatarUploadError && (
                    <Alert variant="destructive">
                      <AlertDescription>{avatarUploadError}</AlertDescription>
                    </Alert>
                  )}
                  {avatarUploadSuccess && (
                    <Alert className="bg-emerald-50 text-emerald-600 border-emerald-200">
                      <AlertDescription>{avatarUploadSuccess}</AlertDescription>
                    </Alert>
                  )}
                  {avatarUploading && (
                    <p className="text-sm text-muted-foreground">กำลังอัปโหลดรูปโปรไฟล์...</p>
                  )}
                </div>

                <Button type="submit" disabled={saving || user.id === "demo-customer-id"}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "บันทึกการเปลี่ยนแปลง"}
                </Button>
                {user.id === "demo-customer-id" && (
                  <p className="text-sm text-amber-600 mt-2">ผู้ใช้ตัวอย่างไม่สามารถแก้ไขโปรไฟล์ได้</p>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>ที่อยู่ของฉัน</CardTitle>
                <CardDescription>จัดการที่อยู่จัดส่งและใบกำกับสินค้า</CardDescription>
              </div>
              <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                <DialogTrigger asChild>
                  <Button disabled={user.id === "demo-customer-id"}>
                    <Plus className="h-4 w-4 mr-2" /> เพิ่มที่อยู่
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>เพิ่มที่อยู่ใหม่</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddressSubmit} className="space-y-4 py-4">
                    {addressError && <Alert variant="destructive"><AlertDescription>{addressError}</AlertDescription></Alert>}
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                      <Input id="fullName" required value={addressData.fullName} onChange={(e) => setAddressData({...addressData, fullName: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">ที่อยู่ (ถนน, ตึก, ห้อง)</Label>
                      <Input id="address" required value={addressData.address} onChange={(e) => setAddressData({...addressData, address: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">เมือง</Label>
                        <Input id="city" required value={addressData.city} onChange={(e) => setAddressData({...addressData, city: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">จังหวัด</Label>
                        <Input id="state" required value={addressData.state} onChange={(e) => setAddressData({...addressData, state: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                        <Input id="postalCode" required value={addressData.postalCode} onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">ประเทศ</Label>
                        <Input id="country" required value={addressData.country} onChange={(e) => setAddressData({...addressData, country: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressPhone">โทรศัพท์ (ไม่บังคับ)</Label>
                      <Input id="addressPhone" value={addressData.phone} onChange={(e) => setAddressData({...addressData, phone: e.target.value})} />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={addressSaving}>
                        {addressSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        บันทึกที่อยู่
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {user.id === "demo-customer-id" && (
                <Alert className="mb-4 bg-amber-50 text-amber-600 border-amber-200">
                  <AlertDescription>ผู้ใช้ตัวอย่างไม่สามารถแก้ไขที่อยู่ได้</AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                {user.addresses?.map((address: any) => (
                  <Card key={address._id || address.address} className="relative overflow-hidden">
                    {address.isDefault && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-medium">
                        เริ่มต้น
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-muted-foreground">{address.address}</p>
                          <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.postalCode}</p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                          {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-600" disabled={user.id === "demo-customer-id"} onClick={() => handleDeleteAddress(address._id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> ลบ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(!user.addresses || user.addresses.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    ยังไม่มีที่อยู่ที่บันทึกไว้
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  การแจ้งเตือน
                </CardTitle>
                <CardDescription>อัปเดตล่าสุดเกี่ยวกับคำสั่งซื้อของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex gap-3 rounded-md border p-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          {getStatusIcon(notification.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{notification.title}</p>
                            <Badge variant="secondary" className={statusStyles[notification.status]}>
                              {statusLabels[notification.status] || notification.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-muted-foreground">ยังไม่มีการแจ้งเตือนคำสั่งซื้อ</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>สถานะสินค้าที่สั่งซื้อ</CardTitle>
                  <CardDescription>ติดตามสถานะ เลขพัสดุ และรายการสินค้าของแต่ละคำสั่งซื้อ</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchOrders} disabled={ordersLoading}>
                  {ordersLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  รีเฟรช
                </Button>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังโหลดคำสั่งซื้อ...
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order._id}>
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                            </div>
                            <Badge variant="secondary" className={statusStyles[order.status]}>
                              {statusLabels[order.status] || order.status}
                            </Badge>
                          </div>

                          <Separator className="my-4" />

                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={`${order._id}-${index}`} className="flex justify-between gap-3 text-sm">
                                <span className="min-w-0 truncate">
                                  {item.name}
                                  {item.variant ? ` (${item.variant})` : ""}
                                  <span className="text-muted-foreground"> x {item.quantity}</span>
                                </span>
                                <span className="font-medium">{formatMoney(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          <Separator className="my-4" />

                          <div className="grid gap-2 text-sm sm:grid-cols-3">
                            <div>
                              <p className="text-muted-foreground">ยอดรวม</p>
                              <p className="font-semibold">{formatMoney(order.total)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">การชำระเงิน</p>
                              <p className="font-medium">{order.paymentStatus === "paid" ? "ชำระแล้ว" : "รอชำระ/ตรวจสอบ"}</p>
                              <p className="text-xs text-muted-foreground">
                                {paymentMethodLabels[order.paymentMethod || ""] || order.paymentMethod || "-"}
                              </p>
                              {order.paymentReference && (
                                <p className="font-mono text-xs text-muted-foreground">{order.paymentReference}</p>
                              )}
                              {order.paymentSlipUrl && (
                                <a
                                  href={order.paymentSlipUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  ดูสลิป
                                </a>
                              )}
                            </div>
                            <div>
                              <p className="text-muted-foreground">เลขพัสดุ</p>
                              <p className="font-mono font-medium">{order.trackingNumber || "-"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">ยังไม่มีคำสั่งซื้อ</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
