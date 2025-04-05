
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type VendorStatus = "active" | "inactive";

type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  notes: string;
  status: VendorStatus;
};

// Sample vendor data - in a real app this would come from a database
const initialVendors: Vendor[] = [
  {
    id: "1",
    name: "Office Supplies Co.",
    email: "orders@officesupplies.com",
    phone: "555-123-4567",
    category: "Office Supplies",
    address: "123 Business Ave, Suite 101",
    notes: "Preferred supplier for paper products",
    status: "active",
  },
  {
    id: "2",
    name: "Cleaning Solutions Inc.",
    email: "sales@cleaningsolutions.com",
    phone: "555-987-6543",
    category: "Cleaning Supplies",
    address: "456 Industrial Blvd",
    notes: "Eco-friendly products available",
    status: "active",
  },
  {
    id: "3",
    name: "Hospitality Essentials",
    email: "orders@hospitalityessentials.com",
    phone: "555-567-8901",
    category: "Guest Amenities",
    address: "789 Hospitality Way",
    notes: "Bulk discounts available",
    status: "inactive",
  },
];

const VendorsList = () => {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Omit<Vendor, "id">>({
    name: "",
    email: "",
    phone: "",
    category: "",
    address: "",
    notes: "",
    status: "active",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "status") {
        // Ensure the status is explicitly typed as VendorStatus
        return { ...prev, [name]: value as VendorStatus };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddVendor = () => {
    setCurrentVendor(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "",
      address: "",
      notes: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      address: vendor.address,
      notes: vendor.notes,
      status: vendor.status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteVendor = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      setVendors(vendors.filter((vendor) => vendor.id !== id));
      toast({
        title: "Vendor Deleted",
        description: "The vendor has been removed from your list.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields.",
        variant: "destructive",
      });
      return;
    }

    if (currentVendor) {
      // Editing existing vendor
      setVendors(
        vendors.map((vendor) =>
          vendor.id === currentVendor.id ? { ...vendor, ...formData } : vendor
        )
      );
      toast({
        title: "Vendor Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Adding new vendor
      const newVendor = {
        ...formData,
        id: Date.now().toString(),
      };
      setVendors([...vendors, newVendor]);
      toast({
        title: "Vendor Added",
        description: `${formData.name} has been added to your vendors list.`,
      });
    }
    
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Vendors</CardTitle>
        <Button onClick={handleAddVendor}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phone}</TableCell>
                <TableCell>
                  <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
                    {vendor.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditVendor(vendor)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteVendor(vendor.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
            <DialogDescription>
              {currentVendor ? "Update vendor details" : "Add a new supplier to your inventory system"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Vendor Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentVendor ? "Update Vendor" : "Add Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VendorsList;
