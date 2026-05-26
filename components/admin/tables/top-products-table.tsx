import { formatCurrency } from "@/lib/utils/format";

const topProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    sales: 156,
    revenue: 15444,
    stock: 42,
  },
  {
    name: "Smart Fitness Watch",
    sku: "SFW-002",
    sales: 134,
    revenue: 26666,
    stock: 28,
  },
  {
    name: "Portable Power Bank 20000mAh",
    sku: "PPB-003",
    sales: 98,
    revenue: 4900,
    stock: 65,
  },
  {
    name: "USB-C Hub Multiport Adapter",
    sku: "UCH-004",
    sales: 87,
    revenue: 5220,
    stock: 120,
  },
  {
    name: "Mechanical Gaming Keyboard",
    sku: "MGK-005",
    sales: 72,
    revenue: 7920,
    stock: 15,
  },
];

export function TopProductsTable() {
  return (
    <div className="space-y-4">
      {topProducts.map((product, index) => (
        <div key={product.sku} className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{index + 1}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{product.name}</div>
            <div className="text-xs text-muted-foreground">{product.sku}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{formatCurrency(product.revenue)}</div>
            <div className="text-xs text-muted-foreground">{product.sales} sales</div>
          </div>
        </div>
      ))}
    </div>
  );
}
