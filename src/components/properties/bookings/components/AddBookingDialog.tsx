
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BookingForm from "../../booking-form";
import { BookingFormValues } from "../../booking-form/schema";

interface AddBookingDialogProps {
  propertyId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddBookingDialog = ({ 
  propertyId, 
  isOpen, 
  onOpenChange 
}: AddBookingDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <BookingForm 
            propertyId={parseInt(propertyId, 10) || 0} 
            propertyName="" 
            onSubmit={(data: BookingFormValues) => {
              console.log("Booking form submitted:", data);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
