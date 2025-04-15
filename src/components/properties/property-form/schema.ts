
import * as z from "zod";

// Create a schema for property data
export const propertySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  type: z.string().min(2, "Type must be at least 2 characters"),
  status: z.string(),
  bedrooms: z.coerce.number().int().min(1, "Must have at least 1 bedroom"),
  bathrooms: z.coerce.number().min(1, "Must have at least 1 bathroom"),
  price: z.coerce.number().min(50, "Price must be at least €50"),
  max_guests: z.coerce.number().int().min(1, "Maximum guests must be at least 1"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
