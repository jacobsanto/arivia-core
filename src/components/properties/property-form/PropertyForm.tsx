
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { propertySchema, PropertyFormValues } from "./schema";
import BasicInfoFields from "./form-fields/BasicInfoFields";
import LocationFields from "./form-fields/LocationFields";
import StatusAndDetailsFields from "./form-fields/StatusAndDetailsFields";
import CapacityAndPricingFields from "./form-fields/CapacityAndPricingFields";
import MediaAndDescriptionFields from "./form-fields/MediaAndDescriptionFields";

interface PropertyFormProps {
  onSubmit: (data: PropertyFormValues) => void;
  initialData?: Partial<PropertyFormValues>;
}

const PropertyForm = ({ onSubmit, initialData }: PropertyFormProps) => {
  // Create form with validation
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      location: initialData?.location || "Santorini, Greece", // Default
      type: initialData?.type || "Luxury Villa", // Default
      status: initialData?.status || "Vacant",
      bedrooms: initialData?.bedrooms || 3,
      bathrooms: initialData?.bathrooms || 2,
      price: initialData?.price || 300,
      max_guests: initialData?.max_guests || 6,
      imageUrl: initialData?.imageUrl || "/placeholder.svg",
      description: initialData?.description || "",
    },
  });

  const handleSubmit = (values: PropertyFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BasicInfoFields form={form} />
          <LocationFields form={form} />
          <StatusAndDetailsFields form={form} />
          <CapacityAndPricingFields form={form} />
          <MediaAndDescriptionFields form={form} />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">Save Property</Button>
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;
