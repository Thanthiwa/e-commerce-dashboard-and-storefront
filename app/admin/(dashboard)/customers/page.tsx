"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Eye, Mail, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// Demo data
const customers = [
  { id: "1", name: "John Smith", email: "john@example.com", orders: 12, spent: 1549.88, lastOrder: "2024-05-21", segment: "Champions" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", orders: 8, spent: 892.5, lastOrder: "2024-05-21", segment: "Loyal" },
  { id: "3", name: "Michael Brown", email: "michael@example.com", orders: 3, spent: 267.97, lastOrder: "2024-05-20", segment: "Potential" },
  { id: "4", name: "Emily Davis", email: "emily@example.com", orders: 1, spent: 459.0, lastOrder: "2024-05-20", segment: "New" },
  { id: "5", name: "David Wilson", email: "david@example.com", orders: 5, spent: 599.95, lastOrder: "2024-05-19", segment: "Loyal" },
  { id: "6", name: "Lisa Anderson", email: "lisa@example.com", orders: 2, spent: 159.98, lastOrder: "2024-05-19", segment: "Potential" },
  { id: "7", name: "James Taylor", email: "james@example.com", orders: 15, spent: 2499.85, lastOrder: "2024-05-18", segment: "Champions" },
  { id: "8", name: "Jennifer Martinez", email: "jennifer@example.com", orders: 1, spent: 0, lastOrder: "2024-05-18", segment: "Lost" },
  { id: "9", name: "Robert Garcia", email: "robert@example.com", orders: 6, spent: 789.94, lastOrder: "2024-04-15", segment: "At-Risk" },
  { id: "10", name: "Amanda Thompson", email: "amanda@example.com", orders: 4, spent: 399.96, lastOrder: "2024-03-10", segment: "At-Risk" },
];

const segmentStyles: Record<string, string> = {
  Champions: "bg-emerald-500/10 text-emerald-500",
  Loyal: "bg-blue-500/10 text-blue-500",
  Potential: "bg-purple-500/10 text-purple-500",
  New: "bg-cyan-500/10 text-cyan-500",
  "At-Risk": "bg-yellow-500/10 text-yellow-500",
  Lost: "bg-red-500/10 text-red-500",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">View and manage your customer base</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.filter((c) => c.segment === "Champions" || c.segment === "Loyal").length}</div>
            <p className="text-xs text-muted-foreground">VIP Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.filter((c) => c.segment === "At-Risk" || c.segment === "Lost").length}</div>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(customers.reduce((sum, c) => sum + c.spent, 0) / customers.length)}</div>
            <p className="text-xs text-muted-foreground">Avg. Lifetime Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="Champions">Champions</SelectItem>
                <SelectItem value="Loyal">Loyal</SelectItem>
                <SelectItem value="Potential">Potential</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="At-Risk">At-Risk</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{customer.orders}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(customer.spent)}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.lastOrder}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(segmentStyles[customer.segment])}>
                      {customer.segment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="mr-2 h-4 w-4" />
                          Add Tag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
