"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProductCard } from "@/components/store/product-card";
import { SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Demo data
const allProducts = [
  { id: "1", name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", price: 99.99, compareAtPrice: 129.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics", badge: "Sale" },
  { id: "2", name: "Smart Fitness Watch", slug: "smart-fitness-watch", price: 199.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics", badge: "New" },
  { id: "3", name: "Premium Cotton T-Shirt", slug: "premium-cotton-tshirt", price: 29.99, image: "/placeholder.svg?height=300&width=300", category: "Clothing" },
  { id: "4", name: "Running Sneakers Pro", slug: "running-sneakers-pro", price: 129.99, compareAtPrice: 149.99, image: "/placeholder.svg?height=300&width=300", category: "Sports", badge: "Sale" },
  { id: "5", name: "Portable Power Bank 20000mAh", slug: "portable-power-bank", price: 49.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics" },
  { id: "6", name: "USB-C Hub Multiport Adapter", slug: "usb-c-hub", price: 59.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics" },
  { id: "7", name: "Mechanical Gaming Keyboard", slug: "mechanical-gaming-keyboard", price: 109.99, image: "/placeholder.svg?height=300&width=300", category: "Electronics" },
  { id: "8", name: "Yoga Mat Premium", slug: "yoga-mat-premium", price: 39.99, image: "/placeholder.svg?height=300&width=300", category: "Sports" },
  { id: "9", name: "LED Desk Lamp", slug: "led-desk-lamp", price: 44.99, image: "/placeholder.svg?height=300&width=300", category: "Home & Garden" },
  { id: "10", name: "Organic Coffee Beans 1kg", slug: "organic-coffee-beans", price: 24.99, image: "/placeholder.svg?height=300&width=300", category: "Food" },
  { id: "11", name: "Denim Jacket Classic", slug: "denim-jacket-classic", price: 89.99, image: "/placeholder.svg?height=300&width=300", category: "Clothing" },
  { id: "12", name: "Gardening Tool Set", slug: "gardening-tool-set", price: 34.99, image: "/placeholder.svg?height=300&width=300", category: "Home & Garden" },
];

const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Food"];

function FilterSidebar({ selectedCategories, setSelectedCategories, priceRange, setPriceRange }: { selectedCategories: string[]; setSelectedCategories: (categories: string[]) => void; priceRange: number[]; setPriceRange: (range: number[]) => void }) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={category} checked={selectedCategories.includes(category)} onCheckedChange={() => toggleCategory(category)} />
              <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <Slider value={priceRange} onValueChange={setPriceRange} max={300} step={10} className="mb-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setPriceRange([0, 300]);
        }}
      >
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 300]);

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-muted-foreground">Browse our collection of quality products</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <FilterSidebar selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} priceRange={priceRange} setPriceRange={setPriceRange} />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} priceRange={priceRange} setPriceRange={setPriceRange} />
                  </div>
                </SheetContent>
              </Sheet>

              <span className="text-sm text-muted-foreground">{sortedProducts.length} products</span>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, 300]);
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
