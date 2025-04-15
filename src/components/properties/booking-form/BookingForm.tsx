
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import GuestInfoFields from "./form-fields/GuestInfoFields";
import BookingDateFields from "./form-fields/BookingDateFields";
import BookingDetailsFields from "./form-fields/BookingDetailsFields";
import { bookingFormSchema } from "./schema";

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  propertyId: number;
  propertyName: string;
  initialData?: Partial<BookingFormValues>;
  onSubmit: (data: BookingFormValues) => void;
}

const BookingForm = ({ 
  propertyId,
  propertyName,
  initialData = {}, 
  onSubmit 
}: BookingFormProps) => {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestName: "",
      email: "",
      phone: "",
      guests: 2,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week stay
      status: "Confirmed",
      specialRequests: "",
      propertyId: propertyId,
      propertyName: propertyName,
      ...initialData,
    },
  });

  const handleSubmit = (data: BookingFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GuestInfoFields form={form} />
          <BookingDateFields form={form} />
          <BookingDetailsFields form={form} />
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit">Create Booking</Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;
