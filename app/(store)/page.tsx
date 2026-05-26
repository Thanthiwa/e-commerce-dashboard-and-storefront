import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";

// Demo data
const featuredProducts = [
  { id: "1", name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", price: 99.99, compareAtPrice: 129.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics", badge: "Sale" },
  { id: "2", name: "Smart Fitness Watch", slug: "smart-fitness-watch", price: 199.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics", badge: "New" },
  { id: "3", name: "Premium Cotton T-Shirt", slug: "premium-cotton-tshirt", price: 29.99, image: "/placeholder.svg?height=300&width=300", category: "Clothing" },
  { id: "4", name: "Running Sneakers Pro", slug: "running-sneakers-pro", price: 129.99, compareAtPrice: 149.99, image: "/placeholder.svg?height=300&width=300", category: "Sports", badge: "Sale" },
];

const categories = [
  { name: "Electronics", slug: "electronics", image: "/placeholder.svg?height=200&width=300", count: 45 },
  { name: "Clothing", slug: "clothing", image: "/placeholder.svg?height=200&width=300", count: 120 },
  { name: "Home & Garden", slug: "home-garden", image: "/placeholder.svg?height=200&width=300", count: 67 },
  { name: "Sports", slug: "sports", image: "/placeholder.svg?height=200&width=300", count: 34 },
];

const features = [
  { icon: Truck, title: "Free Shipping", description: "On orders over $50" },
  { icon: Shield, title: "Secure Payment", description: "100% secure checkout" },
  { icon: RotateCcw, title: "Easy Returns", description: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", description: "Dedicated support team" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-2xl">
            <Badge className="mb-4">New Collection Available</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">Discover Quality Products for Every Need</h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">Shop the latest trends with confidence. Quality products, great prices, and exceptional customer service.</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products?sale=true">View Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked items just for you</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-muted-foreground">Browse our wide selection of categories</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`} className="group">
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-[3/2] bg-muted">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} products</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 lg:p-12">
            <div>
              <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
              <p className="text-primary-foreground/80">Get the latest updates on new products and upcoming sales.</p>
            </div>
            <div className="flex w-full lg:w-auto gap-2">
              <input type="email" placeholder="Enter your email" className="flex-1 lg:w-64 px-4 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30" />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
