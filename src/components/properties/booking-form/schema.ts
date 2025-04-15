
import { z } from "zod";

export const bookingFormSchema = z.object({
  guestName: z.string().min(2, "Guest name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  guests: z.coerce.number().int().positive("Number of guests is required"),
  checkIn: z.date({
    required_error: "Check-in date is required",
  }),
  checkOut: z.date({
    required_error: "Check-out date is required",
  }).refine(date => date > new Date(), {
    message: "Check-out date must be in the future",
  }),
  status: z.string(),
  specialRequests: z.string().optional(),
  propertyId: z.number(),
  propertyName: z.string()
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
