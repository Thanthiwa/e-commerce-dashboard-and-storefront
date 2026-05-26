"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Loader2,
  X,
  AlertCircle,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  name: string;
  options: string[];
  price?: number;
  quantity?: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold: number;
  category: string;
  images: string[];
  tags: string[];
  status: "draft" | "active" | "archived";
  variants: ProductVariant[];
}


interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    sku: "",
    barcode: "",
    quantity: 0,
    lowStockThreshold: 10,
    category: "",
    images: [],
    tags: [],
    status: "draft",
    variants: [],
    ...initialData,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "อัปโหลดรูปภาพไม่สำเร็จ");

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, json.url],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again if needed
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("โหลดหมวดหมู่ไม่สำเร็จ:", err);
      }
    };
    fetchCategories();
  }, []);

  // Generate SKU from name
  const generateSku = () => {
    if (!formData.name) return;
    const prefix = formData.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${random}` }));
  };

  // Handle form field changes
  const handleChange = (
    field: keyof ProductFormData,
    value: unknown
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Validation
      if (!formData.name.trim()) throw new Error("กรุณากรอกชื่อสินค้า");
      if (!formData.sku.trim()) throw new Error("กรุณากรอก SKU");
      if (!formData.category) throw new Error("กรุณาเลือกหมวดหมู่");
      if (formData.price < 0) throw new Error("ราคาต้องไม่ติดลบ");

      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";
      const payload = { ...formData } as Record<string, unknown>;
      delete payload.attributes;
      delete payload.specifications;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "บันทึกสินค้าไม่สำเร็จ");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {productId ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
            </h1>
            <p className="text-muted-foreground">
              {productId ? "อัปเดตรายละเอียดสินค้า" : "สร้างสินค้าใหม่"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">ฉบับร่าง</SelectItem>
              <SelectItem value="active">เปิดขาย</SelectItem>
              <SelectItem value="archived">เก็บถาวร</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {productId ? "อัปเดต" : "สร้าง"}สินค้า
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              <CardDescription>
                รายละเอียดหลัก เช่น ชื่อสินค้า คำอธิบาย และราคา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อสินค้า *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="เช่น หูฟังบลูทูธไร้สาย"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="อธิบายรายละเอียดสินค้า..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">ราคา *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ฿
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                      className="pl-7"
                    />
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Media (Images) */}
          <Card>
            <CardHeader>
              <CardTitle>สื่อสินค้า</CardTitle>
              <CardDescription>
                เพิ่มรูปภาพสินค้า โดยรูปแรกจะใช้เป็นรูปหลัก
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`รูปสินค้า ${index + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Label
                  htmlFor="image-upload"
                  className={cn(
                    "flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground hover:bg-muted/50 transition-colors",
                    isUploading && "pointer-events-none opacity-50"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-xs font-medium">อัปโหลดรูป</span>
                    </>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-label="อัปโหลดรูปสินค้า"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </Label>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>การจัดหมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>หมวดหมู่ *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>แท็ก</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="เพิ่มแท็ก"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer gap-1"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>คลังสินค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value.toUpperCase())}
                    placeholder="SKU-001"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateSku}
                    title="สร้าง SKU"
                  >
                    <span className="text-xs font-bold">สร้าง</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">บาร์โค้ด</Label>
                <Input
                  id="barcode"
                  value={formData.barcode || ""}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                  placeholder="UPC / EAN"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="quantity">จำนวน</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">แจ้งเตือนสต็อกต่ำ</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      handleChange("lowStockThreshold", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              {formData.quantity <= formData.lowStockThreshold && formData.quantity > 0 && (
                <div className="rounded bg-yellow-500/10 px-3 py-2 text-sm text-yellow-600">
                  สต็อกใกล้หมด
                </div>
              )}
              {formData.quantity === 0 && (
                <div className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  สินค้าหมด
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
