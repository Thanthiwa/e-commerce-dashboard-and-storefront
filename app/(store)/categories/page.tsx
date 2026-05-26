import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Grid3X3, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { connectDB } from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import Product from "@/lib/db/models/Product";

export const dynamic = "force-dynamic";

async function getCategoriesData() {
  await connectDB();

  const categories = await Category.find({ status: "active" })
    .sort({ name: 1 })
    .lean();

  const categoryIds = categories.map((category) => category._id);
  const summaries = await Product.aggregate([
    { $match: { status: "active", category: { $in: categoryIds } } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        image: { $first: { $first: "$images" } },
      },
    },
  ]);

  const summaryByCategory = new Map(
    summaries.map((summary) => [
      String(summary._id),
      {
        count: Number(summary.count || 0),
        image: typeof summary.image === "string" ? summary.image : undefined,
      },
    ])
  );

  return categories.map((category) => {
    const summary = summaryByCategory.get(String(category._id));

    return {
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image || summary?.image,
      count: summary?.count || 0,
    };
  });
}

export default async function CategoriesPage() {
  const categories = await getCategoriesData();
  const totalProducts = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Grid3X3 className="h-4 w-4" />
            หมวดหมู่สินค้า
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">เลือกซื้อสินค้าตามหมวดหมู่</h1>
          <p className="mt-3 text-muted-foreground">
            สำรวจหมวดหมู่ทั้งหมดจากฐานข้อมูล และเลือกดูสินค้าที่ตรงกับความต้องการ
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-auto">
          <div className="rounded-md border bg-card px-4 py-3">
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-sm text-muted-foreground">หมวดหมู่</p>
          </div>
          <div className="rounded-md border bg-card px-4 py-3">
            <p className="text-2xl font-bold">{totalProducts}</p>
            <p className="text-sm text-muted-foreground">สินค้า</p>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
              <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-[4/3] bg-muted">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">{category.count} รายการ</p>
                  </div>
                </div>
                <CardContent className="space-y-4 p-4">
                  {category.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
                  ) : (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      ดูสินค้าทั้งหมดในหมวดหมู่นี้
                    </p>
                  )}
                  <div className="flex items-center text-sm font-medium text-primary">
                    ดูสินค้า
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">ยังไม่มีหมวดหมู่ที่เปิดใช้งาน</h2>
            <p className="mt-2 text-muted-foreground">เพิ่มหรือเปิดใช้งานหมวดหมู่จากหน้าแอดมินก่อน</p>
            <Button className="mt-6" asChild>
              <Link href="/products">ดูสินค้าทั้งหมด</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
