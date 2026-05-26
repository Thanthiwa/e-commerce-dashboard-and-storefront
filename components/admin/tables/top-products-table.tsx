import { formatCurrency } from "@/lib/utils/format";

interface TopProduct {
  id: string;
  name: string;
  sku?: string;
  sales: number;
  revenue: number;
  stock?: number;
}

export function TopProductsTable({ products = [] }: { products?: TopProduct[] }) {
  if (products.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลสินค้าขายดี</div>;
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.id || product.sku || product.name} className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{index + 1}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground">
              {product.sku || "-"}
              {typeof product.stock === "number" ? ` · คงเหลือ ${product.stock}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{formatCurrency(product.revenue)}</div>
            <div className="text-xs text-muted-foreground">ขายแล้ว {product.sales} ชิ้น</div>
          </div>
        </div>
      ))}
    </div>
  );
}
