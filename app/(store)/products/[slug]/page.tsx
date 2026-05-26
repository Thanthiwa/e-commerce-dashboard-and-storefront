"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Heart, Share2, Truck, RotateCcw, Shield, Minus, Plus, Star, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";

// Demo product data
const product = {
  id: "1",
  name: "Wireless Bluetooth Headphones Pro",
  slug: "wireless-bluetooth-headphones-pro",
  description: "Experience premium audio quality with our Wireless Bluetooth Headphones Pro. Featuring active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions. Perfect for music lovers, gamers, and professionals who demand the best in wireless audio technology.",
  price: 99.99,
  compareAtPrice: 129.99,
  sku: "WBH-001",
  category: "Electronics",
  tags: ["headphones", "wireless", "bluetooth", "audio"],
  images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
  variants: [
    { name: "Color", options: ["Black", "White", "Navy Blue"] },
    { name: "Size", options: ["Standard", "Compact"] },
  ],
  features: ["Active Noise Cancellation", "40-Hour Battery Life", "Bluetooth 5.3", "Memory Foam Cushions", "Built-in Microphone", "Touch Controls", "Fast Charging (10 min = 3 hours)", "Foldable Design"],
  specifications: {
    "Driver Size": "40mm",
    "Frequency Response": "20Hz - 20kHz",
    "Impedance": "32 Ohm",
    Battery: "1000mAh Li-Po",
    "Charging Time": "2 hours",
    Weight: "250g",
    "Bluetooth Version": "5.3",
    "Codec Support": "AAC, SBC, LDAC",
  },
  rating: 4.7,
  reviewCount: 234,
  stock: 42,
};

const relatedProducts = [
  { id: "5", name: "Portable Power Bank 20000mAh", slug: "portable-power-bank", price: 49.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics" },
  { id: "6", name: "USB-C Hub Multiport Adapter", slug: "usb-c-hub", price: 59.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics" },
  { id: "7", name: "Mechanical Gaming Keyboard", slug: "mechanical-gaming-keyboard", price: 109.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics" },
  { id: "2", name: "Smart Fitness Watch", slug: "smart-fitness-watch", price: 199.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics", badge: "New" },
];

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/products?category=${product.category.toLowerCase()}`} className="hover:text-foreground">
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
            {discount > 0 && <Badge className="absolute top-4 left-4 bg-red-500 text-white">-{discount}%</Badge>}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button key={index} onClick={() => setSelectedImage(index)} className={`relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground/50"}`}>
                <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && <span className="text-xl text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>}
              {discount > 0 && <Badge variant="destructive">Save {discount}%</Badge>}
            </div>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Variants */}
          {product.variants.map((variant) => (
            <div key={variant.name}>
              <label className="text-sm font-medium mb-2 block">{variant.name}</label>
              <Select value={selectedVariants[variant.name]} onValueChange={(value) => setSelectedVariants({ ...selectedVariants, [variant.name]: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${variant.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {variant.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="features" className="mt-16">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <ul className="grid md:grid-cols-2 gap-3">
                {product.features.map((feature) => (
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
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Reviews coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
