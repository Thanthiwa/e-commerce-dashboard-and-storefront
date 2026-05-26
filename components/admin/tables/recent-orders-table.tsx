import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const recentOrders = [
  {
    id: "ORD-240521-0001",
    customer: "John Smith",
    email: "john@example.com",
    total: 299.99,
    status: "delivered",
    date: "2024-05-21",
  },
  {
    id: "ORD-240521-0002",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    total: 149.5,
    status: "shipped",
    date: "2024-05-21",
  },
  {
    id: "ORD-240520-0015",
    customer: "Michael Brown",
    email: "michael@example.com",
    total: 89.99,
    status: "processing",
    date: "2024-05-20",
  },
  {
    id: "ORD-240520-0014",
    customer: "Emily Davis",
    email: "emily@example.com",
    total: 459.0,
    status: "pending",
    date: "2024-05-20",
  },
  {
    id: "ORD-240519-0022",
    customer: "David Wilson",
    email: "david@example.com",
    total: 199.99,
    status: "cancelled",
    date: "2024-05-19",
  },
];

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export function RecentOrdersTable() {
  return (
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{order.customer}</span>
              <span className="text-xs text-muted-foreground">{order.id}</span>
            </div>
            <span className="text-xs text-muted-foreground">{order.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
            <Badge variant="secondary" className={cn("capitalize", statusStyles[order.status])}>
              {order.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
