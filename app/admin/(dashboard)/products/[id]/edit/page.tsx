"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/forms/product-form";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          throw new Error("ไม่พบสินค้า");
        }
        const data = await res.json();
        // Transform the data for the form
        setProduct({
          ...data,
          category: data.category?._id || data.category,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "โหลดสินค้าไม่สำเร็จ");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return <ProductForm initialData={product || undefined} productId={productId} />;
}
