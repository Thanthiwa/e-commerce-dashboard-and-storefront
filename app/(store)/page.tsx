import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";

const featuredProducts = [
  { id: "1", name: "หูฟังบลูทูธไร้สาย", slug: "wireless-bluetooth-headphones", price: 99.99, compareAtPrice: 129.99, image: "/placeholder.svg?height=300&width=300", category: "อิเล็กทรอนิกส์", badge: "ลดราคา" },
  { id: "2", name: "สมาร์ตวอทช์ฟิตเนส", slug: "smart-fitness-watch", price: 199.99, image: "/placeholder.svg?height=300&width=300", category: "อิเล็กทรอนิกส์", badge: "ใหม่" },
  { id: "3", name: "เสื้อยืดคอตตอนพรีเมียม", slug: "premium-cotton-tshirt", price: 29.99, image: "/placeholder.svg?height=300&width=300", category: "เสื้อผ้า" },
  { id: "4", name: "รองเท้าวิ่งโปร", slug: "running-sneakers-pro", price: 129.99, compareAtPrice: 149.99, image: "/placeholder.svg?height=300&width=300", category: "กีฬา", badge: "ลดราคา" },
];

const categories = [
  { name: "อิเล็กทรอนิกส์", slug: "electronics", image: "/placeholder.svg?height=200&width=300", count: 45 },
  { name: "เสื้อผ้า", slug: "clothing", image: "/placeholder.svg?height=200&width=300", count: 120 },
  { name: "บ้านและสวน", slug: "home-garden", image: "/placeholder.svg?height=200&width=300", count: 67 },
  { name: "กีฬา", slug: "sports", image: "/placeholder.svg?height=200&width=300", count: 34 },
];

const features = [
  { icon: Truck, title: "จัดส่งฟรี", description: "เมื่อสั่งซื้อเกิน ฿50" },
  { icon: Shield, title: "ชำระเงินปลอดภัย", description: "ระบบชำระเงินปลอดภัย 100%" },
  { icon: RotateCcw, title: "คืนสินค้าง่าย", description: "คืนสินค้าได้ภายใน 30 วัน" },
  { icon: Headphones, title: "ช่วยเหลือ 24/7", description: "ทีมงานพร้อมดูแลทุกวัน" },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-2xl">
            <Badge className="mb-4">คอลเลกชันใหม่พร้อมให้เลือกแล้ว</Badge>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight lg:text-6xl">ค้นพบสินค้าคุณภาพสำหรับทุกความต้องการ</h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground">ช้อปเทรนด์ล่าสุดอย่างมั่นใจ ด้วยสินค้าคุณภาพ ราคาคุ้มค่า และบริการที่ใส่ใจ</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/products">
                  ช้อปเลย
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products?sale=true">ดูสินค้าลดราคา</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">สินค้าแนะนำ</h2>
            <p className="text-muted-foreground">คัดสรรรายการเด่นมาให้คุณ</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">
              ดูทั้งหมด
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">เลือกซื้อตามหมวดหมู่</h2>
            <p className="text-muted-foreground">สำรวจหมวดหมู่สินค้าหลากหลายของเรา</p>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`} className="group">
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-[3/2] bg-muted">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} รายการ</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center justify-between gap-6 p-8 lg:flex-row lg:p-12">
            <div>
              <h2 className="mb-2 text-2xl font-bold">สมัครรับข่าวสารจากเรา</h2>
              <p className="text-primary-foreground/80">รับอัปเดตสินค้าใหม่และโปรโมชันก่อนใคร</p>
            </div>
            <div className="flex w-full gap-2 lg:w-auto">
              <input type="email" placeholder="กรอกอีเมลของคุณ" className="flex-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 lg:w-64" />
              <Button variant="secondary">สมัครรับข่าวสาร</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
