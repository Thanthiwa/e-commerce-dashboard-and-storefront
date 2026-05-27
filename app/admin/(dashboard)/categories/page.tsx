"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
  status: string;
  description?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500",
  inactive: "bg-gray-500/10 text-gray-500",
};

const statusLabels: Record<string, string> = {
  active: "ใช้งาน",
  inactive: "ปิดใช้งาน",
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/categories?all=true");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "ไม่สามารถโหลดหมวดหมู่ได้");
        }
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "ไม่สามารถโหลดหมวดหมู่ได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleEdit = (category: CategoryItem) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description || "");
    setError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    setDeletingId(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    setIsSaving(true);
    try {
      const isEditing = editingId !== null;
      const url = isEditing ? `/api/categories?id=${editingId}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";
      const body = { name: name.trim(), description: description.trim() };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEditing ? "ไม่สามารถแก้ไขหมวดหมู่ได้" : "ไม่สามารถสร้างหมวดหมู่ได้"));
      }
      if (isEditing) {
        setCategories((prev) => prev.map((cat) => (cat._id === editingId ? data : cat)));
      } else {
        setCategories((prev) => [data, ...prev]);
      }
      setName("");
      setDescription("");
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : (editingId !== null ? "ไม่สามารถแก้ไขหมวดหมู่ได้" : "ไม่สามารถสร้างหมวดหมู่ได้"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/categories?id=${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถลบหมวดหมู่ได้");
      }
      setCategories((prev) => prev.filter((cat) => cat._id !== deletingId));
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถลบหมวดหมู่ได้");
      setIsDeleteDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">หมวดหมู่</h1>
          <p className="text-muted-foreground">จัดหมวดหมู่สินค้าให้เป็นระเบียบ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setName("");
              setDescription("");
              setError(null);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มหมวดหมู่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</DialogTitle>
              <DialogDescription>{editingId ? "แก้ไขรายละเอียดหมวดหมู่" : "สร้างหมวดหมู่ใหม่เพื่อจัดสินค้าให้เป็นระเบียบ"}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">ชื่อหมวดหมู่</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อหมวดหมู่" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="คำอธิบายหมวดหมู่" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                ยกเลิก
              </Button>
              <Button type="button" disabled={isSaving} onClick={handleSave}>
                {isSaving ? "กำลังบันทึก..." : (editingId ? "บันทึกการแก้ไข" : "สร้างหมวดหมู่")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ค้นหาหมวดหมู่..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category, i) => (
          <Card key={category._id || category.slug || i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderTree className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">/{category.slug}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(category)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    แก้ไข
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(category._id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  <span className="font-semibold">{category.productCount}</span> สินค้า
                </span>
                <Badge variant="secondary" className={cn(statusStyles[category.status])}>
                  {statusLabels[category.status] || category.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบหมวดหมู่</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือว่าต้องการลบหมวดหมู่นี้? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSaving}>
            {isSaving ? "กำลังลบ..." : "ลบ"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
