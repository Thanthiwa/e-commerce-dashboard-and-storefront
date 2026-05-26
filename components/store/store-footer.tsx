import Link from "next/link";
import { Store } from "lucide-react";

const footerLinks = {
  shop: [
    { href: "/products", label: "สินค้าทั้งหมด" },
    { href: "/products?category=electronics", label: "อิเล็กทรอนิกส์" },
    { href: "/products?category=clothing", label: "เสื้อผ้า" },
    { href: "/products?category=home-garden", label: "บ้านและสวน" },
  ],
  support: [
    { href: "/contact", label: "ติดต่อเรา" },
    { href: "/faq", label: "คำถามที่พบบ่อย" },
    { href: "/shipping", label: "ข้อมูลการจัดส่ง" },
    { href: "/returns", label: "การคืนสินค้า" },
  ],
  company: [
    { href: "/about", label: "เกี่ยวกับเรา" },
    { href: "/careers", label: "ร่วมงานกับเรา" },
    { href: "/blog", label: "บทความ" },
    { href: "/press", label: "ข่าวประชาสัมพันธ์" },
  ],
  legal: [
    { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
    { href: "/terms", label: "เงื่อนไขการใช้บริการ" },
    { href: "/cookies", label: "นโยบายคุกกี้" },
  ],
};

export function StoreFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold">ร้านคอมเมิร์ซ</span>
            </Link>
            <p className="text-sm text-muted-foreground">แหล่งรวมสินค้าคุณภาพในราคาคุ้มค่า ครบจบในที่เดียว</p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">ช้อปปิ้ง</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">บริษัท</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">กฎหมาย</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} ร้านคอมเมิร์ซ สงวนลิขสิทธิ์</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">ขับเคลื่อนด้วย Next.js และ MongoDB</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
