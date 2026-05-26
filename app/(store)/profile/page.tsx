"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, MapPin, Trash2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dialog State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
  });

  const [addressData, setAddressData] = useState({
    type: "shipping",
    isDefault: false,
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "TH",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/storefront/profile");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setFormData({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        phone: data.user.phone || "",
        avatar: data.user.avatar || "",
      });
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/storefront/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }
      
      setUser(data.user);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    setAddressSaving(true);

    try {
      const res = await fetch("/api/storefront/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddressError(data.error || "Failed to add address");
        return;
      }

      setUser({ ...user, addresses: data.addresses });
      setIsAddressModalOpen(false);
      setAddressData({
        type: "shipping",
        isDefault: false,
        fullName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "TH",
        phone: "",
      });
    } catch (err) {
      setAddressError("An error occurred while saving address");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const res = await fetch(`/api/storefront/profile/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, addresses: data.addresses });
      }
    } catch (error) {
      console.error("Failed to delete address", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8 flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar || ""} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert className="bg-emerald-50 text-emerald-600 border-emerald-200"><AlertDescription>{success}</AlertDescription></Alert>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Cannot be changed)</Label>
                  <Input id="email" value={user.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar Image URL</Label>
                  <Input id="avatar" value={formData.avatar} onChange={(e) => setFormData({...formData, avatar: e.target.value})} placeholder="https://example.com/my-avatar.png" />
                </div>

                <Button type="submit" disabled={saving || user.id === "demo-customer-id"}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
                {user.id === "demo-customer-id" && (
                  <p className="text-sm text-amber-600 mt-2">Demo users cannot update their profile.</p>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Addresses</CardTitle>
                <CardDescription>Manage your shipping and billing addresses.</CardDescription>
              </div>
              <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                <DialogTrigger asChild>
                  <Button disabled={user.id === "demo-customer-id"}>
                    <Plus className="h-4 w-4 mr-2" /> Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddressSubmit} className="space-y-4 py-4">
                    {addressError && <Alert variant="destructive"><AlertDescription>{addressError}</AlertDescription></Alert>}
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" required value={addressData.fullName} onChange={(e) => setAddressData({...addressData, fullName: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address (Street, Appt, etc.)</Label>
                      <Input id="address" required value={addressData.address} onChange={(e) => setAddressData({...addressData, address: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" required value={addressData.city} onChange={(e) => setAddressData({...addressData, city: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input id="state" required value={addressData.state} onChange={(e) => setAddressData({...addressData, state: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input id="postalCode" required value={addressData.postalCode} onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" required value={addressData.country} onChange={(e) => setAddressData({...addressData, country: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressPhone">Phone (Optional)</Label>
                      <Input id="addressPhone" value={addressData.phone} onChange={(e) => setAddressData({...addressData, phone: e.target.value})} />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={addressSaving}>
                        {addressSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Address
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {user.id === "demo-customer-id" && (
                <Alert className="mb-4 bg-amber-50 text-amber-600 border-amber-200">
                  <AlertDescription>Demo users cannot modify addresses.</AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                {user.addresses?.map((address: any) => (
                  <Card key={address._id || address.address} className="relative overflow-hidden">
                    {address.isDefault && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-medium">
                        Default
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-muted-foreground">{address.address}</p>
                          <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.postalCode}</p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                          {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-600" disabled={user.id === "demo-customer-id"} onClick={() => handleDeleteAddress(address._id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(!user.addresses || user.addresses.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    You haven't saved any addresses yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
