"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Loader2,
  GripVertical,
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

interface ProductAttribute {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect" | "color" | "date";
  value: unknown;
  options?: string[];
  unit?: string;
  required?: boolean;
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
  compareAtPrice?: number;
  cost: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold: number;
  category: string;
  images: string[];
  tags: string[];
  status: "draft" | "active" | "archived";
  attributes: ProductAttribute[];
  specifications: Record<string, unknown>;
  variants: ProductVariant[];
}

const ATTRIBUTE_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes/No" },
  { value: "select", label: "Single Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "color", label: "Color" },
  { value: "date", label: "Date" },
];

// Common attribute presets for quick addition
const ATTRIBUTE_PRESETS: Record<string, ProductAttribute[]> = {
  clothing: [
    { key: "size", label: "Size", type: "select", value: "", options: ["XS", "S", "M", "L", "XL", "XXL"] },
    { key: "color", label: "Color", type: "color", value: "#000000" },
    { key: "material", label: "Material", type: "text", value: "" },
    { key: "fit", label: "Fit", type: "select", value: "", options: ["Slim", "Regular", "Relaxed", "Oversized"] },
  ],
  electronics: [
    { key: "brand", label: "Brand", type: "text", value: "" },
    { key: "model", label: "Model", type: "text", value: "" },
    { key: "warranty", label: "Warranty (months)", type: "number", value: 12, unit: "months" },
    { key: "power", label: "Power Consumption", type: "number", value: 0, unit: "W" },
  ],
  food: [
    { key: "weight", label: "Weight", type: "number", value: 0, unit: "g" },
    { key: "organic", label: "Organic", type: "boolean", value: false },
    { key: "expiry", label: "Expiry Date", type: "date", value: "" },
    { key: "allergens", label: "Allergens", type: "multiselect", value: [], options: ["Gluten", "Dairy", "Nuts", "Soy", "Eggs"] },
  ],
};

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
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    compareAtPrice: undefined,
    cost: 0,
    sku: "",
    barcode: "",
    quantity: 0,
    lowStockThreshold: 10,
    category: "",
    images: [],
    tags: [],
    status: "draft",
    attributes: [],
    specifications: {},
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
      if (!res.ok) throw new Error(json.error || "Failed to upload image");

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, json.url],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
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
        console.error("Failed to fetch categories:", err);
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

  // Attribute management
  const addAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          key: "",
          label: "",
          type: "text",
          value: "",
          options: [],
          unit: "",
          required: false,
        },
      ],
    }));
  };

  const addAttributePreset = (preset: keyof typeof ATTRIBUTE_PRESETS) => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, ...ATTRIBUTE_PRESETS[preset]],
    }));
  };

  const updateAttribute = (index: number, updates: Partial<ProductAttribute>) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, ...updates } : attr
      ),
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // Specification management (free-form key-value)
  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Validation
      if (!formData.name.trim()) throw new Error("Product name is required");
      if (!formData.sku.trim()) throw new Error("SKU is required");
      if (!formData.category) throw new Error("Category is required");
      if (formData.price < 0) throw new Error("Price cannot be negative");
      if (formData.cost < 0) throw new Error("Cost cannot be negative");

      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Render attribute value input based on type
  const renderAttributeValueInput = (attr: ProductAttribute, index: number) => {
    switch (attr.type) {
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={attr.value as boolean}
              onCheckedChange={(checked) => updateAttribute(index, { value: checked })}
            />
            <span className="text-sm text-muted-foreground">
              {attr.value ? "Yes" : "No"}
            </span>
          </div>
        );
      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={attr.value as number}
              onChange={(e) => updateAttribute(index, { value: parseFloat(e.target.value) || 0 })}
              className="w-32"
            />
            {attr.unit && (
              <Input
                placeholder="Unit"
                value={attr.unit}
                onChange={(e) => updateAttribute(index, { unit: e.target.value })}
                className="w-20"
              />
            )}
          </div>
        );
      case "color":
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={attr.value as string}
              onChange={(e) => updateAttribute(index, { value: e.target.value })}
              className="h-9 w-16 cursor-pointer rounded border"
            />
            <Input
              value={attr.value as string}
              onChange={(e) => updateAttribute(index, { value: e.target.value })}
              className="w-28 font-mono text-sm"
            />
          </div>
        );
      case "date":
        return (
          <Input
            type="date"
            value={attr.value as string}
            onChange={(e) => updateAttribute(index, { value: e.target.value })}
            className="w-40"
          />
        );
      case "select":
        return (
          <div className="space-y-2">
            <Select
              value={attr.value as string}
              onValueChange={(value) => updateAttribute(index, { value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {attr.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Add option (comma separated)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.currentTarget;
                  const newOptions = input.value
                    .split(",")
                    .map((o) => o.trim())
                    .filter(Boolean);
                  updateAttribute(index, {
                    options: [...(attr.options || []), ...newOptions],
                  });
                  input.value = "";
                }
              }}
              className="text-xs"
            />
          </div>
        );
      case "multiselect":
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {(attr.value as string[] || []).map((v) => (
                <Badge key={v} variant="secondary" className="gap-1">
                  {v}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      updateAttribute(index, {
                        value: (attr.value as string[]).filter((x) => x !== v),
                      })
                    }
                  />
                </Badge>
              ))}
            </div>
            <Select
              value=""
              onValueChange={(value) =>
                updateAttribute(index, {
                  value: [...(attr.value as string[] || []), value],
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Add..." />
              </SelectTrigger>
              <SelectContent>
                {attr.options
                  ?.filter((opt) => !(attr.value as string[] || []).includes(opt))
                  .map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return (
          <Input
            value={attr.value as string}
            onChange={(e) => updateAttribute(index, { value: e.target.value })}
            placeholder="Value"
          />
        );
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
              {productId ? "Edit Product" : "Add Product"}
            </h1>
            <p className="text-muted-foreground">
              {productId ? "Update product details" : "Create a new product with dynamic attributes"}
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {productId ? "Update" : "Create"} Product
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
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core product details like name, description, and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Wireless Bluetooth Headphones"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
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

                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      value={formData.compareAtPrice || ""}
                      onChange={(e) =>
                        handleChange("compareAtPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      className="pl-7"
                      placeholder="Original price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => handleChange("cost", parseFloat(e.target.value) || 0)}
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
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Add product images. The first image will be used as the main image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
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
                      <span className="text-xs font-medium">Upload Image</span>
                    </>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Attributes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dynamic Attributes</CardTitle>
                  <CardDescription>
                    Add custom attributes like size, color, material, etc. These are typed and validated.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select onValueChange={(value) => addAttributePreset(value as keyof typeof ATTRIBUTE_PRESETS)}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Add preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                    <Plus className="mr-1 h-4 w-4" />
                    Custom
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {formData.attributes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No attributes added yet. Use presets or add custom attributes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-lg border bg-muted/30 p-4"
                    >
                      <GripVertical className="mt-2 h-5 w-5 cursor-grab text-muted-foreground" />
                      
                      <div className="grid flex-1 gap-4 sm:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Key</Label>
                          <Input
                            value={attr.key}
                            onChange={(e) =>
                              updateAttribute(index, {
                                key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                              })
                            }
                            placeholder="attribute_key"
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Label</Label>
                          <Input
                            value={attr.label}
                            onChange={(e) => updateAttribute(index, { label: e.target.value })}
                            placeholder="Display Name"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Type</Label>
                          <Select
                            value={attr.type}
                            onValueChange={(value) =>
                              updateAttribute(index, {
                                type: value as ProductAttribute["type"],
                                value: value === "boolean" ? false : value === "number" ? 0 : "",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ATTRIBUTE_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Value</Label>
                          {renderAttributeValueInput(attr, index)}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeAttribute(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Free-form Specifications (NoSQL Flexibility) */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>
                Add any key-value specifications. Perfect for technical specs, dimensions, etc.
                This uses MongoDB&apos;s flexible schema (Mixed type).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Key</Label>
                  <Input
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="e.g., Screen Size"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="e.g., 15.6 inches"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecification();
                      }
                    }}
                  />
                </div>
                <Button type="button" variant="outline" onClick={addSpecification}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {Object.keys(formData.specifications).length > 0 && (
                <div className="rounded-lg border">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b last:border-0">
                          <td className="px-4 py-2 font-medium">{key}</td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {String(value)}
                          </td>
                          <td className="px-2 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeSpecification(key)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
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
              <CardTitle>Inventory</CardTitle>
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
                    title="Generate SKU"
                  >
                    <span className="text-xs font-bold">GEN</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
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
                  Low stock warning
                </div>
              )}
              {formData.quantity === 0 && (
                <div className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  Out of stock
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
