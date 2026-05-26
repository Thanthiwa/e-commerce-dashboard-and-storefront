"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProductCard } from "@/components/store/product-card";
import { formatCurrency } from "@/lib/utils/format";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface StoreProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  status?: string;
  quantity: number;
  tags?: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

function FilterSidebar({
  categories,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
}: {
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">หมวดหมู่</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center space-x-2">
              <Checkbox
                id={category._id}
                checked={selectedCategories.includes(category._id)}
                onCheckedChange={() => toggleCategory(category._id)}
              />
              <Label htmlFor={category._id} className="text-sm font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">ช่วงราคา</h3>
        <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={10} className="mb-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setPriceRange([0, 10000]);
        }}
      >
        <X className="mr-2 h-4 w-4" />
        ล้างตัวกรอง
      </Button>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/products?limit=100");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "โหลดสินค้าไม่สำเร็จ");
        }

        const mappedProducts: StoreProduct[] = (data.products || []).map((product: any) => ({
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: Array.isArray(product.images) && product.images.length ? product.images : ["/placeholder.svg?height=300&width=300"],
          category: typeof product.category === "object" ? product.category.name : product.category || "ไม่ระบุหมวดหมู่",
          categoryId: typeof product.category === "object" ? product.category._id : product.category || "",
          status: product.status,
          quantity: product.quantity ?? 0,
          tags: product.tags || [],
        }));

        setProducts(mappedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "โหลดสินค้าไม่สำเร็จ");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("โหลดหมวดหมู่ไม่สำเร็จ", err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.categoryId);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesCategory && matchesPrice;
    });
  }, [products, selectedCategories, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">สินค้าทั้งหมด</h1>
        <p className="text-muted-foreground">เรียกดูคอลเลกชันสินค้าคุณภาพของเรา</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <FilterSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    ตัวกรอง
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>ตัวกรอง</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      categories={categories}
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <span className="text-sm text-muted-foreground">{sortedProducts.length} ชิ้น</span>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="จัดเรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">สินค้าแนะนำ</SelectItem>
                <SelectItem value="price-asc">ราคาต่ำไปสูง</SelectItem>
                <SelectItem value="price-desc">ราคาสูงไปต่ำ</SelectItem>
                <SelectItem value="name">ชื่อสินค้า</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-20 text-center text-muted-foreground">กำลังโหลดสินค้า...</CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-20 text-center text-destructive">{error}</CardContent>
            </Card>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    id: product._id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    image: product.images[0],
                    category: product.category,
                    badge: product.status === "active" ? undefined : product.status === "draft" ? "ฉบับร่าง" : "เก็บถาวร",
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground mb-4">ไม่พบสินค้าที่ตรงกับตัวกรอง</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, 10000]);
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
