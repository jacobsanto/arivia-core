import { format } from "date-fns";
import { GuestyProperty, GuestyReservation, GuestyTask } from "./types";
import { Property } from "@/hooks/useProperties";

/**
 * Adapters to transform Guesty API responses to our internal app models
 */

/**
 * Converts a GuestyProperty to our internal Property model
 */
export const adaptGuestyProperty = (guestyProperty: GuestyProperty): Property => {
  return {
    id: guestyProperty._id,
    name: guestyProperty.title,
    location: guestyProperty.address?.city || 'Greece',
    address: guestyProperty.address.full,
    description: "",
    imageUrl: guestyProperty.picture?.large || guestyProperty.picture?.regular || '/placeholder.svg',
    status: guestyProperty.active ? "active" : "inactive",
    type: "Luxury Villa",
    price: guestyProperty.price || 0,
    price_per_night: guestyProperty.price || 0,
    max_guests: guestyProperty.accommodates,
    bedrooms: guestyProperty.bedrooms,
    bathrooms: guestyProperty.bathrooms,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    guesty_id: guestyProperty._id,
    guesty_data: guestyProperty // Store the complete Guesty data for future reference
  };
};

/**
 * Converts a GuestyReservation to our internal Booking model
 */
export const adaptGuestyReservation = (guestyReservation: GuestyReservation) => {
  return {
    id: guestyReservation._id,
    property_id: guestyReservation.listing._id,
    check_in_date: guestyReservation.checkInDateLocalized,
    check_out_date: guestyReservation.checkOutDateLocalized,
    num_guests: guestyReservation.guestCount,
    total_price: guestyReservation.money.totalPrice,
    guest_name: guestyReservation.guest.fullName,
    guest_email: guestyReservation.guest.email,
    guest_phone: guestyReservation.guest.phone || null,
    status: adaptGuestyReservationStatus(guestyReservation.status),
    created_at: guestyReservation.createdAt,
    updated_at: guestyReservation.updatedAt,
    guesty_id: guestyReservation._id,
    guesty_data: guestyReservation // Store the complete Guesty data for future reference
  };
};

/**
 * Converts Guesty reservation status to our internal status
 */
const adaptGuestyReservationStatus = (guestyStatus: string): string => {
  switch (guestyStatus) {
    case 'confirmed':
      return 'confirmed';
    case 'inquiry':
      return 'inquiry';
    case 'pendingOwnerConfirmation':
      return 'pending';
    case 'canceled':
      return 'cancelled';
    case 'declined':
      return 'declined';
    default:
      return 'pending';
  }
};

/**
 * Converts a GuestyTask to our internal Task model (for housekeeping/maintenance)
 */
export const adaptGuestyTask = (guestyTask: GuestyTask, taskType: 'housekeeping' | 'maintenance') => {
  const baseTask = {
    id: guestyTask._id,
    property_id: guestyTask.listing?._id || '',
    assigned_to: guestyTask.assignee?._id || null,
    due_date: guestyTask.dueDate,
    title: guestyTask.title,
    description: guestyTask.description || '',
    status: adaptGuestyTaskStatus(guestyTask.status),
    priority: adaptGuestyTaskPriority(guestyTask.priority),
    created_at: guestyTask.createdAt,
    updated_at: guestyTask.updatedAt,
    guesty_id: guestyTask._id,
    guesty_data: guestyTask // Store the complete Guesty data for future reference
  };
  
  if (taskType === 'maintenance') {
    return {
      ...baseTask,
      required_tools: '',
      location: '',
    };
  }
  
  return baseTask;
};

/**
 * Converts Guesty task status to our internal status
 */
const adaptGuestyTaskStatus = (guestyStatus: string): string => {
  switch (guestyStatus) {
    case 'pending':
      return 'pending';
    case 'inProgress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'canceled':
      return 'cancelled';
    default:
      return 'pending';
  }
};

/**
 * Converts Guesty task priority to our internal priority
 */
const adaptGuestyTaskPriority = (guestyPriority: string): string => {
  switch (guestyPriority) {
    case 'low':
      return 'low';
    case 'normal':
      return 'normal';
    case 'high':
      return 'high';
    case 'urgent':
      return 'urgent';
    default:
      return 'normal';
  }
};

/**
 * Format a date according to Guesty API requirements
 */
export const formatGuestyDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
};
