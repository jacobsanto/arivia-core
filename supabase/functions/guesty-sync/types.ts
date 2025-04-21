
export interface GuestyListing {
  _id: string;
  title: string;
  address?: {
    full?: string;
  };
  status?: string;
  propertyType?: string;
  picture?: {
    thumbnail?: string;
  };
}

export interface GuestyBooking {
  _id: string;
  guest: {
    fullName: string;
  };
  checkIn: string;
  checkOut: string;
  status: string;
  listing: {
    _id: string;
  };
}

export interface BookingObject {
  id: string;
  property_id: string;
  listing_id?: string;
  check_in_date: string | Date;
  check_out_date: string | Date;
  guest_name: string;
  [key: string]: any;
}

export interface TaskGenerationResult {
  tasksCreated: {
    id: string;
    task_type: string;
    due_date: string;
  }[];
  tasksSkipped: {
    task_type: string;
    due_date: string;
    reason: string;
  }[];
  manual_schedule_required: boolean;
}
