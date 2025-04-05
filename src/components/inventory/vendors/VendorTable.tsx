
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Vendor } from "../orders/OrderUtils";

interface VendorTableProps {
  vendors: Vendor[];
  onEditVendor: (vendor: Vendor) => void;
  onDeleteVendor: (id: string) => void;
}

const VendorTable = ({ vendors, onEditVendor, onDeleteVendor }: VendorTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Categories</TableHead>
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
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {vendor.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="mr-1 mb-1">
                    {category}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>{vendor.email}</TableCell>
            <TableCell>{vendor.phone}</TableCell>
            <TableCell>
              <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
                {vendor.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => onEditVendor(vendor)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => onDeleteVendor(vendor.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VendorTable;
