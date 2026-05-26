"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/format";
import { ShoppingCart, Heart, Share2, Truck, RotateCcw, Shield, Minus, Plus, Star, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { useParams } from "next/navigation";

const placeholderImage = "/placeholder.svg?height=600&width=600";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "ไม่พบสินค้า");
        }

        const productData = {
          ...data,
          images: Array.isArray(data.images) && data.images.length ? data.images : [placeholderImage],
          category: typeof data.category === "object" ? data.category : { name: data.category || "ไม่ระบุหมวดหมู่", slug: "" },
          stock: data.quantity ?? 0,
          features:
            data.features?.length > 0
              ? data.features
              : Object.entries(data.specifications || {}).slice(0, 6).map(([key, value]) => `${key}: ${value}`),
          rating: data.rating ?? 4.5,
          reviewCount: data.reviewCount ?? data.metadata?.purchases ?? 0,
          compareAtPrice: data.compareAtPrice,
        };

        setProduct(productData);
        setSelectedVariants(
          (productData.variants || []).reduce((acc: Record<string, string>, variant: any) => {
            if (variant.options?.length) {
              acc[variant.name] = variant.options[0];
            }
            return acc;
          }, {})
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "โหลดสินค้าไม่สำเร็จ");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (!product?.category?.slug) {
      return;
    }

    const fetchRelated = async () => {
      try {
        const res = await fetch(`/api/products?category=${product.category.slug}&limit=4`);
        const data = await res.json();
        if (res.ok) {
          setRelatedProducts(
            (data.products || [])
              .filter((item: any) => item.slug !== product.slug)
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error("โหลดสินค้าที่เกี่ยวข้องไม่สำเร็จ", err);
      }
    };

    fetchRelated();
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลดสินค้า...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-destructive">{error || "ไม่พบสินค้า"}</p>
      </div>
    );
  }

  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          หน้าแรก
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground">
          สินค้า
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/products?category=${product.category.slug || product.category.name?.toLowerCase()}`} className="hover:text-foreground">
          {product.category.name || product.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
            {discount > 0 && <Badge className="absolute top-4 left-4 bg-red-500 text-white">-{discount}%</Badge>}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image: string, index: number) => (
              <button
                key={index}
                type="button"
                aria-label={`ดูรูปภาพที่ ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.category.name || product.category}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
              {product.compareAtPrice && <span className="text-xl text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>}
              {discount > 0 && <Badge variant="destructive">ประหยัด {discount}%</Badge>}
            </div>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {(product.variants || []).map((variant: any) => (
            <div key={variant.name}>
              <label className="text-sm font-medium mb-2 block">{variant.name}</label>
              <Select value={selectedVariants[variant.name] || ""} onValueChange={(value) => setSelectedVariants({ ...selectedVariants, [variant.name]: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`เลือก${variant.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {(variant.options || []).map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div>
            <label className="text-sm font-medium mb-2 block">จำนวน</label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{product.stock} รายการในสต็อก</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              <ShoppingCart className="mr-2 h-5 w-5" />
              เพิ่มในตะกร้า
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span>จัดส่งฟรี</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span>คืนสินค้าได้ภายใน 30 วัน</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span>รับประกัน 2 ปี</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="features" className="mt-16">
        <TabsList>
          <TabsTrigger value="features">คุณสมบัติ</TabsTrigger>
          <TabsTrigger value="specifications">สเปก</TabsTrigger>
          <TabsTrigger value="reviews">รีวิว ({product.reviewCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <ul className="grid md:grid-cols-2 gap-3">
                {(product.features || []).map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <dl className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">รีวิวจะพร้อมให้ดูเร็ว ๆ นี้</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">สินค้าที่คุณอาจชอบ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={{
                  id: relatedProduct._id,
                  name: relatedProduct.name,
                  slug: relatedProduct.slug,
                  price: relatedProduct.price,
                  image: relatedProduct.images?.[0] || placeholderImage,
                  category: typeof relatedProduct.category === "object" ? relatedProduct.category.name : relatedProduct.category,
                }}
              />
            ))
          ) : (
            <p className="text-muted-foreground">ไม่พบสินค้าที่เกี่ยวข้อง</p>
          )}
        </div>
      </section>
    </div>
  );
}
