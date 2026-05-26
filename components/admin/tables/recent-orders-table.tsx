import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  email?: string;
  total: number;
  status: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
  refunded: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังเตรียม",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งถึงแล้ว",
  cancelled: "ยกเลิกแล้ว",
  refunded: "คืนเงินแล้ว",
};

export function RecentOrdersTable({ orders = [] }: { orders?: RecentOrder[] }) {
  if (orders.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีคำสั่งซื้อ</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{order.customer}</span>
              <span className="text-xs text-muted-foreground">{order.orderNumber}</span>
            </div>
            <span className="truncate text-xs text-muted-foreground">{order.email || "-"}</span>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="text-sm font-medium">{formatCurrency(order.total)}</span>
            <Badge variant="secondary" className={cn(statusStyles[order.status])}>
              {statusLabels[order.status] || order.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
