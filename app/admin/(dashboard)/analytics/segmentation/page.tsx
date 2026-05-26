"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

// Demo RFM segmentation data
const segmentData = [
  { name: "Champions", count: 156, revenue: 285000, avgOrderValue: 125, color: "oklch(0.696 0.17 162.48)" },
  { name: "Loyal", count: 234, revenue: 198000, avgOrderValue: 95, color: "oklch(0.488 0.243 264.376)" },
  { name: "Potential", count: 312, revenue: 145000, avgOrderValue: 72, color: "oklch(0.627 0.265 303.9)" },
  { name: "New", count: 189, revenue: 67000, avgOrderValue: 58, color: "oklch(0.769 0.188 70.08)" },
  { name: "At-Risk", count: 156, revenue: 89000, avgOrderValue: 85, color: "oklch(0.828 0.189 84.429)" },
  { name: "Lost", count: 98, revenue: 12000, avgOrderValue: 45, color: "oklch(0.645 0.246 16.439)" },
];

// RFM scatter data (recency vs monetary)
const rfmScatterData = [
  // Champions (high monetary, low recency)
  { x: 5, y: 850, segment: "Champions" },
  { x: 8, y: 1200, segment: "Champions" },
  { x: 12, y: 950, segment: "Champions" },
  { x: 7, y: 1100, segment: "Champions" },
  { x: 10, y: 780, segment: "Champions" },
  // Loyal
  { x: 15, y: 650, segment: "Loyal" },
  { x: 20, y: 580, segment: "Loyal" },
  { x: 18, y: 720, segment: "Loyal" },
  { x: 22, y: 490, segment: "Loyal" },
  // Potential
  { x: 30, y: 350, segment: "Potential" },
  { x: 35, y: 280, segment: "Potential" },
  { x: 28, y: 420, segment: "Potential" },
  // New
  { x: 5, y: 120, segment: "New" },
  { x: 8, y: 85, segment: "New" },
  { x: 3, y: 150, segment: "New" },
  // At-Risk
  { x: 60, y: 680, segment: "At-Risk" },
  { x: 75, y: 520, segment: "At-Risk" },
  { x: 90, y: 450, segment: "At-Risk" },
  // Lost
  { x: 120, y: 180, segment: "Lost" },
  { x: 150, y: 95, segment: "Lost" },
  { x: 180, y: 50, segment: "Lost" },
];

const segmentColors: Record<string, string> = {
  Champions: "oklch(0.696 0.17 162.48)",
  Loyal: "oklch(0.488 0.243 264.376)",
  Potential: "oklch(0.627 0.265 303.9)",
  New: "oklch(0.769 0.188 70.08)",
  "At-Risk": "oklch(0.828 0.189 84.429)",
  Lost: "oklch(0.645 0.246 16.439)",
};

const segmentBadgeStyles: Record<string, string> = {
  Champions: "bg-emerald-500/10 text-emerald-500",
  Loyal: "bg-blue-500/10 text-blue-500",
  Potential: "bg-purple-500/10 text-purple-500",
  New: "bg-cyan-500/10 text-cyan-500",
  "At-Risk": "bg-yellow-500/10 text-yellow-500",
  Lost: "bg-red-500/10 text-red-500",
};

export default function SegmentationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customer Segmentation</h1>
        <p className="text-muted-foreground">RFM analysis and customer behavior clustering</p>
      </div>

      {/* Segment Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {segmentData.map((segment) => (
          <Card key={segment.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className={cn(segmentBadgeStyles[segment.name])}>
                  {segment.name}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{segment.count}</div>
              <p className="text-xs text-muted-foreground">customers</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* RFM Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle>RFM Distribution</CardTitle>
            <CardDescription>Customer segments by Recency (days) vs Monetary value ($)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0 0)" />
                <XAxis type="number" dataKey="x" name="Recency" unit=" days" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} label={{ value: "Days Since Last Purchase", position: "bottom", fill: "oklch(0.65 0 0)" }} />
                <YAxis type="number" dataKey="y" name="Monetary" unit="$" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} label={{ value: "Total Spend ($)", angle: -90, position: "left", fill: "oklch(0.65 0 0)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0 0)",
                    border: "1px solid oklch(0.26 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.985 0 0)",
                  }}
                  formatter={(value: number, name: string) => [name === "x" ? `${value} days` : `$${value}`, name === "x" ? "Recency" : "Monetary"]}
                />
                <Scatter name="Customers" data={rfmScatterData}>
                  {rfmScatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={segmentColors[entry.segment]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segment Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Segment Distribution</CardTitle>
            <CardDescription>Customer count by segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={segmentData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="count" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0 0)",
                    border: "1px solid oklch(0.26 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.985 0 0)",
                  }}
                  formatter={(value: number) => [value, "Customers"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Segment */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Segment</CardTitle>
          <CardDescription>Total revenue contribution from each customer segment</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0 0)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0 0)",
                  border: "1px solid oklch(0.26 0 0)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Segment Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Analysis</CardTitle>
          <CardDescription>Detailed metrics for each customer segment</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead className="text-center">Customers</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Avg. Order Value</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead>Recommended Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segmentData.map((segment) => (
                <TableRow key={segment.name}>
                  <TableCell>
                    <Badge variant="secondary" className={cn(segmentBadgeStyles[segment.name])}>
                      {segment.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{segment.count}</TableCell>
                  <TableCell className="text-right font-medium">${segment.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${segment.avgOrderValue}</TableCell>
                  <TableCell className="text-right">{((segment.count / segmentData.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {segment.name === "Champions" && "Reward loyalty, exclusive offers"}
                    {segment.name === "Loyal" && "Upsell premium products"}
                    {segment.name === "Potential" && "Increase engagement"}
                    {segment.name === "New" && "Onboarding campaigns"}
                    {segment.name === "At-Risk" && "Win-back campaigns"}
                    {segment.name === "Lost" && "Reactivation offers"}
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
