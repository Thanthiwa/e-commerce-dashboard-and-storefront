"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Store, Search, ShoppingCart, Menu, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า" },
  { href: "/categories", label: "หมวดหมู่" },
];

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
  processing: "กำลังเตรียม",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งถึงแล้ว",
  cancelled: "ยกเลิกแล้ว",
  refunded: "คืนเงินแล้ว",
};

function getNotificationKey(notification: StoreNotification) {
  return `${notification.id}:${notification.status}:${notification.createdAt}`;
}

function getReadNotificationStorageKey(userEmail?: string) {
  return `storefront-read-notifications:${userEmail || "guest"}`;
}

export function StoreHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const getReadNotificationKeys = () => {
    if (typeof window === "undefined") {
      return new Set<string>();
    }

    try {
      const saved = localStorage.getItem(getReadNotificationStorageKey(user?.email));
      return new Set<string>(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set<string>();
    }
  };

  const saveReadNotificationKeys = (keys: Set<string>) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(getReadNotificationStorageKey(user?.email), JSON.stringify([...keys]));
  };

  const markNotificationAsRead = (notification: StoreNotification) => {
    const readKeys = getReadNotificationKeys();
    readKeys.add(getNotificationKey(notification));
    saveReadNotificationKeys(readKeys);
    setNotifications((current) =>
      current.filter((item) => getNotificationKey(item) !== getNotificationKey(notification))
    );
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/storefront/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname]); // Re-fetch when pathname changes (e.g. after login)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        const res = await fetch("/api/storefront/orders/me", { cache: "no-store" });
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        const readKeys = getReadNotificationKeys();
        const nextNotifications = Array.isArray(data.notifications) ? data.notifications : [];
        setNotifications(
          nextNotifications.filter((notification: StoreNotification) => !readKeys.has(getNotificationKey(notification)))
        );
      } catch (error) {
        console.error("โหลดการแจ้งเตือนไม่สำเร็จ", error);
      }
    };

    fetchNotifications();
  }, [user, pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/storefront/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("ออกจากระบบไม่สำเร็จ", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">เปิดเมนู</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>เมนู</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={cn("text-lg font-medium transition-colors hover:text-primary", pathname === link.href ? "text-primary" : "text-muted-foreground")}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold hidden sm:inline-block">ร้านคอมเมิร์ซ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === link.href ? "text-foreground" : "text-muted-foreground")}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="ค้นหาสินค้า..." className="w-64 pl-10 bg-muted/50 border-0" />
              </div>
            </div>

            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">ค้นหา</span>
            </Button>

            {/* Account */}
            {!loading && (
              user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                            {notifications.length}
                          </span>
                        )}
                        <span className="sr-only">การแจ้งเตือน</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>การแจ้งเตือน</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <DropdownMenuItem key={notification.id} asChild>
                            <Link
                              href="/profile"
                              className="flex cursor-pointer flex-col items-start gap-1"
                              onClick={() => markNotificationAsRead(notification)}
                            >
                              <span className="text-sm font-medium">{notification.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {notification.orderNumber} · {statusLabels[notification.status] || notification.status}
                              </span>
                              <span className="text-xs text-muted-foreground">{notification.message}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>ยังไม่มีการแจ้งเตือน</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 px-2">
                        <User className="h-5 w-5" />
                        <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4" />
                          <span>ตั้งค่าโปรไฟล์</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        <span>ออกจากระบบ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/login">
                    <User className="h-5 w-5" />
                    <span className="sr-only">บัญชี</span>
                  </Link>
                </Button>
              )
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">ตะกร้าสินค้า</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
